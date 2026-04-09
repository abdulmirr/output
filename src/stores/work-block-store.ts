import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkBlockType } from '@/lib/types';
import { generateId } from '@/lib/utils';

export type WorkBlockPhase = 'idle' | 'start' | 'active' | 'rating';

interface ActiveBlock {
  id: string;
  title: string;
  type: WorkBlockType;
  plannedDuration: number | null;
  startTime: number; // timestamp ms
}

interface WorkBlockState {
  phase: WorkBlockPhase;
  activeBlock: ActiveBlock | null;
  minimized: boolean;

  // Actions
  beginStart: () => void;
  startBlock: (title: string, type: WorkBlockType, plannedDuration: number | null) => void;
  updateStartTime: (startTime: number) => void;
  completeBlock: () => void;
  finishRating: () => void;
  discardBlock: () => void;
  minimize: () => void;
  restore: () => void;
  reset: () => void;
}

export const useWorkBlockStore = create<WorkBlockState>()(
  persist(
    (set) => ({
      phase: 'idle',
      activeBlock: null,
      minimized: false,

      beginStart: () => set({ phase: 'start', minimized: false }),

      startBlock: (title, type, plannedDuration) => {
        set({
          phase: 'active',
          minimized: false,
          activeBlock: {
            id: generateId(),
            title,
            type,
            plannedDuration,
            startTime: Date.now(),
          },
        });
      },

      updateStartTime: (startTime) =>
        set((state) =>
          state.activeBlock ? { activeBlock: { ...state.activeBlock, startTime } } : {}
        ),

      completeBlock: () => set({ phase: 'rating', minimized: false }),

      finishRating: () => set({ phase: 'idle', activeBlock: null, minimized: false }),

      discardBlock: () => set({ phase: 'idle', activeBlock: null, minimized: false }),

      minimize: () => set({ minimized: true }),

      restore: () => set({ minimized: false }),

      reset: () => set({ phase: 'idle', activeBlock: null, minimized: false }),
    }),
    {
      name: 'output-work-blocks',
      partialize: (state) => ({
        activeBlock: state.activeBlock,
        phase: state.activeBlock ? state.phase : 'idle',
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<WorkBlockState>;
        return {
          ...current,
          activeBlock: p.activeBlock || null,
          phase: p.activeBlock ? (p.phase as WorkBlockPhase) : 'idle',
        };
      },
    }
  )
);
