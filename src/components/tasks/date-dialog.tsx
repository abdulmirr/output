'use client';

import { useEffect, useRef, useTransition } from 'react';
import { Portal } from '@/components/shared/portal';
import { useOverlayStore } from '@/stores/overlay-store';
import { useTaskStore } from '@/stores/task-store';
import { updateTask } from '@/app/(app)/tasks/actions';
import { CalendarDays, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Returns YYYY-MM-DD string for today, tomorrow, etc.
function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function DateDialog() {
  const { activeOverlay, close } = useOverlayStore();
  const { selectedTaskId, tasks, updateTaskOptimistic } = useTaskStore();
  const visible = activeOverlay === 'date-dialog';

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const currentDate = selectedTask?.dueDate
    ? selectedTask.dueDate.toISOString().split('T')[0]
    : '';

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [visible]);

  if (!visible || !selectedTask) return null;

  const handleSet = (dateStr: string | null) => {
    const newDate = dateStr || null;
    updateTaskOptimistic(selectedTask.id, {
      dueDate: newDate ? new Date(newDate + 'T00:00:00') : null,
    });
    startTransition(async () => {
      await updateTask(selectedTask.id, { dueDate: newDate });
    });
    close();
  };

  const presets = [
    { label: 'Today', dateStr: offsetDate(0) },
    { label: 'Tomorrow', dateStr: offsetDate(1) },
    { label: 'In 3 days', dateStr: offsetDate(3) },
    { label: 'Next week', dateStr: offsetDate(7) },
  ];

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
        <div className="fixed inset-0 bg-black/40" onClick={close} />
        <div className="relative z-10 w-full max-w-xs rounded-xl border border-border bg-background shadow-xl overflow-hidden">
          {/* Date input at top */}
          <div className="p-3 border-b border-border bg-muted/20 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="date"
              defaultValue={currentDate}
              onChange={(e) => {
                if (e.target.value) handleSet(e.target.value);
              }}
              className="flex-1 bg-transparent outline-none text-sm text-foreground"
            />
          </div>

          {/* Quick presets */}
          <div className="p-2 space-y-0.5 bg-card">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => handleSet(p.dateStr)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm text-left rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
                  currentDate === p.dateStr && 'bg-accent/50 text-accent-foreground'
                )}
              >
                <span>{p.label}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(p.dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </button>
            ))}

            {currentDate && (
              <>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => handleSet(null)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                  Remove date
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
