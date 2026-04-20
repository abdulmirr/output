'use client';

import { useCallback, useState } from 'react';

export function useWizardStep(total: number, initial: number = 0) {
  const [step, setStep] = useState(initial);
  const [direction, setDirection] = useState<1 | -1>(1);

  const next = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, total - 1));
  }, [total]);

  const back = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const goto = useCallback((target: number) => {
    setDirection((d) => (target > step ? 1 : target < step ? -1 : d));
    setStep(target);
  }, [step]);

  return { step, direction, next, back, goto };
}
