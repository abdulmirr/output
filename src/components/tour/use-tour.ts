'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTourStore } from '@/stores/tour-store';
import { OUTPUT_STEPS, TASKS_STEPS } from './steps';
import { updateTourProgress } from '@/app/onboarding/actions';
import type { ResolvedStep } from '@/lib/tour/tour-types';

export function useResolvedStep(): ResolvedStep | null {
  const stage = useTourStore((s) => s.stage);
  const step = useTourStore((s) => s.step);
  const skipped = useTourStore((s) => s.skipped);
  const dismissed = useTourStore((s) => s.sessionDismissed);

  if (stage === 'done' || skipped || dismissed) return null;
  const list = stage === 'output' ? OUTPUT_STEPS : TASKS_STEPS;
  const current = list[step];
  if (!current) return null;
  return { ...current, stage, index: step, total: list.length };
}

/**
 * Register a DOM element as a tour target. Call site:
 *   const ref = useTourTarget('output.start-block');
 *   <button ref={ref}>Start</button>
 */
export function useTourTarget(id: string | null) {
  const register = useTourStore((s) => s.registerTarget);
  return useCallback(
    (el: HTMLElement | null) => {
      if (!id) return;
      register(id, el);
    },
    [id, register]
  );
}

/**
 * Advance the tour if the current step matches the given target id.
 * Safe to call from feature code — it's a no-op unless it's the right step.
 */
export function useTourAdvance() {
  return useCallback((targetId: string) => {
    const { stage, step, skipped, sessionDismissed, advance } = useTourStore.getState();
    if (stage === 'done' || skipped || sessionDismissed) return;
    const list = stage === 'output' ? OUTPUT_STEPS : TASKS_STEPS;
    const current = list[step];
    if (!current) return;
    if (current.targetId !== targetId) return;
    advance();
  }, []);
}

/**
 * Persist tour progress to the server whenever it changes (debounced).
 * Mounted once inside TourProvider.
 */
export function useTourProgressSync() {
  const stage = useTourStore((s) => s.stage);
  const step = useTourStore((s) => s.step);
  const skipped = useTourStore((s) => s.skipped);
  const hydrated = useTourStore((s) => s.hydrated);
  const lastSent = useRef<string>('');

  useEffect(() => {
    if (!hydrated) return;
    const serialized = JSON.stringify({ stage, step, skipped });
    if (serialized === lastSent.current) return;
    lastSent.current = serialized;
    const t = setTimeout(() => {
      updateTourProgress({ stage, step, skipped });
    }, 400);
    return () => clearTimeout(t);
  }, [stage, step, skipped, hydrated]);
}
