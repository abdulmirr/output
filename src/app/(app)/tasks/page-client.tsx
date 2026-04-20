'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { TaskTabBar, DeleteFolderButton } from '@/components/tasks/task-sidebar';
import { TaskList } from '@/components/tasks/task-list';
import { CompletedView } from '@/components/tasks/completed-view';
import { InboxView } from '@/components/tasks/inbox-view';
import { TaskCreationDialog } from '@/components/tasks/task-creation-dialog';
import { TaskDetailPanel } from '@/components/tasks/task-detail-panel';
import { useTaskStore } from '@/stores/task-store';
import { useOverlayStore } from '@/stores/overlay-store';
import { useShortcutStore } from '@/stores/shortcut-store';
import { formatShortcutText } from '@/lib/shortcut-utils';
import type { Task, TaskFolder } from '@/lib/types';
import {
  toggleTask as toggleTaskAction,
  deleteTask as deleteTaskAction,
  updateTaskOrders,
  updateTask,
} from '@/app/(app)/tasks/actions';
import {
  DndContext,
  pointerWithin,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  CollisionDetection,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useTourTarget, useTourAdvance } from '@/components/tour/use-tour';

interface TasksPageClientProps {
  initialTasks: Task[];
  initialFolders: TaskFolder[];
}

// Custom collision detection: prioritize folder droppables over sortable items
const folderAwareCollision: CollisionDetection = (args) => {
  // First check if we're over any folder droppables (they have "folder:" prefix)
  const pointerCollisions = pointerWithin(args);
  const folderCollision = pointerCollisions.find((c) =>
    String(c.id).startsWith('folder:')
  );
  if (folderCollision) {
    return [folderCollision];
  }

  // Otherwise, fall back to rect intersection for sortable reordering
  return rectIntersection(args);
};

