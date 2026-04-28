'use client';

import { OutputBlockCard } from './output-block-card';
import { Plus } from 'lucide-react';
import { useRef, useState, useTransition, useEffect } from 'react';
import { WorkBlockDetailPanel } from './work-block-detail-panel';
import { addManualBlock, removeWorkBlock } from '@/app/(app)/output/actions';
import { parseTimeRange } from './time-picker-dropdown';
import { toast } from 'sonner';
import type { WorkBlock } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import { useTourTarget } from '@/components/tour/use-tour';

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
  const formRef = useRef<HTMLDivElement>(null);
  const [showDurations, setShowDurations] = useState(false);
  const [showRatingLabels, setShowRatingLabels] = useState(false);
  const [editBlockId, setEditBlockId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const manualBtnRef = useTourTarget('output.manual-add-button');

  const [blocks, setBlocks] = useState(initialBlocks);

  // Sync with server state when not mid-mutation (e.g. timer saves a block externally)
  useEffect(() => {
    if (!isPending) setBlocks(initialBlocks);
  }, [initialBlocks]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close the add form on outside click only when nothing has been entered
  useEffect(() => {
    if (!isAdding) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (formRef.current?.contains(target)) return;
      if (titleInput.trim() || startInput.trim() || endInput.trim()) return;
      resetAdd();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isAdding, titleInput, startInput, endInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const sortByTime = (arr: WorkBlock[]) =>
    [...arr].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const resetAdd = () => {
    setIsAdding(false);
    setStartInput('');
    setEndInput('');
    setTitleInput('');
    setFocusScore(null);
  };

  const handleSaveNew = () => {
    if (!titleInput.trim()) return;

    const hasTimeInput = !!startInput.trim() || !!endInput.trim();
    const { start: parsedStart, end: parsedEnd } = parseTimeRange(startInput, endInput);

    if (hasTimeInput && (!parsedStart || !parsedEnd)) return;

    const base = date ? new Date(date + 'T12:00:00') : new Date();

    let start: Date;
    let end: Date | null = null;

    if (parsedStart && parsedEnd) {
      const [sh, sm] = parsedStart.split(':').map(Number);
      const [eh, em] = parsedEnd.split(':').map(Number);
      start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), sh, sm);
      end = new Date(base.getFullYear(), base.getMonth(), base.getDate(), eh, em);

      if (end <= start) {
        toast.error('End time must be after start time');
        return;
      }
    } else {
      start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 12, 0);
    }

    const title = titleInput.trim();
    const score = focusScore;
    const tempId = `temp-${Date.now()}`;
    const tempBlock: WorkBlock = {
      id: tempId,
      title,
      startTime: start,
      endTime: end,
      duration: end ? Math.round((end.getTime() - start.getTime()) / 1000) : 0,
      type: 'stopwatch',
      plannedDuration: null,
      focusScore: score,
      thoughts: null,
      status: 'completed',
      quality: null,
      createdAt: new Date(),
    };

    setBlocks(prev => sortByTime([...prev, tempBlock]));
    resetAdd();

    startTransition(async () => {
      const result = await addManualBlock({
        title,
        startTime: start.toISOString(),
        endTime: end ? end.toISOString() : null,
        focusScore: score,
        thoughts: null,
      });
      if (result?.error) {
        toast.error(result.error);
        setBlocks(prev => prev.filter(b => b.id !== tempId));
      } else {
        setBlocks(prev =>
          prev.map(b =>
            b.id === tempId
              ? { ...b, id: result.id!, createdAt: new Date(result.createdAt!) }
              : b
          )
        );
      }
    });
  };

  const editBlock = blocks.find((b) => b.id === editBlockId) ?? null;

  const handleStartEdit = (block: WorkBlock) => {
    setEditBlockId(block.id);
  };

  const handleDeleteBlock = (block: WorkBlock) => {
    setBlocks(prev => prev.filter(b => b.id !== block.id));
    startTransition(async () => {
      const result = await removeWorkBlock(block.id);
      if (result?.error) {
        toast.error(result.error);
        setBlocks(prev => sortByTime([...prev, block]));
      } else {
        toast.success('Work block removed');
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mt-8">
        <h3 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
          Output
        </h3>
        {blocks.length > 0 && (
          <span className="text-xs font-mono text-foreground/40">
            {formatDuration(blocks.reduce((sum, b) => sum + b.duration, 0))} today
          </span>
        )}
      </div>

      {blocks.length === 0 ? (
        <p className="text-base font-light text-foreground/30 py-2">
          No work blocks yet today.
        </p>
      ) : (
        <div>
          {blocks.map((block, i) => (
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
          ref={formRef}
          className="mt-2 -ml-1 pl-1 space-y-2"
        >
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
            placeholder="What did you work on?"
            className="w-full text-sm bg-transparent outline-none border-b border-border/40 focus:border-border pb-0.5 placeholder:text-muted-foreground/40"
            autoFocus
            autoComplete="off"
          />
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
                  handleSaveNew();
                }
                if (e.key === 'Escape') resetAdd();
              }}
              placeholder="End (11am)"
              className="w-24 text-sm bg-transparent outline-none border-b border-border/40 focus:border-border pb-0.5 placeholder:text-muted-foreground/40"
              autoComplete="off"
            />
            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
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
            </div>
          </div>
        </div>
      ) : (
        <button
          ref={manualBtnRef}
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
