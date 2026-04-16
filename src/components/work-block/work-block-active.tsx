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
  onTitleChange: (newTitle: string) => void;
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
  onTitleChange,
}: WorkBlockActiveProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(toTimeInputValue(startTime));
  const inputRef = useRef<HTMLInputElement>(null);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset when entering edit mode
      setInputValue(toTimeInputValue(startTime));
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editing, startTime]);

  useEffect(() => {
    if (editingTitle) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset when entering edit mode
      setTitleValue(title);
      setTimeout(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
      }, 0);
    }
  }, [editingTitle, title]);

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

  const handleTitleConfirm = () => {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== title) {
      onTitleChange(trimmed);
    }
    setEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTitleConfirm();
    if (e.key === 'Escape') setEditingTitle(false);
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
        {editingTitle ? (
          <div className="flex items-center justify-center gap-1">
            <input
              ref={titleInputRef}
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              className="text-lg font-light text-center bg-muted border border-border rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring min-w-0 max-w-full"
            />
            <button
              onClick={handleTitleConfirm}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Confirm"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="inline-flex items-center gap-1.5 text-lg font-light hover:text-muted-foreground transition-colors group"
          >
            {title}
            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        )}
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
          className="flex-1 font-light"
        >
          Discard
        </Button>
        <Button onClick={onComplete} className="flex-1 font-light">
          Complete
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Esc to minimize
      </p>
    </div>
  );
}
