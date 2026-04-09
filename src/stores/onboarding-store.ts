import { create } from 'zustand';

interface OnboardingState {
  hasCompletedFirstBlock: boolean;
  setHasCompletedFirstBlock: (val: boolean) => void;
}

// Default true to avoid false positives when store hasn't been initialized yet
export const useOnboardingStore = create<OnboardingState>()((set) => ({
  hasCompletedFirstBlock: true,
  setHasCompletedFirstBlock: (val) => set({ hasCompletedFirstBlock: val }),
}));
