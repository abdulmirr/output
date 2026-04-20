'use client';

import { useState } from 'react';
import { useTaskStore } from '@/stores/task-store';
import { addFolder, deleteFolder } from '@/app/(app)/tasks/actions';
import { useDroppable } from '@dnd-kit/core';
import {
  Inbox,
  Calendar,
  Check,
  Folder,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTourTarget } from '@/components/tour/use-tour';

interface TaskTabBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

function getFolderIcon(name: string, isDefault: boolean) {
  if (isDefault) {
    switch (name) {
      case 'Inbox':
        return <Inbox className="h-4 w-4" />;
      case 'Today':
        return <Calendar className="h-4 w-4" />;
    }
  }
  return <Folder className="h-4 w-4" />;
}

function DroppableFolder({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `folder:${id}` });
  return (
    <div
      ref={setNodeRef}
      className={cn(isOver && 'ring-2 ring-primary/40 rounded-lg')}
    >
      {children}
    </div>
  );
}

export function TaskTabBar({ activeView, onViewChange }: TaskTabBarProps) {
  const { folders, tasks, addFolderOptimistic } = useTaskStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const tourRef = useTourTarget('tasks.tab-bar');

  // Filter out "Today" and "This Week" — Inbox now handles sub-filtering
  const visibleDefaults = folders.filter(
    (f) => f.isDefault && f.name !== 'This Week' && f.name !== 'Today'
  );
  const customFolders = folders.filter((f) => !f.isDefault);

  const activeTasks = tasks.filter((t) => t.status !== 'deleted');

  const getCount = (folderId: string) =>
    activeTasks.filter(
      (t) => t.folderId === folderId && t.status !== 'completed'
    ).length;

  const completedCount = activeTasks.filter(
    (t) => t.status === 'completed'
  ).length;

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const result = await addFolder(newFolderName.trim(), '📋');
    if (result.error) {
      toast.error(result.error);
    } else if (result.folder) {
      addFolderOptimistic(result.folder);
      toast.success('Folder created');
    }
    setNewFolderName('');
    setIsCreating(false);
  };

  return (
    <div ref={tourRef} className="flex items-center gap-1 flex-wrap">
      {/* Default folders (Inbox, Today) */}
      {visibleDefaults.map((folder) => {
        const count = getCount(folder.id);
        return (
          <DroppableFolder key={folder.id} id={folder.id}>
            <button
              onClick={() => onViewChange(folder.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-light transition-colors',
                activeView === folder.id
                  ? 'bg-foreground/[0.07] text-foreground font-normal'
                  : 'text-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground'
              )}
            >
              {getFolderIcon(folder.name, folder.isDefault)}
              <span>{folder.name}</span>
              {count > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums ml-0.5">
                  {count}
                </span>
              )}
            </button>
          </DroppableFolder>
        );
      })}

      {/* Completed */}
      <button
        onClick={() => onViewChange('completed')}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-light transition-colors',
          activeView === 'completed'
            ? 'bg-foreground/[0.07] text-foreground font-normal'
            : 'text-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground'
        )}
      >
        <Check className="h-4 w-4" />
        <span>Completed</span>
        {completedCount > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums ml-0.5">
            {completedCount}
          </span>
        )}
      </button>

      {/* Custom folders — same row */}
      {customFolders.map((folder) => {
        const count = getCount(folder.id);
        return (
          <DroppableFolder key={folder.id} id={folder.id}>
            <button
              onClick={() => onViewChange(folder.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-light transition-colors',
                activeView === folder.id
                  ? 'bg-foreground/[0.07] text-foreground font-normal'
                  : 'text-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground'
              )}
            >
              <Folder className="h-4 w-4" />
              <span className="truncate max-w-[120px]">{folder.name}</span>
              {count > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums ml-0.5">
                  {count}
                </span>
              )}
            </button>
          </DroppableFolder>
        );
      })}

      {/* New folder: just "+" button or inline input */}
      {isCreating ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewFolderName('');
              }
            }}
            onBlur={() => {
              if (!newFolderName.trim()) {
                setIsCreating(false);
                setNewFolderName('');
              }
            }}
            placeholder="Folder name..."
            className="bg-transparent border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-ring transition-colors w-28"
          />
          <button
            onClick={() => {
              setIsCreating(false);
              setNewFolderName('');
            }}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center rounded-lg p-2 text-foreground/30 hover:bg-foreground/[0.04] hover:text-foreground/60 transition-colors"
          title="New folder"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* Delete folder button — shown inside the folder view, not on the tab */
export function DeleteFolderButton({
  folderId,
  onDeleted,
}: {
  folderId: string;
  onDeleted: () => void;
}) {
  const { folders, deleteFolderOptimistic } = useTaskStore();
  const folder = folders.find((f) => f.id === folderId);

  if (!folder || folder.isDefault) return null;

  const handleDelete = async () => {
    const inboxId =
      folders.find((f) => f.name === 'Inbox' && f.isDefault)?.id || null;
    deleteFolderOptimistic(folderId, inboxId);
    const result = await deleteFolder(folderId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Folder deleted — tasks moved to Inbox');
      onDeleted();
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10"
    >
      <X className="h-3 w-3" />
      Delete folder
    </button>
  );
}
