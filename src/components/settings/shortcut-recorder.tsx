'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  formatShortcutText,
  isReservedShortcut,
  keyEventToShortcut,
} from '@/lib/shortcut-utils';

interface ShortcutRecorderProps {
  value: string;
  defaultValue: string;
  onChange: (shortcut: string) => void;
  onReset: () => void;
}

export function ShortcutRecorder({
  value,
  defaultValue,
  onChange,
  onReset,
}: ShortcutRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!recording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setRecording(false);
        setError(null);
        return;
      }

      const shortcut = keyEventToShortcut(e);
      if (!shortcut) return;

      e.preventDefault();
      e.stopPropagation();

      if (isReservedShortcut(shortcut)) {
        setError('That combo is already used by another shortcut.');
        return;
      }

      onChange(shortcut);
      setRecording(false);
      setError(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [recording, onChange]);

  const isCustom = value !== defaultValue;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {isCustom && !recording && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-light text-foreground/40 hover:text-foreground transition-colors"
          >
            Reset
          </button>
        )}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            setRecording((r) => !r);
            setError(null);
          }}
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-mono transition-colors ring-1',
            recording
              ? 'ring-foreground/40 bg-foreground/[0.06] text-foreground animate-pulse'
              : 'ring-foreground/10 text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground'
          )}
        >
          {recording ? 'Press keys…' : formatShortcutText(value)}
        </button>
      </div>
      {error && (
        <span className="text-[11px] text-destructive font-light">{error}</span>
      )}
      {recording && !error && (
        <span className="text-[11px] text-foreground/40 font-light">
          Press Esc to cancel
        </span>
      )}
    </div>
  );
}
