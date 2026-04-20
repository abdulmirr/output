'use client';

import { Portal } from '@/components/shared/portal';
import { Button } from '@/components/ui/button';
import { parseTimeRange, toDisplayLabel } from './time-picker-dropdown';
import { useState, useTransition } from 'react';
import { addManualBlock } from '@/app/(app)/output/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { FOCUS_TEXT_COLORS, FOCUS_EMOJIS } from '@/lib/constants';
import { formatDuration } from '@/lib/utils';

const RATING_WORDS: Record<number, string> = {
  1: 'wasted',
  2: 'distracted',
  3: 'ok',
  4: 'good',
  5: 'deep',
};

interface AddBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: string;
}

export function AddBlockDialog({ open, onOpenChange, date }: AddBlockDialogProps) {
  const [title, setTitle] = useState('');
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [notes, setNotes] = useState('');
  const [focusScore, setFocusScore] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!open) return null;

  const { start: parsedStart, end: parsedEnd } = parseTimeRange(startInput, endInput);

  const durationSeconds = (() => {
    if (!parsedStart || !parsedEnd) return null;
    const [sh, sm] = parsedStart.split(':').map(Number);
    const [eh, em] = parsedEnd.split(':').map(Number);
    const diff = (eh * 60 + em - sh * 60 - sm) * 60;
    return diff > 0 ? diff : null;
  })();

  const canSave = !!title.trim() && !!parsedStart && !!parsedEnd && !!durationSeconds;

  const handleClose = () => {
    onOpenChange(false);
    setTitle('');
    setStartInput('');
    setEndInput('');
    setNotes('');
    setFocusScore(null);
  };

  const handleSave = () => {
    if (!canSave || !parsedStart || !parsedEnd) return;

    const today = date ? new Date(date + 'T12:00:00') : new Date();
    const [sh, sm] = parsedStart.split(':').map(Number);
    const [eh, em] = parsedEnd.split(':').map(Number);

    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), sh, sm);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), eh, em);

    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }

    startTransition(async () => {
      const result = await addManualBlock({
        title: title.trim(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        focusScore,
        thoughts: notes.trim() || null,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Work block added!');
        handleClose();
        router.refresh();
      }
    });
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <div className="fixed inset-0 bg-black/40" onClick={handleClose} />
        <div
          className="relative z-10 w-[27rem] rounded-xl border border-border bg-background shadow-xl"
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleClose();
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-border/50">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              New Work Block
            </span>
            <button
              onClick={handleClose}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-5 space-y-6">
            {/* Start time */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Start time</label>
              <input
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                }}
                placeholder="9am, 14:30, 2:30pm…"
                className="w-full text-sm bg-transparent outline-none border-b border-transparent focus:border-border/60 transition-colors pb-1 placeholder:text-muted-foreground/40"
                autoFocus
                autoComplete="off"
              />
              {parsedStart && (
                <p className="text-xs text-muted-foreground">{toDisplayLabel(parsedStart)}</p>
              )}
              {startInput.trim() && !parsedStart && (
                <p className="text-xs text-muted-foreground/50">Try: 9am, 2:30pm, 14:30</p>
              )}
            </div>

            {/* End time */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">End time</label>
              <input
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                }}
                placeholder="11am, 16:00…"
                className="w-full text-sm bg-transparent outline-none border-b border-transparent focus:border-border/60 transition-colors pb-1 placeholder:text-muted-foreground/40"
                autoComplete="off"
              />
              {parsedEnd && (
                <p className="text-xs text-muted-foreground">{toDisplayLabel(parsedEnd)}</p>
              )}
              {endInput.trim() && !parsedEnd && (
                <p className="text-xs text-muted-foreground/50">Try: 11am, 4:30pm, 16:00</p>
              )}
              {durationSeconds && (
                <p className="text-xs text-muted-foreground">Duration: {formatDuration(durationSeconds)}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Work block</label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    if (canSave) handleSave();
                  }
                }}
                rows={2}
                className="w-full text-sm bg-transparent outline-none resize-none leading-snug placeholder:text-muted-foreground/40"
                placeholder="What did you work on?"
                autoComplete="off"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes…"
                rows={3}
                className="w-full text-sm bg-transparent outline-none resize-none placeholder:text-muted-foreground/40 leading-relaxed"
                autoComplete="off"
              />
            </div>

            {/* Focus rating */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Focus rating</label>
                {focusScore !== null && (
                  <button
                    type="button"
                    onClick={() => setFocusScore(null)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    clear
                  </button>
                )}
              </div>
              {focusScore === null ? (
                <button
                  type="button"
                  onClick={() => setFocusScore(3)}
                  className="w-full py-2 rounded border border-dashed border-border text-xs text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors"
                >
                  add rating
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{FOCUS_EMOJIS[focusScore]}</span>
                    <span className={`text-sm font-mono ${FOCUS_TEXT_COLORS[focusScore]}`}>
                      {focusScore}/5 — {RATING_WORDS[focusScore]}
                    </span>
                  </div>
                  <Slider
                    value={[focusScore]}
                    onValueChange={(v) => setFocusScore(v[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>wasted</span>
                    <span>deep</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Discard
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={!canSave || isPending}
              >
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
