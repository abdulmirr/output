'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RolePicker } from './role-picker';
import { GoalPicker } from './goal-picker';
import { HowItWorks } from './how-it-works';

type Step = 1 | 2 | 3;

interface OnboardingWizardProps {
  displayName: string | null;
}

export function OnboardingWizard({ displayName }: OnboardingWizardProps) {
  const [step, setStep] = useState<Step>(1);

  const firstName = displayName?.split(' ')[0] ?? null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">output</span>
        </div>
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {firstName ? `Welcome, ${firstName}.` : 'Welcome.'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Let&apos;s get you set up in 30 seconds.</p>
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as Step[]).map((s) => (
          <div
            key={s}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              s === step ? 'w-6 bg-foreground' : s < step ? 'w-4 bg-foreground/40' : 'w-4 bg-muted-foreground/20'
            )}
          />
        ))}
      </div>

      {/* Steps */}
      <div key={step} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
        {step === 1 && <RolePicker onNext={() => setStep(2)} />}
        {step === 2 && <GoalPicker onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <HowItWorks onBack={() => setStep(2)} />}
      </div>
    </div>
  );
}
