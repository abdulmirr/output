'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { saveProfileDetails } from '@/app/onboarding/actions';

interface NameStepProps {
  onNext: (name: string) => void;
  onBack: () => void;
  initialName: string | null;
}

export function NameStep({ onNext, onBack, initialName }: NameStepProps) {
  const [name, setName] = useState(initialName ?? '');
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    const trimmed = name.trim();
    startTransition(async () => {
      if (trimmed) {
        await saveProfileDetails({ preferredName: trimmed });
      }
      onNext(trimmed);
    });
  };

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">What should we call you?</h2>
        <p className="text-sm text-muted-foreground">Used for greetings around the app.</p>
      </div>

      <div className="relative">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleContinue();
          }}
          placeholder="Your name"
          maxLength={40}
          className="w-full text-2xl font-light bg-transparent border-0 border-b border-border/60 outline-none pb-2 focus:border-foreground transition-colors placeholder:text-foreground/20"
        />
      </div>

      <div className="flex items-center gap-4 pt-2">
        <Button onClick={handleContinue} disabled={isPending} className="min-w-[120px]">
          {isPending ? 'Saving…' : 'Continue'}
        </Button>
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
