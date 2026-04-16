import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light-grid' | 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export function isDarkTheme(theme: Theme): boolean {
  return theme === 'dark';
}

export function isGridTheme(theme: Theme): boolean {
  return theme === 'light-grid';
}

function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  document.documentElement.classList.toggle('dark', isDarkTheme(theme));
  document.documentElement.classList.toggle('grid-bg', isGridTheme(theme));
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light-grid',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: 'output-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);
