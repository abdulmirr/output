'use client';

import { useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { X, GripVertical, StickyNote } from 'lucide-react';
import { Task } from '@/lib/types';
import { formatDuration } from './duration-dialog';
import { formatDate } from './date-dialog';
import { useTaskStore } from '@/stores/task-store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { useTourTarget } from '@/components/tour/use-tour';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  tourTargetId?: string;
  onInteract?: () => void;
}

export function TaskItem({ task, onToggle, onDelete, tourTargetId, onInteract }: TaskItemProps) {
  const isCompleted = task.status === 'completed';
  const { selectedTaskId, selectTask } = useTaskStore();
  const isSelected = selectedTaskId === task.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const tourRef = useTourTarget(tourTargetId ?? null);
  const composedRef = useCallback(
    (el: HTMLElement | null) => {
      setNodeRef(el);
      tourRef(el);
    },
    [setNodeRef, tourRef]
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueDateStr = task.dueDate ? task.dueDate.toISOString().split('T')[0] : null;
  const dueDateLabel = dueDateStr ? formatDate(dueDateStr) : null;
  const isOverdue = task.dueDate && !isCompleted &&
    new Date(task.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

  return (
    <div
      ref={composedRef}
      style={style}
      onClick={() => {
        selectTask(task.id);
        onInteract?.();
      }}
      className={cn(
        'flex items-start group -ml-6 rounded-md transition-colors pr-1 py-1.5 cursor-pointer',
        isSelected && 'bg-neutral-100/70 dark:bg-muted/30',
        isDragging && 'opacity-50 shadow-lg',
        !isSelected && 'hover:bg-neutral-100/70 dark:hover:bg-muted/30'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-0.5 rounded text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity w-6 flex justify-center mt-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Checkbox — wrapped to prevent opening detail panel on check */}
      <span onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => {
            onToggle(task.id);
            onInteract?.();
          }}
          className="h-4 w-4 mr-2 mt-1"
        />
      </span>

      {/* Title */}
      <span
        className={cn(
          'text-base flex-1',
          isCompleted && 'line-through text-muted-foreground'
        )}
      >
        {task.title}
      </span>

      {/* Right side: metadata + delete */}
      <div className="flex items-center gap-2.5 shrink-0 mt-1">
        {dueDateLabel && (
          <span className={cn('text-xs text-muted-foreground', isOverdue && 'text-destructive')}>
            {dueDateLabel}
          </span>
        )}
        {task.estimatedDuration && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatDuration(task.estimatedDuration)}
          </span>
        )}
        {task.notes && (
          <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
        )}

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className={cn(
            'p-1 rounded hover:bg-muted hover:text-destructive text-muted-foreground transition-opacity',
            isSelected
              ? 'opacity-70 hover:opacity-100'
              : 'opacity-0 group-hover:opacity-70 hover:!opacity-100'
          )}
          title="Delete task"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
