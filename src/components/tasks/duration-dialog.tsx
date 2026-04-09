'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { Portal } from '@/components/shared/portal';
import { useOverlayStore } from '@/stores/overlay-store';
import { useTaskStore } from '@/stores/task-store';
import { updateTask } from '@/app/(app)/tasks/actions';
import { X } from 'lucide-react';

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

export function parseDuration(input: string): number | null {
  const str = input.toLowerCase().trim();
  if (!str) return null;
  
  let totalSeconds = 0;
  
  // Match patterns like "1h30m", "1h 30m", "90m", "1h"
  const hMatch = str.match(/(\d+)\s*h/);
  const mMatch = str.match(/(\d+)\s*m/);
  
  if (!hMatch && !mMatch) {
    const num = parseInt(str, 10);
    if (!isNaN(num)) {
       // Assumes minutes if no unit and just number typed
       return num * 60;
    }
    return null;
  }
  
  if (hMatch) totalSeconds += parseInt(hMatch[1], 10) * 3600;
  if (mMatch) totalSeconds += parseInt(mMatch[1], 10) * 60;
  
  return totalSeconds > 0 ? totalSeconds : null;
}

export function DurationDialog() {
  const { activeOverlay, close } = useOverlayStore();
  const { selectedTaskId, tasks, updateTaskOptimistic } = useTaskStore();
  const visible = activeOverlay === 'duration-dialog';
  
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const [inputValue, setInputValue] = useState('');
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible && selectedTask) {
      if (selectedTask.estimatedDuration) {
        setInputValue(formatDuration(selectedTask.estimatedDuration));
      } else {
        setInputValue('');
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [visible, selectedTask]);

  if (!visible || !selectedTask) return null;

  const handleSave = (seconds: number | null) => {
    updateTaskOptimistic(selectedTask.id, { estimatedDuration: seconds });
    startTransition(async () => {
      await updateTask(selectedTask.id, { estimatedDuration: seconds });
    });
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const seconds = parseDuration(inputValue);
      if (seconds !== null || inputValue.trim() === '') {
         handleSave(seconds);
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
        <div className="fixed inset-0 bg-black/40" onClick={close} />
        <div className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-background shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20">
             <input
                key="duration-input"
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Set duration. Try: 1h 15m"
                className="w-full bg-transparent outline-none text-[15px] placeholder:text-muted-foreground/50"
             />
          </div>
          <div className="p-2 space-y-1 bg-card">
             <button
                onClick={() => handleSave(3600)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-left rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group"
             >
                <span>1 hour</span>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">1h</span>
             </button>
             <button
                onClick={() => handleSave(1800)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-left rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group"
             >
                <span>30 minutes</span>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">30m</span>
             </button>
             <button
                onClick={() => handleSave(900)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-left rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group"
             >
                <span>15 minutes</span>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">15m</span>
             </button>
             
             <div className="h-px bg-border/50 my-2" />
             
             <button
                onClick={() => handleSave(null)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md hover:bg-destructive/10 text-destructive transition-colors"
            >
                <X className="h-4 w-4" />
                Clear duration
             </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
