'use client';

import { Button } from '@/components/ui/button';
import { useOverlayStore } from '@/stores/overlay-store';
import { useWorkBlockStore } from '@/stores/work-block-store';

export function FirstRunBanner() {
  const open = useOverlayStore((s) => s.open);
  const beginStart = useWorkBlockStore((s) => s.beginStart);

  const handleStart = () => {
    open('work-block');
    beginStart();
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
      <div className="text-2xl">⚡</div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Ready to track your first block?</h3>
        <p className="text-sm text-muted-foreground">
          Hit{' '}
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border border-border font-mono">⌘</kbd>{' '}
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border border-border font-mono">⇧</kbd>{' '}
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border border-border font-mono">O</kbd>{' '}
          or click below to start.
        </p>
      </div>
      <Button onClick={handleStart} className="w-full max-w-xs">
        Start your first work block
      </Button>
    </div>
  );
}
