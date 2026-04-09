import { create } from 'zustand';
import type { Task, TaskFolder } from '@/lib/types';

interface TaskState {
  tasks: Task[];
  folders: TaskFolder[];
  selectedTaskId: string | null;
  
  // Initialization
  setInitialData: (tasks: Task[], folders: TaskFolder[]) => void;
  
  // Selection
  selectTask: (id: string | null) => void;
  
  // Optimistic Mutations
  addTaskOptimistic: (task: Task) => void;
  updateTaskOptimistic: (id: string, updates: Partial<Task>) => void;
  deleteTaskOptimistic: (id: string) => void;
  setTasksOrderOptimistic: (tasks: Task[]) => void;
  
  addFolderOptimistic: (folder: TaskFolder) => void;
  deleteFolderOptimistic: (id: string, inboxId: string | null) => void;
}

export const useTaskStore = create<TaskState>()((set) => ({
  tasks: [],
  folders: [],
  selectedTaskId: null,
  
  setInitialData: (tasks, folders) => {
    set((state) => {
      // Small optimization: only update if lengths/ids differ significantly, or just force replace.
      // Force replacing is fine since this is called on mount/refresh
      return { tasks, folders };
    });
  },
  
  selectTask: (id) => set({ selectedTaskId: id }),
  
  addTaskOptimistic: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  
  updateTaskOptimistic: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t)
  })),
  
  deleteTaskOptimistic: (id) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === id ? { ...t, status: 'deleted' as const } : t),
    selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId
  })),
  
  setTasksOrderOptimistic: (tasks) => set({ tasks }),
  
  addFolderOptimistic: (folder) => set((state) => ({
    folders: [...state.folders, folder]
  })),
  
  deleteFolderOptimistic: (id, inboxId) => set((state) => ({
    folders: state.folders.filter((f) => f.id !== id),
    // Move orphaned tasks to Inbox
    tasks: state.tasks.map((t) => t.folderId === id ? { ...t, folderId: inboxId } : t)
  }))
}));
