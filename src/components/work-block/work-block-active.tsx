'use client';

import { Button } from '@/components/ui/button';
import { X, Pencil, Check } from 'lucide-react';
import { TimerDisplay } from './timer-display';
import { useState, useRef, useEffect } from 'react';

interface WorkBlockActiveProps {
  title: string;
  seconds: number;
  isRunning: boolean;
  startTime: number; // timestamp ms
  onComplete: () => void;
  onDiscard: () => void;
  onMinimize: () => void;
  onStartTimeChange: (newStartTime: number) => void;
}

function formatStartTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Returns "HH:MM" in 24h for <input type="time">
function toTimeInputValue(ts: number) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function WorkBlockActive({
  title,
  seconds,
  isRunning,
  startTime,
  onComplete,
  onDiscard,
  onMinimize,
  onStartTimeChange,
}: WorkBlockActiveProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(toTimeInputValue(startTime));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setInputValue(toTimeInputValue(startTime));
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editing, startTime]);

  const handleConfirm = () => {
    const [h, m] = inputValue.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) {
      setEditing(false);
      return;
    }
    const now = new Date();
    const newStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    // Don't allow future start times
    if (newStart.getTime() > Date.now()) {
      setEditing(false);
      return;
    }
    onStartTimeChange(newStart.getTime());
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onMinimize}
        className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Minimize"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">Working on</p>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">{title}</h2>
      </div>

      <div className="flex justify-center">
        <TimerDisplay seconds={seconds} isRunning={isRunning} />
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <span className="text-xs text-muted-foreground">Started at</span>
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="time"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-xs font-medium bg-muted border border-border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={handleConfirm}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Confirm"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs font-medium text-foreground hover:text-muted-foreground transition-colors group"
          >
            {formatStartTime(startTime)}
            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onDiscard}
          className="flex-1"
        >
          Discard
        </Button>
        <Button onClick={onComplete} className="flex-1">
          Complete
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Esc to minimize
      </p>
    </div>
  );
}
