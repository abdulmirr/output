'use client';

import { WorkBlock } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import { Pencil, X } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { parseTimeRange } from './time-picker-dropdown';
import { updateWorkBlock, updateWorkBlockFocusScore } from '@/app/(app)/output/actions';
import { toast } from 'sonner';

const RATING_WORDS: Record<number, string> = {
  1: 'wasted',
  2: 'distracted',
  3: 'ok',
  4: 'good',
  5: 'deep',
};

const RATING_COLORS: Record<number, string> = {
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-yellow-500',
  4: 'text-lime-500',
  5: 'text-green-500',
};

function formatMinimalTimeRange(start: string | Date, end: string | Date): string {
  const s = new Date(start);
  const e = new Date(end);

  const formatTime = (d: Date) => {
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const mStr = m === 0 ? '' : `:${m.toString().padStart(2, '0')}`;
    return { h, mStr, ampm };
  };

  const sTime = formatTime(s);
  const eTime = formatTime(e);

  return `${sTime.h}${sTime.mStr}-${eTime.h}${eTime.mStr} ${eTime.ampm}`;
}

interface OutputBlockCardProps {
  block: WorkBlock;
  onEdit?: (block: WorkBlock) => void;
  onDelete?: (block: WorkBlock) => void;
  showDuration: boolean;
  onToggleDuration: () => void;
  showRatingLabel: boolean;
  onToggleRatingLabel: () => void;
}

export function OutputBlockCard({ block, onEdit, onDelete, showDuration, onToggleDuration, showRatingLabel, onToggleRatingLabel }: OutputBlockCardProps) {
  const focusScore = block.focusScore ?? null;
  const hasTime = !!block.endTime;

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [, startTransition] = useTransition();

  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const timeWrapRef = useRef<HTMLDivElement>(null);
  const ratingWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditingTime) {
      setStartInput('');
      setEndInput('');
      setTimeout(() => startRef.current?.focus(), 0);
    }
  }, [isEditingTime]);

  useEffect(() => {
    if (!isEditingTime) return;
    const handler = (e: MouseEvent) => {
      if (!timeWrapRef.current?.contains(e.target as Node)) setIsEditingTime(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isEditingTime]);

  useEffect(() => {
    if (!isEditingRating) return;
    const handler = (e: MouseEvent) => {
      if (!ratingWrapRef.current?.contains(e.target as Node)) setIsEditingRating(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isEditingRating]);

  const handleSaveTimes = () => {
    const { start, end } = parseTimeRange(startInput, endInput);
    if (!start || !end) {
      setIsEditingTime(false);
      return;
    }
    const base = new Date(block.startTime);
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startDate = new Date(base.getFullYear(), base.getMonth(), base.getDate(), sh, sm);
    const endDate = new Date(base.getFullYear(), base.getMonth(), base.getDate(), eh, em);
    if (endDate <= startDate) {
      toast.error('End time must be after start time');
      return;
    }
    setIsEditingTime(false);
    startTransition(async () => {
      const result = await updateWorkBlock(block.id, {
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      });
      if (result?.error) toast.error(result.error);
    });
  };

  const handleSetRating = (n: number) => {
    setIsEditingRating(false);
    startTransition(async () => {
      const result = await updateWorkBlockFocusScore(block.id, n);
      if (result?.error) toast.error(result.error);
    });
  };

  const renderTime = () => {
    if (isEditingTime) {
      return (
        <div ref={timeWrapRef} className="flex items-center gap-1 font-sans">
          <input
            ref={startRef}
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { e.preventDefault(); setIsEditingTime(false); }
              if (e.key === 'Enter') { e.preventDefault(); endRef.current?.focus(); }
            }}
            placeholder="9am"
            className="w-12 text-[13px] bg-transparent outline-none border-b border-border/40 focus:border-border pb-px placeholder:text-muted-foreground/40"
            autoComplete="off"
          />
          <span className="text-muted-foreground/40 text-xs">→</span>
          <input
            ref={endRef}
            value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { e.preventDefault(); setIsEditingTime(false); }
              if (e.key === 'Enter') { e.preventDefault(); handleSaveTimes(); }
            }}
            placeholder="11am"
            className="w-12 text-[13px] bg-transparent outline-none border-b border-border/40 focus:border-border pb-px placeholder:text-muted-foreground/40"
            autoComplete="off"
          />
        </div>
      );
    }

    if (hasTime) {
      return (
        <div
          className="cursor-pointer hover:text-foreground transition-colors select-none"
          onClick={onToggleDuration}
          title="Click to toggle all time/duration"
        >
          {!showDuration
            ? `${formatDuration(block.duration)}${block.type === 'timer' ? ' (timer)' : ''}`
            : formatMinimalTimeRange(block.startTime, block.endTime!)}
        </div>
      );
    }

    if (block.status !== 'completed') {
      return <span className="select-none">In progress</span>;
    }

    return (
      <button
        type="button"
        onClick={() => setIsEditingTime(true)}
        className="text-muted-foreground/40 hover:text-foreground transition-colors cursor-pointer select-none"
        title="Add time"
      >
        —
      </button>
    );
  };

  const renderRating = () => {
    if (isEditingRating) {
      return (
        <div ref={ratingWrapRef} className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleSetRating(n)}
              className="text-xs font-mono text-foreground/40 hover:text-foreground transition-colors px-1 py-0.5 rounded hover:bg-foreground/[0.06]"
            >
              {n}
            </button>
          ))}
        </div>
      );
    }

    if (focusScore !== null) {
      return (
        <button
          type="button"
          onClick={onToggleRatingLabel}
          className={`text-sm font-mono select-none transition-colors hover:opacity-70 cursor-pointer ${RATING_COLORS[focusScore]}`}
        >
          {!showRatingLabel ? RATING_WORDS[focusScore] : `${focusScore}/5`}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setIsEditingRating(true)}
        className="text-sm font-mono select-none text-transparent group-hover:text-foreground/30 hover:!text-foreground/60 transition-colors cursor-pointer"
        title="Add rating"
      >
        x/5
      </button>
    );
  };

  return (
    <div className="flex items-center gap-2 py-3.5 group hover:bg-foreground/[0.03] rounded-md px-2 -mx-2 transition-colors">
      {/* Time — default: duration (xxm), click to toggle to time range. Empty: click to edit. */}
      <div className="text-[13px] text-muted-foreground font-mono w-32 shrink-0 translate-y-px whitespace-nowrap">
        {renderTime()}
      </div>

      {/* Focus rating — default: word label, click to toggle to number. Empty: click to set. */}
      <div className="w-20 shrink-0">
        {renderRating()}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-light whitespace-pre-wrap break-words">{block.title}</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center shrink-0">
        {onEdit && (
          <button
            onClick={() => onEdit(block)}
            className="p-1 opacity-0 group-hover:opacity-100 hover:text-foreground text-muted-foreground transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(block)}
            className="p-1 opacity-0 group-hover:opacity-100 hover:text-destructive text-muted-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
