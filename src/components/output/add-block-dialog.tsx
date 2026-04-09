'use client';

import { Portal } from '@/components/shared/portal';
import { Button } from '@/components/ui/button';
import { TimePickerDropdown } from './time-picker-dropdown';
import { useState, useTransition } from 'react';
import { addManualBlock } from '@/app/(app)/output/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { FOCUS_TEXT_COLORS, FOCUS_EMOJIS } from '@/lib/constants';

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
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [focusScore, setFocusScore] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!open) return null;

  const handleClose = () => {
    onOpenChange(false);
    setTitle('');
    setStartTime('');
    setEndTime('');
    setFocusScore(null);
  };

  const handleSave = () => {
    if (!title.trim() || !startTime || !endTime) return;

    const today = date ? new Date(date + 'T12:00:00') : new Date();
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);

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
        <div className="relative z-10 w-[27rem] rounded-xl border border-border bg-background shadow-xl">
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
            {/* Title */}
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); if (title.trim() && startTime && endTime) handleSave(); }
                if (e.key === 'Escape') handleClose();
              }}
              rows={2}
              className="w-full text-base font-medium bg-transparent dark:bg-transparent outline-none resize-none leading-snug placeholder:text-muted-foreground/40"
              placeholder="What did you work on?"
              autoFocus
              autoComplete="off"
            />

            {/* Start time */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Start time</label>
              <TimePickerDropdown value={startTime} onChange={setStartTime} compact />
            </div>

            {/* End time */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">End time</label>
              <TimePickerDropdown value={endTime} onChange={setEndTime} compact />
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
                disabled={!title.trim() || !startTime || !endTime || isPending}
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
