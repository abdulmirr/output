'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { completeOnboarding } from '@/app/onboarding/actions';

export function HowItWorks({ onBack }: { onBack: () => void }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setIsPending(true);
    try {
      await completeOnboarding();
    } catch {
      // continue regardless — cookie/DB may fail if migration hasn't run
    } finally {
      setIsPending(false);
    }
    router.push('/output');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Here's how it works</h2>
        <p className="text-sm text-muted-foreground">Three steps, every day.</p>
      </div>

      <div className="space-y-3">
        {/* Card 1 */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-4">
          <span className="text-xs font-mono text-muted-foreground mt-0.5">01</span>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">Start a work block</p>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border font-mono">⌘</kbd>
              <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border font-mono">⇧</kbd>
              <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border font-mono animate-pulse">O</kbd>
            </div>
            <p className="text-xs text-muted-foreground">Name what you're working on and hit go.</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-4">
          <span className="text-xs font-mono text-muted-foreground mt-0.5">02</span>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Rate your focus</p>
            <div className="flex items-center gap-0.5 py-1">
              {['😫','😞','😕','😐','🙂','😊','😄','🎯','🔥','🤩'].map((emoji, i) => (
                <span
                  key={i}
                  className="text-base leading-none"
                  style={{ opacity: i === 7 ? 1 : 0.3 + (i / 10) * 0.4 }}
                >
                  {emoji}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Score each block when you're done.</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-4">
          <span className="text-xs font-mono text-muted-foreground mt-0.5">03</span>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Log off & plan tomorrow</p>
            <LogOut className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">End your day with a quick reflection.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleComplete} disabled={isPending}>
          {isPending ? 'Setting up…' : 'Start tracking →'}
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
