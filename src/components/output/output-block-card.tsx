'use client';

import { WorkBlock } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import { Pencil, X } from 'lucide-react';

const RATING_WORDS: Record<number, string> = {
  1: 'wasted',
  2: 'distracted',
  3: 'ok',
  4: 'good',
  5: 'deep',
};

interface OutputBlockCardProps {
  block: WorkBlock;
  onEdit?: (block: WorkBlock) => void;
  onDelete?: (block: WorkBlock) => void;
  showDuration: boolean;
  onToggleDuration: () => void;
  showRatingLabel: boolean;
  onToggleRatingLabel: () => void;
}

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

export function OutputBlockCard({ block, onEdit, onDelete, showDuration, onToggleDuration, showRatingLabel, onToggleRatingLabel }: OutputBlockCardProps) {
  const focusScore = block.focusScore ?? null;

  return (
    <div className="flex items-start gap-3 py-3.5 group hover:bg-foreground/[0.03] rounded-md px-2 -mx-2 transition-colors">
      {/* Time — default: duration (xxm), click to toggle to time range */}
      <div
        className="text-sm text-muted-foreground font-mono w-28 shrink-0 pt-0.5 cursor-pointer hover:text-foreground transition-colors select-none"
        onClick={onToggleDuration}
        title="Click to toggle all time/duration"
      >
        {block.endTime
          ? (!showDuration
              ? `${formatDuration(block.duration)}${block.type === 'timer' ? ' (timer)' : ''}`
              : formatMinimalTimeRange(block.startTime, block.endTime))
          : 'In progress'}
      </div>

      {/* Focus rating — always present to keep title column aligned */}
      {/* Default: word label, click to toggle to number */}
      <div className="w-24 shrink-0 pt-0.5">
        <button
          onClick={focusScore !== null ? onToggleRatingLabel : undefined}
          className={`text-sm font-mono select-none transition-colors ${
            focusScore !== null
              ? `hover:opacity-70 cursor-pointer ${
                  focusScore === 1 ? 'text-red-500' :
                  focusScore === 2 ? 'text-orange-500' :
                  focusScore === 3 ? 'text-yellow-500' :
                  focusScore === 4 ? 'text-lime-500' :
                  'text-green-500'
                }`
              : 'text-transparent group-hover:text-foreground/30 cursor-default'
          }`}
        >
          {focusScore !== null
            ? (!showRatingLabel ? RATING_WORDS[focusScore] : `${focusScore}/5`)
            : 'x/5'}
        </button>
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-light whitespace-pre-wrap break-words">{block.title}</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center shrink-0 mt-0.5">
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
