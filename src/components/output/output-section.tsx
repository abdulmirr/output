'use client';

import { OutputBlockCard } from './output-block-card';
import { Plus } from 'lucide-react';
import { useRef, useState, useTransition, useOptimistic } from 'react';
import { WorkBlockDetailPanel } from './work-block-detail-panel';
import { addManualBlock, removeWorkBlock } from '@/app/(app)/output/actions';
import { parseTimeInput } from './time-picker-dropdown';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { WorkBlock } from '@/lib/types';
import { formatDuration } from '@/lib/utils';

interface OutputSectionProps {
  initialBlocks: WorkBlock[];
  date?: string;
}

export function OutputSection({ initialBlocks, date }: OutputSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [focusScore, setFocusScore] = useState<number | null>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [showDurations, setShowDurations] = useState(false);
  const [showRatingLabels, setShowRatingLabels] = useState(false);
  const [editBlockId, setEditBlockId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const resetAdd = () => {
    setIsAdding(false);
    setStartInput('');
    setEndInput('');
    setTitleInput('');
    setFocusScore(null);
  };

  type OptimisticAction =
    | { type: 'remove'; id: string }
    | { type: 'add'; block: WorkBlock };

  const [optimisticBlocks, applyOptimistic] = useOptimistic(
    initialBlocks,
    (state, action: OptimisticAction) => {
      if (action.type === 'remove') return state.filter((b) => b.id !== action.id);
      return [...state, action.block].sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
      );
    }
  );

  const handleSaveNew = () => {
    const parsedStart = parseTimeInput(startInput);
    const parsedEnd = parseTimeInput(endInput);
    if (!titleInput.trim() || !parsedStart || !parsedEnd) return;

    const base = date ? new Date(date + 'T12:00:00') : new Date();
    const [sh, sm] = parsedStart.split(':').map(Number);
    const [eh, em] = parsedEnd.split(':').map(Number);
    const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), sh, sm);
    const end = new Date(base.getFullYear(), base.getMonth(), base.getDate(), eh, em);

    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }

    const title = titleInput.trim();
    const score = focusScore;
    resetAdd();

    startTransition(async () => {
      applyOptimistic({
        type: 'add',
        block: {
          id: `temp-${Date.now()}`,
          title,
          startTime: start,
          endTime: end,
          duration: Math.round((end.getTime() - start.getTime()) / 1000),
          type: 'stopwatch',
          plannedDuration: null,
          focusScore: score,
          thoughts: null,
          status: 'completed',
          quality: null,
          createdAt: new Date(),
        },
      });

      const result = await addManualBlock({
        title,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        focusScore: score,
        thoughts: null,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const editBlock = optimisticBlocks.find((b) => b.id === editBlockId) ?? null;

  const handleStartEdit = (block: WorkBlock) => {
    setEditBlockId(block.id);
  };

  const handleDeleteBlock = (block: WorkBlock) => {
    startTransition(async () => {
      applyOptimistic({ type: 'remove', id: block.id });
      const result = await removeWorkBlock(block.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Work block removed');
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mt-8">
        <h3 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
          Output
        </h3>
        {optimisticBlocks.length > 0 && (
          <span className="text-xs font-mono text-foreground/40">
            {formatDuration(optimisticBlocks.reduce((sum, b) => sum + b.duration, 0))} today
          </span>
        )}
      </div>

      {optimisticBlocks.length === 0 ? (
        <p className="text-base font-light text-foreground/30 py-2">
          No work blocks yet today.
        </p>
      ) : (
        <div>
          {optimisticBlocks.map((block, i) => (
            <div key={block.id}>
              {i > 0 && <div className="h-px bg-foreground/[0.06] ml-[136px]" />}
              <OutputBlockCard
                block={block}
                onEdit={handleStartEdit}
                onDelete={handleDeleteBlock}
                showDuration={showDurations}
                onToggleDuration={() => setShowDurations(!showDurations)}
                showRatingLabel={showRatingLabels}
                onToggleRatingLabel={() => setShowRatingLabels(!showRatingLabels)}
              />
            </div>
          ))}
        </div>
      )}

      {isAdding ? (
        <div
          className="mt-2 -ml-1 pl-1 space-y-2"
        >
          <div className="flex items-center gap-2">
          <input
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                endRef.current?.focus();
              }
              if (e.key === 'Escape') resetAdd();
            }}
            placeholder="Start (9am)"
            className="w-24 text-sm bg-transparent outline-none border-b border-border/40 focus:border-border pb-0.5 placeholder:text-muted-foreground/40"
            autoFocus
            autoComplete="off"
          />
          <span className="text-muted-foreground/40 text-sm">→</span>
          <input
            ref={endRef}
            value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                titleRef.current?.focus();
              }
              if (e.key === 'Escape') resetAdd();
            }}
            placeholder="End (11am)"
            className="w-24 text-sm bg-transparent outline-none border-b border-border/40 focus:border-border pb-0.5 placeholder:text-muted-foreground/40"
            autoComplete="off"
          />
          <input
            ref={titleRef}
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveNew();
              }
              if (e.key === 'Escape') resetAdd();
            }}
            onBlur={() => {
              if (!startInput && !endInput && !titleInput) resetAdd();
            }}
            placeholder="What did you work on?"
            className="flex-1 text-sm bg-transparent outline-none border-b border-border/40 focus:border-border pb-0.5 placeholder:text-muted-foreground/40"
            autoComplete="off"
          />
          </div>
          <div className="flex items-center gap-1.5 pl-1 text-xs text-muted-foreground">
            <span className="mr-1">Focus:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setFocusScore(n)}
                className={`px-1.5 py-0.5 rounded font-mono transition-colors ${
                  focusScore === n
                    ? 'bg-foreground/[0.06] text-foreground/60'
                    : 'text-foreground/30 hover:text-foreground/60'
                }`}
                title={`Press ${n}`}
              >
                {n}
              </button>
            ))}
            {focusScore !== null && (
              <button
                type="button"
                onClick={() => setFocusScore(null)}
                className="ml-1 text-muted-foreground/50 hover:text-foreground"
              >
                clear
              </button>
            )}
            <span className="ml-auto text-muted-foreground/40">press 1–5</span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center w-6 h-6 rounded text-foreground/30 hover:text-foreground/60 transition-colors mt-2 -ml-1"
          title="Add block manually"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}

      <WorkBlockDetailPanel block={editBlock} onClose={() => setEditBlockId(null)} />
    </div>
  );
}
