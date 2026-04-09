'use client';

import { useState, useMemo } from 'react';
import { useTaskStore } from '@/stores/task-store';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDuration } from './duration-dialog';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleTask } from '@/app/(app)/tasks/actions';

type FilterPeriod = 'all' | 'day' | 'week' | 'month';

interface CompletedViewProps {
  onToggle: (id: string) => void;
}

export function CompletedView({ onToggle }: CompletedViewProps) {
  const { tasks, folders } = useTaskStore();
  const [filter, setFilter] = useState<FilterPeriod>('all');

  const completedTasks = useMemo(() => {
    let completed = tasks
      .filter((t) => t.status === 'completed')
      .sort(
        (a, b) =>
          (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)
      );

    if (filter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (filter === 'day') cutoff.setDate(now.getDate() - 1);
      else if (filter === 'week') cutoff.setDate(now.getDate() - 7);
      else if (filter === 'month') cutoff.setMonth(now.getMonth() - 1);

      completed = completed.filter(
        (t) => t.completedAt && t.completedAt >= cutoff
      );
    }

    return completed;
  }, [tasks, filter]);

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return null;
    return folders.find((f) => f.id === folderId)?.name || null;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor(
      (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const filters: { label: string; value: FilterPeriod }[] = [
    { label: 'All', value: 'all' },
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
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

      {completedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium">No completed tasks</p>
          <p className="text-xs text-muted-foreground mt-1">
            Completed tasks will show up here
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {completedTasks.map((task) => {
            const folderName = getFolderName(task.folderId);
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-accent/30 transition-colors"
              >
                <Checkbox
                  checked
                  onCheckedChange={() => onToggle(task.id)}
                  className="h-4 w-4"
                />
                <span className="flex-1 min-w-0 text-base line-through text-muted-foreground truncate">
                  {task.title}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {task.estimatedDuration && (
                    <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded tabular-nums">
                      {formatDuration(task.estimatedDuration)}
                    </span>
                  )}
                  {folderName && (
                    <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                      {folderName}
                    </span>
                  )}
                  {task.completedAt && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatDate(task.completedAt)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
