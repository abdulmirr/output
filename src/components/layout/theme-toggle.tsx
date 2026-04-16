'use client';

import { Sun, Moon } from 'lucide-react';
import { useThemeStore, type Theme } from '@/stores/theme-store';

const CYCLE: Theme[] = ['light-grid', 'light', 'dark'];

const LABELS: Record<Theme, string> = {
  'light-grid': 'Light + Grid',
  light: 'Light',
  dark: 'Dark',
};

/* ── Grid icon ── */
function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return <Sun strokeWidth={1.25} className={className} />;
}

function MoonIcon({ className }: { className?: string }) {
  return <Moon strokeWidth={1.25} className={className} />;
}

const ICONS: Record<Theme, React.ComponentType<{ className?: string }>> = {
  'light-grid': GridIcon,
  light: SunIcon,
  dark: MoonIcon,
};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useThemeStore();

  const cycle = () => {
    const idx = CYCLE.indexOf(theme);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    setTheme(next);
  };

  const Icon = ICONS[theme] ?? ICONS['light-grid'];

  return (
    <button
      onClick={cycle}
      title={LABELS[theme]}
      className={`text-foreground/40 hover:text-foreground transition-colors ${className ?? ''}`}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}
