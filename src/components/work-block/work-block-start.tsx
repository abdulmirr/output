'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TimerInput } from './timer-input';
import { useState, useEffect } from 'react';
import { WorkBlockType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Timer, Clock } from 'lucide-react';

interface WorkBlockStartProps {
  onStart: (title: string, type: WorkBlockType, plannedDuration: number | null) => void;
  onCancel?: () => void;
}

const PHRASES = [
  "Study for CS 225",
  "Draft out Position essay outline",
  "Brainstorm content ideas",
  "Create and schedule 3 carousels for the week",
  "Deep work building product"
];

export function WorkBlockStart({ onStart, onCancel }: WorkBlockStartProps) {
  const [title, setTitle] = useState('');
  const [blockType, setBlockType] = useState<WorkBlockType>('stopwatch');
  const [duration, setDuration] = useState<number | null>(null);

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (blockType === 'timer' && !duration) return;
    onStart(title.trim(), blockType, blockType === 'timer' ? duration : null);
  };

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentPhrase = PHRASES[phraseIndex];

    if (isDeleting) {
      if (charIndex > 0) {
        timer = setTimeout(() => setCharIndex((c) => c - 1), 20); // Fast delete
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- typewriter state machine
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
      }
    } else {
      if (charIndex < currentPhrase.length) {
        timer = setTimeout(() => setCharIndex((c) => c + 1), 50); // Typing speed
      } else {
        timer = setTimeout(() => setIsDeleting(true), 2500); // Pause at end
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex]);

  const placeholderText = `ex ${PHRASES[phraseIndex].substring(0, charIndex)}`;

  return (
    <div className="space-y-6 mt-2">
      <div className="space-y-2">
        <h2 className="text-xl font-light">Start work block</h2>
        <label className="text-sm text-muted-foreground block">What are you working on?</label>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
        placeholder={placeholderText}
        className="border-0 shadow-none focus-visible:ring-0 px-0 text-xl font-normal bg-transparent dark:bg-transparent"
        autoComplete="off"
        autoFocus
      />

      {/* Stopwatch / Timer toggle */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => setBlockType('stopwatch')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-light transition-all border',
            blockType === 'stopwatch'
              ? 'bg-foreground text-background border-foreground'
              : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30'
          )}
        >
          <Clock className="h-4 w-4" />
          Stopwatch
        </button>
        <button
          onClick={() => setBlockType('timer')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-light transition-all border',
            blockType === 'timer'
              ? 'bg-foreground text-background border-foreground'
              : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30'
          )}
        >
          <Timer className="h-4 w-4" />
          Timer
        </button>
      </div>

      {blockType === 'timer' && <TimerInput onDurationChange={setDuration} />}

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="font-light rounded-xl px-6">
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || (blockType === 'timer' && !duration)}
          className="font-light rounded-xl px-6"
        >
          Start
        </Button>
      </div>
    </div>
  );
}
