'use client';

import { useState, useMemo } from 'react';
import { useTaskStore } from '@/stores/task-store';
import { TaskItem } from './task-item';
import { TaskEmptyState } from './task-empty-state';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

type InboxFilter = 'all' | 'today' | 'week';

interface InboxViewProps {
  folderId: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenCreate: () => void;
  onFirstRowInteract?: () => void;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfWeek(date: Date) {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function InboxView({
  folderId,
  onToggle,
  onDelete,
  onOpenCreate,
  onFirstRowInteract,
}: InboxViewProps) {
  const { tasks } = useTaskStore();
  const [filter, setFilter] = useState<InboxFilter>('all');

  const filteredTasks = useMemo(() => {
    const now = new Date();

    const base = tasks
      .filter(
        (t) =>
          t.status !== 'deleted' &&
          t.status !== 'completed' &&
          t.folderId === folderId
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (filter === 'all') return base;

    if (filter === 'today') {
      return base.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), now));
    }

    if (filter === 'week') {
      const weekStart = getStartOfWeek(now);
      const weekEnd = getEndOfWeek(now);
      return base.filter((t) => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d >= weekStart && d <= weekEnd;
      });
    }

    return base;
  }, [tasks, folderId, filter]);

  const filters: { label: string; value: InboxFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
  ];

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              filter === f.value
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <SortableContext
        items={filteredTasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0 ml-6">
          {filteredTasks.length === 0 && (
            <TaskEmptyState
              folderName={
                filter === 'today'
                  ? 'today'
                  : filter === 'week'
                  ? 'this week'
                  : 'Inbox'
              }
            />
          )}
          {filteredTasks.map((task, i) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              tourTargetId={i === 0 ? 'tasks.first-row' : undefined}
              onInteract={i === 0 ? onFirstRowInteract : undefined}
            />
          ))}
          <div className="mt-2 -ml-1">
            <button
              onClick={onOpenCreate}
              className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="New task"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SortableContext>
    </div>
  );
}
