'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { saveDailyGoal } from '@/app/onboarding/actions';

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8];

interface GoalPickerProps {
  onNext: () => void;
  onBack: () => void;
}

export function GoalPicker({ onNext, onBack }: GoalPickerProps) {
  const [selected, setSelected] = useState(4);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    startTransition(async () => {
      const result = await saveDailyGoal(selected);
      if (result?.error) {
        setError("Couldn't save — you can update this in Settings later.");
      }
      onNext();
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Set your daily focus target</h2>
        <p className="text-sm text-muted-foreground">How many hours of deep work do you aim for daily?</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {HOURS.map((h) => (
          <button
            key={h}
            onClick={() => setSelected(h)}
            className={cn(
              'rounded-xl border py-3 text-sm font-medium transition-all',
              'hover:bg-accent hover:border-accent-foreground/20',
              selected === h
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card text-foreground'
            )}
          >
            {h}h
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Most high-performers aim for 4 hours of real focus daily.
      </p>

      {error && <p className="text-xs text-muted-foreground">{error}</p>}

      <div className="flex items-center gap-4">
        <Button onClick={handleContinue} disabled={isPending}>
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
