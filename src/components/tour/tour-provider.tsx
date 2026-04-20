'use client';

import { useEffect } from 'react';
import { useTourStore } from '@/stores/tour-store';
import { TourOverlay } from './tour-overlay';
import { useTourProgressSync } from './use-tour';
import type { TourProgress } from '@/lib/types';

interface TourProviderProps {
  initial: TourProgress;
}

/**
 * Hydrates the tour store from server-fetched profile data and renders the overlay.
 * Mount once in the app layout.
 */
export function TourProvider({ initial }: TourProviderProps) {
  const setProgress = useTourStore((s) => s.setProgress);
  const hydrated = useTourStore((s) => s.hydrated);

  useEffect(() => {
    setProgress(initial);
  }, [initial, setProgress]);

  useTourProgressSync();

  const stage = useTourStore((s) => s.stage);
  const skipped = useTourStore((s) => s.skipped);
  const sessionDismissed = useTourStore((s) => s.sessionDismissed);

  if (!hydrated) return null;
  if (stage === 'done' || skipped || sessionDismissed) return null;

  return <TourOverlay />;
}
