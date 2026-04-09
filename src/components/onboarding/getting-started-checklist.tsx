'use client';

import { useState, useEffect, useTransition } from 'react';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dismissChecklist } from '@/app/onboarding/actions';

interface GettingStartedChecklistProps {
  hasCompletedFirstBlock: boolean;
  hasTasks: boolean;
  hasLoggedOffToday: boolean;
  onDismiss: () => void;
}

interface ChecklistItem {
  label: string;
  done: boolean;
}

export function GettingStartedChecklist({
  hasCompletedFirstBlock,
  hasTasks,
  hasLoggedOffToday,
  onDismiss,
}: GettingStartedChecklistProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  const items: ChecklistItem[] = [
    { label: 'Create your account', done: true },
    { label: 'Start a work block', done: hasCompletedFirstBlock },
    { label: 'Complete a block with a focus rating', done: hasCompletedFirstBlock },
    { label: 'Add your first task', done: hasTasks },
    { label: 'Log off for today', done: hasLoggedOffToday },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const allDone = completedCount === items.length;

  // Auto-dismiss when all complete
  useEffect(() => {
    if (allDone) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [allDone]);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss();
    startTransition(async () => {
      await dismissChecklist();
    });
  };

  if (dismissed) return null;

  return (
    <div className="hidden sm:block fixed bottom-6 left-6 z-40 w-72 rounded-xl border border-border bg-card shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 text-sm font-medium hover:text-foreground/80 transition-colors"
          >
            {allDone ? (
              <span>You&apos;re all set! 🎉</span>
            ) : (
              <>
                <span>Getting started</span>
                <span className="text-xs text-muted-foreground">
                  {completedCount}/{items.length}
                </span>
              </>
            )}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDismiss}
            disabled={isPending}
            className="text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Items */}
      {!collapsed && (
        <div className="p-2">
          {/* Progress bar */}
          <div className="h-1 rounded-full bg-muted mb-3 mx-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-500"
              style={{ width: `${(completedCount / items.length) * 100}%` }}
            />
          </div>

          <ul className="space-y-0.5">
            {items.map((item, i) => (
              <li
                key={i}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
                  item.done ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all',
                    item.done
                      ? 'border-foreground bg-foreground'
                      : 'border-muted-foreground/40'
                  )}
                >
                  {item.done && <Check className="h-2.5 w-2.5 text-background" />}
                </div>
                <span className={cn(item.done && 'line-through opacity-50')}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
