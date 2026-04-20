import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HOTKEYS } from '@/lib/constants';

interface ShortcutState {
  addTaskShortcut: string;
  setAddTaskShortcut: (shortcut: string) => void;
  resetAddTaskShortcut: () => void;
}

export const useShortcutStore = create<ShortcutState>()(
  persist(
    (set) => ({
      addTaskShortcut: HOTKEYS.ADD_TASK,
      setAddTaskShortcut: (addTaskShortcut) => set({ addTaskShortcut }),
      resetAddTaskShortcut: () => set({ addTaskShortcut: HOTKEYS.ADD_TASK }),
    }),
    { name: 'output-shortcuts' }
  )
);
