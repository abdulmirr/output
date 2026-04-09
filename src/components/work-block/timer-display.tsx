'use client';

import { formatTimerDisplay } from '@/lib/utils';

interface TimerDisplayProps {
  seconds: number;
  isRunning: boolean;
}

export function TimerDisplay({ seconds, isRunning }: TimerDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      {isRunning && (
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
      )}
      <span className="text-3xl font-mono font-semibold tabular-nums tracking-tight">
        {formatTimerDisplay(seconds)}
      </span>
    </div>
  );
}
