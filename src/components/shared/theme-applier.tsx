'use client';

import { useEffect } from 'react';
import { useThemeStore, isDarkTheme, isGridTheme } from '@/stores/theme-store';

export function ThemeApplier() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkTheme(theme));
    document.documentElement.classList.toggle('grid-bg', isGridTheme(theme));
  }, [theme]);

  return null;
}
