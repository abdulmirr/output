'use client';

import { Portal } from '@/components/shared/portal';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useTransition } from 'react';
import { addTask, updateTask } from '@/app/(app)/tasks/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTaskStore } from '@/stores/task-store';
import { parseDuration, formatDuration } from './duration-dialog';
import { formatDate } from './date-dialog';
import { X } from 'lucide-react';
import type { Task } from '@/lib/types';
import { useTourAdvance, useTourTarget } from '@/components/tour/use-tour';
import { useTourStore } from '@/stores/tour-store';
import { TASKS_STEPS } from '@/components/tour/steps';

interface TaskCreationDialogProps {
  visible: boolean;
  onClose: () => void;
  activeFolderId?: string | null;
  editingTask?: Task | null;
}

function formatToYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDate(input: string): string | null {
  const str = input.toLowerCase().trim();
  if (!str) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const addDays = (d: Date, n: number): Date => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  };

  // Simple keywords
  if (str === 'today' || str === 'td') return formatToYMD(today);
  if (str === 'tomorrow' || str === 'tmr' || str === 'tmrw') return formatToYMD(addDays(today, 1));
  if (str === 'yesterday') return formatToYMD(addDays(today, -1));
  if (str === 'next week') return formatToYMD(addDays(today, 7));

  // Day of week resolution — matches full names, 3-letter abbrevs (mon, tue, wed…), and longer partials
  const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const DAY_ABBREVS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const resolveDayName = (s: string): number => {
    const full = DAY_NAMES.indexOf(s);
    if (full !== -1) return full;
    // Match any prefix ≥ 3 chars against the 3-letter abbrevs (mon, tue, wed, thu, fri, sat, sun)
    if (s.length >= 3) return DAY_ABBREVS.indexOf(s.slice(0, 3));
    return -1;
  };

  // "next <day>"
  const nextDayMatch = str.match(/^next\s+(\w+)$/);
  if (nextDayMatch) {
    const idx = resolveDayName(nextDayMatch[1]);
    if (idx !== -1) {
      const currentDay = today.getDay();
      let daysUntil = idx - currentDay;
      if (daysUntil <= 0) daysUntil += 7;
      return formatToYMD(addDays(today, daysUntil));
    }
  }

  // Plain day name → next upcoming occurrence (never today)
  const plainDayIdx = resolveDayName(str);
  if (plainDayIdx !== -1) {
    const currentDay = today.getDay();
    let daysUntil = plainDayIdx - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    return formatToYMD(addDays(today, daysUntil));
  }

  // "in N days"
  const inDaysMatch = str.match(/^in\s+(\d+)\s+days?$/);
  if (inDaysMatch) return formatToYMD(addDays(today, parseInt(inDaysMatch[1], 10)));

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // MM/DD or M/D(/YYYY)
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slashMatch) {
    const month = parseInt(slashMatch[1], 10) - 1;
    const day = parseInt(slashMatch[2], 10);
    let year = slashMatch[3] ? parseInt(slashMatch[3], 10) : now.getFullYear();
    if (year < 100) year += 2000;
    return formatToYMD(new Date(year, month, day));
  }

  // Month name + day: "jan 15", "january 15", "15 jan"
  const MONTH_NAMES = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'];
  const MONTH_ABBREVS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  const resolveMonth = (s: string): number => {
    const full = MONTH_NAMES.indexOf(s);
    if (full !== -1) return full;
    return MONTH_ABBREVS.indexOf(s.slice(0, 3));
  };

  const monthDayMatch = str.match(/^([a-z]+)\s+(\d{1,2})$/) || str.match(/^(\d{1,2})\s+([a-z]+)$/);
  if (monthDayMatch) {
    const [a, b] = [monthDayMatch[1], monthDayMatch[2]];
    let monthStr: string, dayStr: string;
    if (/^\d/.test(a)) { dayStr = a; monthStr = b; }
    else { monthStr = a; dayStr = b; }
    const mIdx = resolveMonth(monthStr);
    if (mIdx !== -1) {
      const day = parseInt(dayStr, 10);
      const d = new Date(now.getFullYear(), mIdx, day);
      if (d < today) d.setFullYear(d.getFullYear() + 1);
      return formatToYMD(d);
    }
  }

  return null;
}

