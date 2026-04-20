'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { saveProfileDetails } from '@/app/onboarding/actions';
import type { WorkWindow } from '@/lib/types';

const WINDOWS: { value: WorkWindow; label: string }[] = [
  { value: 'mornings', label: 'Mornings' },
  { value: 'afternoons', label: 'Afternoons' },
  { value: 'evenings', label: 'Evenings' },
  { value: 'split', label: 'Split day' },
  { value: 'flexible', label: 'Flexible' },
];

interface FocusStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function FocusStep({ onNext, onBack }: FocusStepProps) {
  const [focusArea, setFocusArea] = useState('');
  const [window, setWindow] = useState<WorkWindow | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    startTransition(async () => {
      await saveProfileDetails({
        focusArea: focusArea.trim() || null,
        workWindow: window,
      });
      onNext();
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">What are you working on?</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ll use this to pre-fill your first block.
        </p>
      </div>

      <div className="space-y-2">
        <input
          autoFocus
          value={focusArea}
          onChange={(e) => setFocusArea(e.target.value)}
          placeholder="e.g. shipping the v2 redesign"
          maxLength={80}
          className="w-full text-base font-light bg-transparent border-0 border-b border-border/60 outline-none pb-2 focus:border-foreground transition-colors placeholder:text-foreground/20"
        />
        <p className="text-xs text-muted-foreground/60 text-right font-mono">
          {focusArea.length}/80
        </p>
      </div>

      <div className="space-y-2.5 pt-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">When you work best</p>
        <div className="flex flex-wrap gap-2">
          {WINDOWS.map((w) => (
            <button
              key={w.value}
              onClick={() => setWindow(window === w.value ? null : w.value)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm transition-all',
                window === w.value
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card text-foreground hover:border-foreground/40'
              )}
            >
              {w.label}
            </button>
          ))}
        </div>
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
