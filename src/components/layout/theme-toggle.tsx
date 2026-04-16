'use client';

import { useThemeStore, type Theme } from '@/stores/theme-store';

const CYCLE: Theme[] = ['light-grid', 'dark-grid', 'light', 'dark'];

const LABELS: Record<Theme, string> = {
  'light-grid': 'Light + Grid',
  'dark-grid': 'Dark + Grid',
  light: 'Light',
  dark: 'Dark',
};

/* ── Sun icon (no grid) ── */
function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

/* ── Moon icon (no grid) ── */
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/* ── Sun icon with small grid dots ── */
function SunGridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      {/* Grid dots inside the sun */}
      <circle cx="10" cy="10.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14" cy="10.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="10" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ── Moon icon with small grid dots ── */
function MoonGridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      {/* Grid dots inside the moon */}
      <circle cx="10" cy="11" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="13" cy="11" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="10" cy="14" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="13" cy="14" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="10" cy="17" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="13" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ICONS: Record<Theme, (props: { className?: string }) => React.ReactNode> = {
  'light-grid': SunGridIcon,
  'dark-grid': MoonGridIcon,
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
