'use client';

import { useState, useEffect, useTransition } from 'react';
import { X } from 'lucide-react';
import { parseTimeRange, toDisplayLabel } from './time-picker-dropdown';
import { updateWorkBlock } from '@/app/(app)/output/actions';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import { FOCUS_TEXT_COLORS, FOCUS_EMOJIS } from '@/lib/constants';
import type { WorkBlock } from '@/lib/types';
import { useRouter } from 'next/navigation';

const RATING_WORDS: Record<number, string> = {
  1: 'wasted',
  2: 'distracted',
  3: 'ok',
  4: 'good',
  5: 'deep',
};

function toTimeStr(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

interface WorkBlockDetailPanelProps {
  block: WorkBlock | null;
  onClose: () => void;
}

export function WorkBlockDetailPanel({ block, onClose }: WorkBlockDetailPanelProps) {
  const [title, setTitle] = useState('');
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [notes, setNotes] = useState('');
  const [focusScore, setFocusScore] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // Keep content rendered during slide-out so the transition is smooth
  const [displayedBlock, setDisplayedBlock] = useState<WorkBlock | null>(block);
  useEffect(() => {
    if (block) {
      setDisplayedBlock(block);
    } else {
      const t = setTimeout(() => setDisplayedBlock(null), 250);
      return () => clearTimeout(t);
    }
  }, [block]);

  useEffect(() => {
    if (block) {
      setTitle(block.title);
      const startHHMM = toTimeStr(block.startTime);
      const endHHMM = block.endTime ? toTimeStr(block.endTime) : '';
      setStartInput(toDisplayLabel(startHHMM));
      setEndInput(endHHMM ? toDisplayLabel(endHHMM) : '');
      setNotes(block.thoughts || '');
      setFocusScore(block.focusScore ?? null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block?.id]);

  // Close panel on Escape — document-level so it works regardless of focus
  useEffect(() => {
    if (!block) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [block, onClose]);

  const persist = (patch: Parameters<typeof updateWorkBlock>[1]) => {
    if (!block) return;
    startTransition(async () => {
      const result = await updateWorkBlock(block.id, patch);
      if (result?.error) toast.error(result.error);
      else router.refresh();
    });
  };

  const handleTitleBlur = () => {
    if (!block) return;
    const next = title.trim();
    if (!next || next === block.title) return;
    persist({ title: next });
  };

  const buildISO = (hhmm: string, base: Date): string => {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m);
    return d.toISOString();
  };

  const { start: parsedStart, end: parsedEnd } = parseTimeRange(startInput, endInput);

  const computedDuration = (() => {
    if (!parsedStart || !parsedEnd) return null;
    const [sh, sm] = parsedStart.split(':').map(Number);
    const [eh, em] = parsedEnd.split(':').map(Number);
    const diff = (eh * 60 + em - sh * 60 - sm) * 60;
    return diff > 0 ? diff : null;
  })();

  const handleTimesBlur = () => {
    if (!block) return;
    if (!parsedStart || !parsedEnd) return;
    const base = new Date(block.startTime);
    const startISO = buildISO(parsedStart, base);
    const endISO = buildISO(parsedEnd, base);
    if (new Date(endISO) <= new Date(startISO)) {
      toast.error('End time must be after start time');
      return;
    }
    const currentStart = toTimeStr(block.startTime);
    const currentEnd = block.endTime ? toTimeStr(block.endTime) : '';
    if (parsedStart === currentStart && parsedEnd === currentEnd) return;
    persist({ startTime: startISO, endTime: endISO });
  };

  const handleNotesBlur = () => {
    if (!block) return;
    const next = notes.trim() || null;
    if (next === (block.thoughts || null)) return;
    persist({ thoughts: next });
  };

  const handleFocusChange = (v: number | null) => {
    setFocusScore(v);
    if (!block) return;
    if (v === (block.focusScore ?? null)) return;
    persist({ focusScore: v });
  };

  return (
    <div
      className={cn(
        'fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-72 bg-background border-l border-border flex flex-col z-40 transition-transform duration-200 ease-in-out',
        block ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/50">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {displayedBlock && (
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Title */}
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
            }}
            rows={2}
            className="w-full text-base font-medium bg-transparent outline-none resize-none leading-snug placeholder:text-muted-foreground/40"
            placeholder="Work block title"
          />

          {/* Start time */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Start time</label>
            <input
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              onBlur={handleTimesBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              placeholder="9am, 14:30…"
              className="w-full text-sm bg-transparent outline-none border-b border-transparent focus:border-border/60 transition-colors pb-1 placeholder:text-muted-foreground/40"
              autoComplete="off"
            />
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
              onBlur={handleTimesBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              placeholder="11am, 16:00…"
              className="w-full text-sm bg-transparent outline-none border-b border-transparent focus:border-border/60 transition-colors pb-1 placeholder:text-muted-foreground/40"
              autoComplete="off"
            />
            {endInput.trim() && !parsedEnd && (
              <p className="text-xs text-muted-foreground/50">Try: 11am, 4:30pm, 16:00</p>
            )}
            {computedDuration && (
              <p className="text-xs text-muted-foreground">Duration: {formatDuration(computedDuration)}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add notes…"
              rows={5}
              className="w-full text-sm bg-transparent outline-none resize-none placeholder:text-muted-foreground/40 leading-relaxed"
            />
          </div>

          {/* Focus rating */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Focus rating</label>
              {focusScore !== null && (
                <button
                  type="button"
                  onClick={() => handleFocusChange(null)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  clear
                </button>
              )}
            </div>
            {focusScore === null ? (
              <button
                type="button"
                onClick={() => handleFocusChange(3)}
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
                  onValueChange={(v) => handleFocusChange(v[0])}
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
        </div>
      )}
    </div>
  );
}
