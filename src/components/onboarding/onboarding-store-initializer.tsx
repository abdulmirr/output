'use client';

import { useEffect } from 'react';
import { useOnboardingStore } from '@/stores/onboarding-store';

interface OnboardingStoreInitializerProps {
  hasCompletedFirstBlock: boolean;
}

export function OnboardingStoreInitializer({ hasCompletedFirstBlock }: OnboardingStoreInitializerProps) {
  useEffect(() => {
    useOnboardingStore.getState().setHasCompletedFirstBlock(hasCompletedFirstBlock);
  }, [hasCompletedFirstBlock]);

  return null;
}
