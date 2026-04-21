'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { ResolvedStep } from '@/lib/tour/tour-types';

interface TourCardProps {
  step: ResolvedStep;
  position: { top: number; left: number };
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  canGoBack: boolean;
}

export function TourCard({ step, position, onNext, onBack, onSkip, canGoBack }: TourCardProps) {
  const { title, body, kbd, advanceOn, cta, isFinale, index, total, stage } = step;

  const [escapeEnabled, setEscapeEnabled] = useState(false);
  useEffect(() => {
    setEscapeEnabled(false);
    if (advanceOn !== 'action') return;
    const t = setTimeout(() => setEscapeEnabled(true), 4000);
    return () => clearTimeout(t);
  }, [advanceOn, stage, index]);

  const showEscape = advanceOn === 'action' && escapeEnabled;
  const primaryLabel =
    cta ??
    (advanceOn === 'click-target'
      ? 'Try it \u2193'
      : advanceOn === 'action'
        ? showEscape
          ? 'Continue anyway'
          : 'Waiting for you\u2026'
        : 'Next');
  const primaryDisabled = advanceOn !== 'manual' && !showEscape;

  return (
    <motion.div
      key={`${step.stage}-${step.index}`}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className={cn(
        'pointer-events-auto fixed z-[62] w-[320px] rounded-xl border border-border bg-card p-4 shadow-xl',
        'backdrop-blur-md'
      )}
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                i === index ? 'w-5 bg-foreground' : i < index ? 'w-2.5 bg-foreground/40' : 'w-2.5 bg-foreground/15'
              )}
            />
          ))}
        </div>
        <button
          onClick={onSkip}
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip tour
        </button>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-[13px] text-muted-foreground leading-relaxed">{body}</p>
        {kbd && kbd.length > 0 && (
          <div className="flex items-center gap-1 pt-1">
            {kbd.map((k) => (
              <kbd
                key={k}
                className="px-1.5 py-0.5 text-[11px] bg-muted rounded border border-border font-mono leading-none"
              >
                {k}
              </kbd>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {canGoBack ? (
          <button
            onClick={onBack}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </button>
        ) : (
          <span />
        )}

        <button
          onClick={onNext}
          disabled={primaryDisabled && !isFinale}
          className={cn(
            'text-[13px] rounded-md px-3 py-1.5 font-medium transition-colors',
            primaryDisabled && !isFinale
              ? 'bg-muted text-muted-foreground cursor-default'
              : 'bg-foreground text-background hover:bg-foreground/90'
          )}
        >
          {primaryLabel}
        </button>
      </div>

    </motion.div>
  );
}
