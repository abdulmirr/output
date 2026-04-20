'use client';

import { useState } from 'react';
import { WizardShell } from './wizard-shell';
import { useWizardStep } from './hooks/use-wizard-step';
import { WelcomeStep } from './steps/welcome-step';
import { NameStep } from './steps/name-step';
import { RolePicker } from './role-picker';
import { FocusStep } from './steps/focus-step';
import { GoalPicker } from './goal-picker';
import { ReadyStep } from './steps/ready-step';

interface OnboardingWizardProps {
  displayName: string | null;
  preferredName: string | null;
}

const TOTAL_STEPS = 6;

export function OnboardingWizard({ displayName, preferredName }: OnboardingWizardProps) {
  const firstName = preferredName ?? displayName?.split(' ')[0] ?? null;
  const [name, setName] = useState<string>(firstName ?? '');
  const { step, direction, next, back } = useWizardStep(TOTAL_STEPS, 0);

  return (
    <WizardShell step={step} direction={direction} total={TOTAL_STEPS}>
      {step === 0 && <WelcomeStep onNext={next} firstName={firstName} />}
      {step === 1 && (
        <NameStep
          onNext={(n) => {
            if (n) setName(n);
            next();
          }}
          onBack={back}
          initialName={name || firstName}
        />
      )}
      {step === 2 && <RolePicker onNext={next} onBack={back} />}
      {step === 3 && <FocusStep onNext={next} onBack={back} />}
      {step === 4 && <GoalPicker onNext={next} onBack={back} />}
      {step === 5 && <ReadyStep name={name} onBack={back} />}
    </WizardShell>
  );
}