export function TaskCreationDialog({ visible, onClose, activeFolderId, editingTask }: TaskCreationDialogProps) {
  const [title, setTitle] = useState('');
  const [durationInput, setDurationInput] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [dateInput, setDateInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const tourAdvance = useTourAdvance();
  const detailFieldsRef = useTourTarget('tasks.detail-fields');

  const { addTaskOptimistic, updateTaskOptimistic, folders } = useTaskStore();

  useEffect(() => {
    if (visible && editingTask) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset on dialog open
      setTitle(editingTask.title);
      setDurationInput(editingTask.estimatedDuration ? formatDuration(editingTask.estimatedDuration) : '');
      setNotes(editingTask.notes || '');
      const existingDate = editingTask.dueDate ? editingTask.dueDate.toISOString().split('T')[0] : '';
      setDueDate(existingDate);
      setDateInput(existingDate ? formatDate(existingDate) : '');
    } else if (visible) {
      setTitle('');
      setDurationInput('');
      setNotes('');
      setDueDate('');
      setDateInput('');
    }
  }, [visible, editingTask]);

  const tourStage = useTourStore((s) => s.stage);
  const tourStep = useTourStore((s) => s.step);
  const tourSkipped = useTourStore((s) => s.skipped);
  const tourDismissed = useTourStore((s) => s.sessionDismissed);
  const tourSpotlightingDialog =
    tourStage === 'tasks' &&
    !tourSkipped &&
    !tourDismissed &&
    TASKS_STEPS[tourStep]?.targetId === 'tasks.detail-fields';

  if (!visible) return null;

  const isEditing = !!editingTask;

  const handleDateInput = (val: string) => {
    setDateInput(val);
    if (!val.trim()) {
      setDueDate('');
      return;
    }
    const parsed = parseDate(val);
    setDueDate(parsed ?? '');
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const estimatedDuration = durationInput ? parseDuration(durationInput) : null;
    const dueDateVal = dueDate || null;

    if (isEditing) {
      updateTaskOptimistic(editingTask.id, {
        title: title.trim(),
        estimatedDuration,
        notes: notes.trim() || null,
        dueDate: dueDateVal ? new Date(dueDateVal + 'T00:00:00') : null,
      });

      startTransition(async () => {
        const result = await updateTask(editingTask.id, {
          title: title.trim(),
          estimatedDuration,
          notes: notes.trim() || null,
          dueDate: dueDateVal,
        });
        if (result?.error) toast.error(result.error);
        else toast.success('Task updated!');
        handleReset();
        router.refresh();
      });
    } else {
      const folderId = activeFolderId || folders.find(f => f.name === 'Inbox' && f.isDefault)?.id || null;

      startTransition(async () => {
        const result = await addTask({
          title: title.trim(),
          folderId,
          estimatedDuration,
          notes: notes.trim() || null,
          dueDate: dueDateVal,
        });

        if (result?.error) {
          toast.error(result.error);
        } else if (result.success && result.task) {
          toast.success('Task created!');
          addTaskOptimistic(result.task);
          tourAdvance('tasks.detail-fields');
          handleReset();
          router.refresh();
        }
      });
    }
  };

  const handleReset = () => {
    setTitle('');
    setDurationInput('');
    setNotes('');
    setDueDate('');
    setDateInput('');
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <div
          className={tourSpotlightingDialog ? 'fixed inset-0' : 'fixed inset-0 bg-black/40'}
          onClick={handleReset}
        />
        <div ref={detailFieldsRef} className="relative z-10 w-[27rem] rounded-xl border border-border bg-background shadow-xl overflow-hidden">
          {/* Header — matches detail panel */}
          <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-border/50">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {isEditing ? 'Edit Task' : 'New Task'}
            </span>
            <button
              onClick={handleReset}
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
                if (e.key === 'Enter') { e.preventDefault(); if (title.trim()) handleSave(); }
                if (e.key === 'Escape') handleReset();
              }}
              rows={2}
              className="w-full text-base font-medium bg-transparent outline-none resize-none leading-snug placeholder:text-muted-foreground/40"
              placeholder="What do you want to get done?"
              autoFocus
              autoComplete="off"
            />

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Date</label>
              <div className="flex items-center gap-2">
                <input
                  value={dateInput}
                  onChange={(e) => handleDateInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && title.trim()) handleSave();
                    if (e.key === 'Escape') handleReset();
                  }}
                  placeholder="today, tmr, next wed…"
                  className="w-full text-sm bg-transparent outline-none border-b border-transparent focus:border-border/60 transition-colors pb-1 placeholder:text-muted-foreground/40"
                  autoComplete="off"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => { setDueDate(''); setDateInput(''); }}
                    className="p-0.5 text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
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
                placeholder="45m, 2h 30m"
                className="w-full text-sm bg-transparent outline-none border-b border-transparent focus:border-border/60 transition-colors pb-1 placeholder:text-muted-foreground/40"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && title.trim()) handleSave();
                  if (e.key === 'Escape') handleReset();
                }}
              />
              {durationInput && parseDuration(durationInput) && (
                <p className="text-xs text-muted-foreground">{formatDuration(parseDuration(durationInput)!)}</p>
              )}
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

            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Discard
              </Button>
              <Button onClick={handleSave} className="flex-1" disabled={!title.trim() || isPending}>
                {isPending ? 'Saving...' : isEditing ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
