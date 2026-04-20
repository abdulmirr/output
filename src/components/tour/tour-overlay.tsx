'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { useTourStore } from '@/stores/tour-store';
import { useResolvedStep } from './use-tour';
import { TourSpotlight } from './tour-spotlight';
import { TourArrow } from './tour-arrow';
import { TourCard } from './tour-card';
import { updateTourProgress } from '@/app/onboarding/actions';
import type { ResolvedStep, CardPlacement } from '@/lib/tour/tour-types';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const CARD_W = 320;
const CARD_H_ESTIMATE = 170;
const MARGIN = 16;
const GUTTER = 24;

function getTargetRect(el: HTMLElement | null): Rect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function resolvePlacement(
  placement: CardPlacement | undefined,
  rect: Rect,
  vw: number,
  vh: number
): 'top' | 'bottom' | 'left' | 'right' {
  if (placement && placement !== 'auto') return placement;
  const spaceBottom = vh - (rect.y + rect.height);
  const spaceTop = rect.y;
  const spaceRight = vw - (rect.x + rect.width);
  const spaceLeft = rect.x;
  const entries: Array<['top' | 'bottom' | 'left' | 'right', number]> = [
    ['bottom', spaceBottom],
    ['right', spaceRight],
    ['top', spaceTop],
    ['left', spaceLeft],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function cardPosition(rect: Rect, side: 'top' | 'bottom' | 'left' | 'right', vw: number, vh: number) {
  let top = 0;
  let left = 0;
  if (side === 'bottom') {
    top = rect.y + rect.height + GUTTER;
    left = rect.x + rect.width / 2 - CARD_W / 2;
  } else if (side === 'top') {
    top = rect.y - CARD_H_ESTIMATE - GUTTER;
    left = rect.x + rect.width / 2 - CARD_W / 2;
  } else if (side === 'right') {
    left = rect.x + rect.width + GUTTER;
    top = rect.y + rect.height / 2 - CARD_H_ESTIMATE / 2;
  } else {
    left = rect.x - CARD_W - GUTTER;
    top = rect.y + rect.height / 2 - CARD_H_ESTIMATE / 2;
  }
  return {
    top: clamp(top, MARGIN, vh - CARD_H_ESTIMATE - MARGIN),
    left: clamp(left, MARGIN, vw - CARD_W - MARGIN),
  };
}

function arrowEndpoints(
  rect: Rect,
  card: { top: number; left: number },
  side: 'top' | 'bottom' | 'left' | 'right'
): { from: { x: number; y: number }; to: { x: number; y: number } } {
  const targetCenter = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  const cardCenter = { x: card.left + CARD_W / 2, y: card.top + CARD_H_ESTIMATE / 2 };

  // Arrow starts at the card edge facing the target and ends at the target rect edge.
  let from = cardCenter;
  let to = targetCenter;
  if (side === 'bottom') {
    from = { x: cardCenter.x, y: card.top + 4 };
    to = { x: targetCenter.x, y: rect.y + rect.height + 6 };
  } else if (side === 'top') {
    from = { x: cardCenter.x, y: card.top + CARD_H_ESTIMATE - 4 };
    to = { x: targetCenter.x, y: rect.y - 6 };
  } else if (side === 'right') {
    from = { x: card.left + 4, y: cardCenter.y };
    to = { x: rect.x + rect.width + 6, y: targetCenter.y };
  } else {
    from = { x: card.left + CARD_W - 4, y: cardCenter.y };
    to = { x: rect.x - 6, y: targetCenter.y };
  }
  return { from, to };
}

export function TourOverlay() {
  const step = useResolvedStep();
  const pathname = usePathname();
  const router = useRouter();

  const targets = useTourStore((s) => s.targets);
  const targetsVersion = useTourStore((s) => s.targetsVersion);
  const advance = useTourStore((s) => s.advance);
  const back = useTourStore((s) => s.back);
  const skipStore = useTourStore((s) => s.skip);
  const dismissSession = useTourStore((s) => s.dismissSession);

  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Measure target — re-run when step, target refs, or viewport change.
  useEffect(() => {
    if (!step) {
      setRect(null);
      return;
    }
    const el = targets.get(step.targetId);
    if (!el) {
      setRect(null);
      return;
    }

    const update = () => setRect(getTargetRect(el));
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [step, targets, targetsVersion, viewport.w, viewport.h]);

  // Listen for clicks on the target when advanceOn === 'click-target'
  useEffect(() => {
    if (!step || step.advanceOn !== 'click-target') return;
    const el = targets.get(step.targetId);
    if (!el) return;
    const handler = () => advance();
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [step, targets, targetsVersion, advance]);

  // Persist progress on close/skip/finale
  const handleSkip = useCallback(async () => {
    skipStore();
    await updateTourProgress({ stage: 'done', step: 0, skipped: true });
    setConfirmSkip(false);
  }, [skipStore]);

  const handleNext = useCallback(() => {
    if (!step) return;
    if (step.isFinale) {
      useTourStore.getState().finish();
      updateTourProgress({ stage: 'done', step: 0, skipped: false });
      return;
    }
    if (step.advanceOn === 'manual') {
      // If we're on the last Output step, transition to Tasks and navigate.
      const store = useTourStore.getState();
      if (store.stage === 'output' && store.step === 3) {
        store.goto('tasks', 0);
        router.push('/tasks');
        return;
      }
      advance();
    }
  }, [step, advance, router]);

  if (!mounted || !step) return null;

  // Cross-page: step's route doesn't match current path → show banner only.
  const onCorrectPage = pathname === step.route;

  if (!onCorrectPage) {
    return createPortal(
      <div className="pointer-events-auto fixed bottom-6 left-1/2 z-[62] -translate-x-1/2 rounded-full border border-border bg-card px-4 py-2 shadow-lg flex items-center gap-3">
        <span className="text-[13px] text-foreground">Pick up your tour</span>
        <button
          onClick={() => router.push(step.route)}
          className="text-[13px] rounded-md bg-foreground text-background px-2.5 py-1 hover:bg-foreground/90 transition-colors"
        >
          Continue
        </button>
        <button
          onClick={() => dismissSession()}
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Dismiss
        </button>
      </div>,
      document.body
    );
  }

  // Finale: render a centered card with a soft backdrop — no spotlight or arrow.
  if (step.isFinale) {
    return createPortal(
      <FinaleLayer step={step} onNext={handleNext} />,
      document.body
    );
  }

  // On correct page but target not mounted yet — render a minimal fallback card.
  if (!rect) {
    return createPortal(
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Getting your tour ready…
        </div>
      </div>,
      document.body
    );
  }

  const side = resolvePlacement(step.placement, rect, viewport.w, viewport.h);
  const card = cardPosition(rect, side, viewport.w, viewport.h);
  const { from, to } = arrowEndpoints(rect, card, side);
  const canGoBack = step.index > 0 || step.stage === 'tasks';

  const handleBack = () => {
    const store = useTourStore.getState();
    if (store.step === 0 && store.stage === 'tasks') {
      // jump back to end of output stage
      store.goto('output', 3);
      router.push('/output');
      return;
    }
    back();
  };

  return createPortal(
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${step.stage}-${step.index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <TourSpotlight rect={rect} padding={step.padding ?? 8} radius={12} />
          <TourArrow from={from} to={to} />
          <TourCard
            step={step}
            position={card}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={() => setConfirmSkip(true)}
            canGoBack={canGoBack}
          />
        </motion.div>
      </AnimatePresence>

      {confirmSkip && <SkipConfirmDialog onConfirm={handleSkip} onCancel={() => setConfirmSkip(false)} />}
    </>,
    document.body
  );
}

function FinaleLayer({ step, onNext }: { step: ResolvedStep; onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-auto fixed inset-0 z-[65] flex items-center justify-center"
    >
      {/* soft radial glow */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,255,255,0.18), transparent 55%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="relative w-[360px] rounded-2xl border border-border bg-card p-6 shadow-2xl text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
          className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <motion.path
              d="M5 12l5 5L20 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.25, duration: 0.35, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>
        <p className="text-base font-semibold">{step.title}</p>
        <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{step.body}</p>
        <button
          onClick={onNext}
          className="mt-5 w-full rounded-md bg-foreground text-background text-sm font-medium py-2 hover:bg-foreground/90 transition-colors"
        >
          {step.cta ?? 'Done'}
        </button>
      </motion.div>
    </motion.div>
  );
}

function SkipConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-auto fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="w-[340px] rounded-xl border border-border bg-card p-5 shadow-xl"
      >
        <p className="text-sm font-semibold">Skip the tour?</p>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          You can replay it anytime from Settings.
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-[13px] rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            Keep touring
          </button>
          <button
            onClick={onConfirm}
            className="text-[13px] rounded-md bg-foreground text-background px-3 py-1.5 font-medium hover:bg-foreground/90 transition-colors"
          >
            Skip
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