export function TasksPageClient({
  initialTasks,
  initialFolders,
}: TasksPageClientProps) {
  const {
    setInitialData,
    tasks,
    folders,
    updateTaskOptimistic,
    deleteTaskOptimistic,
    setTasksOrderOptimistic,
    selectTask,
    selectedTaskId,
  } = useTaskStore();
  const { activeOverlay, close: closeOverlay } = useOverlayStore();
  const addTaskShortcut = useShortcutStore((s) => s.addTaskShortcut);
  const [, startTransition] = useTransition();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const addBtnRef = useTourTarget('tasks.add-button');
  const tourAdvance = useTourAdvance();

  const [activeView, setActiveView] = useState<string>(() => {
    const inbox = initialFolders.find((f) => f.name === 'Inbox' && f.isDefault);
    return inbox?.id || 'completed';
  });

  useEffect(() => {
    setInitialData(initialTasks, initialFolders);
  }, [initialTasks, initialFolders, setInitialData]);

  useEffect(() => {
    if (activeView === 'completed') return;
    const exists = folders.some((f) => f.id === activeView);
    if (!exists && folders.length > 0) {
      const inbox = folders.find((f) => f.name === 'Inbox' && f.isDefault);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fall back to inbox if active folder was deleted
      if (inbox) setActiveView(inbox.id);
    }
  }, [folders, activeView]);

  // Listen for global Cmd+Shift+N
  useEffect(() => {
    if (activeOverlay === 'task-creation') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from external overlay store
      setShowCreateDialog(true);
      closeOverlay();
    }
  }, [activeOverlay, closeOverlay]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleToggle = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    updateTaskOptimistic(id, {
      status: task.status === 'completed' ? 'pending' : 'completed',
      completedAt: task.status === 'completed' ? null : new Date(),
    });

    startTransition(async () => {
      await toggleTaskAction(id, task.status);
    });

    tourAdvance('tasks.first-row');
  }, [tasks, updateTaskOptimistic, tourAdvance]);

  const handleDelete = useCallback((id: string) => {
    deleteTaskOptimistic(id);
    startTransition(async () => {
      await deleteTaskAction(id);
    });
  }, [deleteTaskOptimistic]);

  const handleCloseDialog = useCallback(() => {
    setShowCreateDialog(false);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setShowCreateDialog(true);
  }, []);


  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = String(over.id);

    // Check if dropped over a folder droppable (prefixed with "folder:")
    if (overId.startsWith('folder:')) {
      const folderId = overId.replace('folder:', '');
      const targetFolder = folders.find((f) => f.id === folderId);
      if (targetFolder) {
        updateTaskOptimistic(activeId, { folderId: targetFolder.id });
        startTransition(async () => {
          await updateTask(activeId, { folderId: targetFolder.id });
        });
        return;
      }
    }

    // Reorder within the same list
    const currentFolderTasks = tasks
      .filter(
        (t) =>
          t.status !== 'deleted' &&
          t.folderId === activeView
      )
      .sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return a.sortOrder - b.sortOrder;
      });

    const oldIndex = currentFolderTasks.findIndex((t) => t.id === activeId);
    const newIndex = currentFolderTasks.findIndex((t) => t.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(currentFolderTasks, oldIndex, newIndex);
      const updatedTasks = tasks.map((t) => {
        const idx = reordered.findIndex((r) => r.id === t.id);
        if (idx !== -1) return { ...t, sortOrder: idx };
        return t;
      });

      setTasksOrderOptimistic(updatedTasks);

      startTransition(async () => {
        await updateTaskOrders(
          reordered.map((t, i) => ({ id: t.id, sortOrder: i }))
        );
      });
    }
  }, [tasks, folders, activeView, updateTaskOptimistic, setTasksOrderOptimistic]);

  const activeFolderName =
    activeView === 'completed'
      ? 'Completed'
      : folders.find((f) => f.id === activeView)?.name || 'Tasks';

  const activeFolder = folders.find((f) => f.id === activeView);
  const isCustomFolder = activeFolder && !activeFolder.isDefault;
  const inboxId = folders.find((f) => f.name === 'Inbox' && f.isDefault)?.id;
  const isInboxView = inboxId !== undefined && activeView === inboxId;

  return (
    <div
      className="space-y-4 max-w-[640px] mx-auto"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={folderAwareCollision}
        onDragEnd={handleDragEnd}
      >
        {/* Folder tabs */}
        <TaskTabBar
          activeView={activeView}
          onViewChange={(view) => {
            setActiveView(view);
            selectTask(null);
          }}
        />

        {/* + New Task button below tabs */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-normal uppercase tracking-wider text-foreground/70">{activeFolderName}</h2>
            {/* Delete folder button inside the view */}
            {isCustomFolder && (
              <DeleteFolderButton
                folderId={activeView}
                onDeleted={() => {
                  if (inboxId) setActiveView(inboxId);
                }}
              />
            )}
          </div>
          {activeView !== 'completed' && (
            <div className="relative">
              <button
                ref={addBtnRef}
                onClick={() => {
                  handleOpenCreate();
                  tourAdvance('tasks.add-button');
                }}
                className="rounded-lg bg-foreground text-background px-4 py-1.5 text-sm font-medium hover:bg-foreground/90 transition-colors shadow-sm"
                title="Add task"
              >
                + Add Task
              </button>
              <span className="absolute top-full right-0 mt-1.5 text-[11px] text-foreground/40 font-mono whitespace-nowrap">
                {formatShortcutText(addTaskShortcut)}
              </span>
            </div>
          )}
        </div>

        {/* Task content */}
        <div className="mt-2">
          {activeView === 'completed' ? (
            <CompletedView onToggle={handleToggle} />
          ) : isInboxView ? (
            <InboxView
              folderId={activeView}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onOpenCreate={handleOpenCreate}
            />
          ) : (
            <TaskList
              tasks={tasks}
              folderId={activeView}
              folderName={activeFolderName}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onOpenCreate={handleOpenCreate}
            />
          )}
        </div>
      </DndContext>

      <TaskCreationDialog
        visible={showCreateDialog}
        onClose={handleCloseDialog}
        activeFolderId={activeView !== 'completed' ? activeView : null}
      />

      <TaskDetailPanel />
    </div>
  );
}
