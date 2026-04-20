import { create } from 'zustand';
import type { TourStage } from '@/lib/types';

interface TourState {
  stage: TourStage;
  step: number;
  skipped: boolean;
  hydrated: boolean;

  targets: Map<string, HTMLElement>;
  /** bump to force overlay reposition when refs mutate */
  targetsVersion: number;

  /** user chose to suspend the tour this session without persisting skip */
  sessionDismissed: boolean;

  setProgress: (p: { stage: TourStage; step: number; skipped: boolean }) => void;
  advance: () => void;
  back: () => void;
  goto: (stage: TourStage, step: number) => void;
  skip: () => void;
  finish: () => void;
  dismissSession: () => void;

  registerTarget: (id: string, el: HTMLElement | null) => void;
}

export const useTourStore = create<TourState>()((set) => ({
  stage: 'done',
  step: 0,
  skipped: false,
  hydrated: false,
  targets: new Map(),
  targetsVersion: 0,
  sessionDismissed: false,

  setProgress: (p) =>
    set({
      stage: p.stage,
      step: p.step,
      skipped: p.skipped,
      hydrated: true,
    }),

  advance: () =>
    set((s) => ({ step: s.step + 1 })),

  back: () =>
    set((s) => ({ step: Math.max(0, s.step - 1) })),

  goto: (stage, step) => set({ stage, step }),

  skip: () => set({ stage: 'done', skipped: true }),

  finish: () => set({ stage: 'done', skipped: false }),

  dismissSession: () => set({ sessionDismissed: true }),

  registerTarget: (id, el) =>
    set((s) => {
      const next = new Map(s.targets);
      if (el) next.set(id, el);
      else next.delete(id);
      return { targets: next, targetsVersion: s.targetsVersion + 1 };
    }),
}));
