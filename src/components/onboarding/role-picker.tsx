'use client';

import { useState, useTransition } from 'react';
import { Rocket, Code2, Palette, GraduationCap, Sparkles, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { saveRole } from '@/app/onboarding/actions';
import type { UserRole } from '@/lib/types';

const ROLES: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: 'founder', label: 'Founder', icon: <Rocket className="h-4 w-4" /> },
  { value: 'developer', label: 'Developer', icon: <Code2 className="h-4 w-4" /> },
  { value: 'designer', label: 'Designer', icon: <Palette className="h-4 w-4" /> },
  { value: 'student', label: 'Student', icon: <GraduationCap className="h-4 w-4" /> },
  { value: 'creator', label: 'Creator', icon: <Sparkles className="h-4 w-4" /> },
  { value: 'other', label: 'Other', icon: <MoreHorizontal className="h-4 w-4" /> },
];

interface RolePickerProps {
  onNext: () => void;
}

export function RolePicker({ onNext }: RolePickerProps) {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) {
      onNext();
      return;
    }
    startTransition(async () => {
      const result = await saveRole(selected);
      if (result?.error) {
        setError("Couldn't save — you can update this in Settings later.");
      }
      onNext();
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">What best describes you?</h2>
        <p className="text-sm text-muted-foreground">We'll tailor your experience.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ROLES.map((role) => (
          <button
            key={role.value}
            onClick={() => setSelected(selected === role.value ? null : role.value)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-medium transition-all',
              'hover:bg-accent hover:border-accent-foreground/20',
              selected === role.value
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card text-foreground'
            )}
          >
            {role.icon}
            {role.label}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-muted-foreground">{error}</p>}

      <div className="flex items-center gap-4">
        <Button onClick={handleContinue} disabled={isPending}>
          {isPending ? 'Saving…' : 'Continue'}
        </Button>
        <button
          onClick={onNext}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
