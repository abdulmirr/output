'use client';

import { Task } from '@/lib/types';
import { TaskItem } from './task-item';
import { TaskEmptyState } from './task-empty-state';
import { Plus } from 'lucide-react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface TaskListProps {
  tasks: Task[];
  folderId: string;
  folderName: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenCreate?: () => void;
  onFirstRowInteract?: () => void;
}

export function TaskList({
  tasks,
  folderId,
  folderName,
  onToggle,
  onDelete,
  onOpenCreate,
  onFirstRowInteract,
}: TaskListProps) {
  const filtered = tasks
    .filter(
      (t) =>
        t.status !== 'deleted' &&
        t.status !== 'completed' &&
        t.folderId === folderId
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <SortableContext
      items={filtered.map((t) => t.id)}
      strategy={verticalListSortingStrategy}
    >
      <div className="space-y-0 ml-6">
        {filtered.length === 0 && !onOpenCreate && (
          <TaskEmptyState folderName={folderName} />
        )}
        {filtered.map((task, i) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            tourTargetId={i === 0 ? 'tasks.first-row' : undefined}
            onInteract={i === 0 ? onFirstRowInteract : undefined}
          />
        ))}
        {onOpenCreate && (
          <div className="mt-2 -ml-1">
            <button
              onClick={onOpenCreate}
              className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="New task"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </SortableContext>
  );
}
