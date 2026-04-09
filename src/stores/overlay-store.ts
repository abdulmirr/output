import { create } from 'zustand';

export type OverlayType = 'work-block' | 'task-creation' | 'log-off' | 'add-block' | 'keyboard-shortcuts' | 'duration-dialog' | 'notes-dialog' | 'date-dialog' | null;

interface OverlayState {
  activeOverlay: OverlayType;
  open: (overlay: NonNullable<OverlayType>) => void;
  close: () => void;
  toggle: (overlay: NonNullable<OverlayType>) => void;
}

export const useOverlayStore = create<OverlayState>()((set, get) => ({
  activeOverlay: null,
  open: (overlay) => set({ activeOverlay: overlay }),
  close: () => set({ activeOverlay: null }),
  toggle: (overlay) => {
    const current = get().activeOverlay;
    set({ activeOverlay: current === overlay ? null : overlay });
  },
}));
