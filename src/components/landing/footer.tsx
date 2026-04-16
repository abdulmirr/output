'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore, isDarkTheme, isGridTheme } from '@/stores/theme-store';

export function Footer() {
  const { theme, setTheme } = useThemeStore();

  const isDark = isDarkTheme(theme);
  const hasGrid = isGridTheme(theme);

  const toggle = () => {
    if (isDark) {
      setTheme(hasGrid ? 'light-grid' : 'light');
    } else {
      setTheme(hasGrid ? 'dark-grid' : 'dark');
    }
  };

  return (
    <footer className="py-8">
      <div className="mx-auto max-w-5xl px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/output-logo.svg" alt="Output" width={16} height={24} className="h-5 w-auto" />
          <span className="text-sm font-medium">Output</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/privacypolicy"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <button
            onClick={toggle}
            className="text-muted-foreground hover:text-foreground transition-colors px-1"
            aria-label="Toggle theme"
          >
            {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </button>
          <Link
            href="/termsofservice"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms
          </Link>
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
