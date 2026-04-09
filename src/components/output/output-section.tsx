'use client';

import { OutputBlockCard } from './output-block-card';
import { Plus } from 'lucide-react';
import { useState, useTransition, useOptimistic } from 'react';
import { AddBlockDialog } from './add-block-dialog';
import { TimePickerDropdown } from './time-picker-dropdown';
import { Button } from '@/components/ui/button';
import { Portal } from '@/components/shared/portal';
import { X } from 'lucide-react';
import { updateWorkBlock, removeWorkBlock } from '@/app/(app)/output/actions';
import { FOCUS_TEXT_COLORS, FOCUS_EMOJIS } from '@/lib/constants';
import { Slider } from '@/components/ui/slider';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { WorkBlock } from '@/lib/types';
import { formatDuration } from '@/lib/utils';

const RATING_WORDS: Record<number, string> = {
  1: 'wasted',
  2: 'distracted',
  3: 'ok',
  4: 'good',
  5: 'deep',
};

interface OutputSectionProps {
  initialBlocks: WorkBlock[];
  date?: string;
}

function toTimeStr(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function OutputSection({ initialBlocks, date }: OutputSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDurations, setShowDurations] = useState(false);
  const [showRatingLabels, setShowRatingLabels] = useState(false);
  const [editBlock, setEditBlock] = useState<WorkBlock | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editFocusScore, setEditFocusScore] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [optimisticBlocks, removeOptimisticBlock] = useOptimistic(
    initialBlocks,
    (state, idToRemove: string) => state.filter((block) => block.id !== idToRemove)
  );

  const handleStartEdit = (block: WorkBlock) => {
    setEditBlock(block);
    setEditTitle(block.title);
    setEditStart(toTimeStr(block.startTime));
    setEditEnd(block.endTime ? toTimeStr(block.endTime) : '');
    setEditFocusScore(block.focusScore ?? null);
  };

  const handleDeleteBlock = (block: WorkBlock) => {
    startTransition(async () => {
      removeOptimisticBlock(block.id);
      const result = await removeWorkBlock(block.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Work block removed');
        router.refresh();
      }
    });
  };

  const handleSaveEdit = () => {
    if (!editBlock || !editTitle.trim() || !editStart || !editEnd) return;

    const today = new Date(editBlock.startTime);
    const [sh, sm] = editStart.split(':').map(Number);
    const [eh, em] = editEnd.split(':').map(Number);

    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), sh, sm);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), eh, em);

    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }

    startTransition(async () => {
      const result = await updateWorkBlock(editBlock.id, {
        title: editTitle.trim(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        focusScore: editFocusScore,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Work block updated!');
        setEditBlock(null);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mt-8">
        <h3 className="text-[18px] font-semibold text-foreground tracking-[-0.02em]">
          Output:
        </h3>
        {optimisticBlocks.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {formatDuration(optimisticBlocks.reduce((sum, b) => sum + b.duration, 0))} today
          </span>
        )}
      </div>

      {optimisticBlocks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No work blocks yet today.
        </p>
      ) : (
        <div>
          {optimisticBlocks.map((block, i) => (
            <div key={block.id}>
              {i > 0 && <div className="h-px bg-border/50 ml-[136px]" />}
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

      <button
        onClick={() => setShowAddDialog(true)}
        className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mt-2 -ml-1"
        title="Add block manually"
      >
        <Plus className="h-4 w-4" />
      </button>

      <AddBlockDialog open={showAddDialog} onOpenChange={setShowAddDialog} date={date} />

      {/* Edit block dialog */}
      {editBlock && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
            <div className="fixed inset-0 bg-black/40" onClick={() => setEditBlock(null)} />
            <div
              className="relative z-10 w-[27rem] rounded-xl border border-border bg-background shadow-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (editTitle.trim() && editStart && editEnd) handleSaveEdit(); }
                if (e.key === 'Escape') setEditBlock(null);
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-border/50">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Edit Work Block
                </span>
                <button
                  onClick={() => setEditBlock(null)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 py-5 space-y-6">
                <textarea
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (editTitle.trim() && editStart && editEnd) handleSaveEdit(); }
                    if (e.key === 'Escape') setEditBlock(null);
                  }}
                  rows={2}
                  className="w-full text-base font-medium bg-transparent dark:bg-transparent outline-none resize-none leading-snug placeholder:text-muted-foreground/40"
                  placeholder="What did you work on?"
                  autoFocus
                  autoComplete="off"
                />

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Start time</label>
                  <TimePickerDropdown value={editStart} onChange={setEditStart} compact />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">End time</label>
                  <TimePickerDropdown value={editEnd} onChange={setEditEnd} compact />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground">Focus rating</label>
                    {editFocusScore !== null && (
                      <button
                        type="button"
                        onClick={() => setEditFocusScore(null)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        clear
                      </button>
                    )}
                  </div>
                  {editFocusScore === null ? (
                    <button
                      type="button"
                      onClick={() => setEditFocusScore(3)}
                      className="w-full py-2 rounded border border-dashed border-border text-xs text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors"
                    >
                      add rating
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{FOCUS_EMOJIS[editFocusScore]}</span>
                        <span className={`text-sm font-mono ${FOCUS_TEXT_COLORS[editFocusScore]}`}>
                          {editFocusScore}/5 — {RATING_WORDS[editFocusScore]}
                        </span>
                      </div>
                      <Slider
                        value={[editFocusScore]}
                        onValueChange={(v) => setEditFocusScore(v[0])}
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
                  <Button variant="outline" onClick={() => setEditBlock(null)} className="flex-1">
                    Discard
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    className="flex-1"
                    disabled={!editTitle || !editStart || !editEnd || isPending}
                  >
                    {isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
