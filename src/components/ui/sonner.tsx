'use client';

import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';
import { useThemeStore, isDarkTheme } from '@/stores/theme-store';

export function Toaster(props: ToasterProps) {
  const theme = useThemeStore((s) => s.theme);

  return (
    <SonnerToaster
      position="bottom-right"
      theme={isDarkTheme(theme) ? 'dark' : 'light'}
      offset={20}
      gap={10}
      {...props}
    />
  );
}
