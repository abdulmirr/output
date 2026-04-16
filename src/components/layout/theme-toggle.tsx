'use client';

import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/stores/theme-store';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useThemeStore();

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Dark mode' : 'Light mode'}
      className={`text-foreground/40 hover:text-foreground transition-colors ${className ?? ''}`}
    >
      {isDark ? <Moon strokeWidth={1.25} className="h-[18px] w-[18px]" /> : <Sun strokeWidth={1.25} className="h-[18px] w-[18px]" />}
    </button>
  );
}
