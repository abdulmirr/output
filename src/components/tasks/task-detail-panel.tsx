'use client';

import { useState, useEffect, useTransition } from 'react';
import { X } from 'lucide-react';
import { useTaskStore } from '@/stores/task-store';
import { updateTask } from '@/app/(app)/tasks/actions';
import { parseDuration, formatDuration } from './duration-dialog';
import { parseDate } from './task-creation-dialog';
import { formatDate } from './date-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function TaskDetailPanel() {
  const { selectedTaskId, tasks, selectTask, updateTaskOptimistic } = useTaskStore();
  const task = tasks.find((t) => t.id === selectedTaskId && t.status !== 'deleted') ?? null;

  const [title, setTitle] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [durationInput, setDurationInput] = useState('');
  const [notes, setNotes] = useState('');
  const [, startTransition] = useTransition();

  // Sync fields whenever the selected task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      const existingDate = task.dueDate ? task.dueDate.toISOString().split('T')[0] : '';
      setDueDate(existingDate);
      setDateInput(existingDate ? formatDate(existingDate) : '');
      setDurationInput(task.estimatedDuration ? formatDuration(task.estimatedDuration) : '');
      setNotes(task.notes || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTaskId]);

  useEffect(() => {
    if (!selectedTaskId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectTask(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedTaskId, selectTask]);

  const persist = (patch: Parameters<typeof updateTask>[1]) => {
    if (!task) return;
    startTransition(async () => {
      const result = await updateTask(task.id, patch);
      if (result?.error) toast.error(result.error);
    });
  };

  const handleTitleBlur = () => {
    if (!task || !title.trim() || title.trim() === task.title) return;
    updateTaskOptimistic(task.id, { title: title.trim() });
    persist({ title: title.trim() });
  };

  const handleDateInputChange = (val: string) => {
    setDateInput(val);
    if (!val.trim()) { setDueDate(''); return; }
    const parsed = parseDate(val);
    setDueDate(parsed ?? '');
  };

  const handleDateBlur = () => {
    if (!task) return;
    const newDate = dueDate || null;
    const currentDate = task.dueDate ? task.dueDate.toISOString().split('T')[0] : null;
    if (newDate === currentDate) return;
    updateTaskOptimistic(task.id, { dueDate: newDate ? new Date(newDate + 'T00:00:00') : null });
    persist({ dueDate: newDate });
  };

  const handleDurationBlur = () => {
    if (!task) return;
    const parsed = durationInput.trim() ? parseDuration(durationInput) : null;
    if (parsed === task.estimatedDuration) return;
    updateTaskOptimistic(task.id, { estimatedDuration: parsed });
    persist({ estimatedDuration: parsed });
  };

  const handleNotesBlur = () => {
    if (!task) return;
    const newNotes = notes.trim() || null;
    if (newNotes === task.notes) return;
    updateTaskOptimistic(task.id, { notes: newNotes });
    persist({ notes: newNotes });
  };

  const parsedDuration = durationInput ? parseDuration(durationInput) : null;

  return (
    <div
      className={cn(
        'fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-72 bg-background border-l border-border flex flex-col z-40 transition-transform duration-200 ease-in-out',
        task ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/50">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</span>
        <button
          onClick={() => selectTask(null)}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {task && (
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
            placeholder="Task title"
          />

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Date</label>
            <input
              value={dateInput}
              onChange={(e) => handleDateInputChange(e.target.value)}
              onBlur={handleDateBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              placeholder="today, tmr, next wed…"
              className="w-full text-sm bg-transparent outline-none border-b border-transparent focus:border-border/60 transition-colors pb-1 placeholder:text-muted-foreground/40"
            />
            {dueDate && (
              <p className="text-xs text-muted-foreground">{formatDate(dueDate)}</p>
            )}
            {dateInput.trim() && !dueDate && (
              <p className="text-xs text-muted-foreground/50">Try: today, tmr, next wed, mar 15</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Duration</label>
            <input
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              onBlur={handleDurationBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              placeholder="45m, 2h 30m"
              className="w-full text-sm bg-transparent outline-none border-b border-transparent focus:border-border/60 transition-colors pb-1 placeholder:text-muted-foreground/40"
            />
            {durationInput && parsedDuration && (
              <p className="text-xs text-muted-foreground">{formatDuration(parsedDuration)}</p>
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
        </div>
      )}
    </div>
  );
}
