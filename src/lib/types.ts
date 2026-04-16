export type UserRole = 'founder' | 'developer' | 'designer' | 'student' | 'creator' | 'other';

export type WorkBlockType = 'stopwatch' | 'timer';
export type WorkBlockStatus = 'idle' | 'active' | 'completed' | 'discarded';
export type WorkBlockQuality = 'deep' | 'meh' | 'distracted';
export type TaskStatus = 'pending' | 'completed' | 'deleted';

export interface WorkBlock {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // seconds
  type: WorkBlockType;
  plannedDuration: number | null; // seconds, for timer type
  focusScore: number | null; // 1-5
  thoughts: string | null;
  status: WorkBlockStatus;
  quality: WorkBlockQuality | null;
  createdAt: Date;
}

export interface TaskFolder {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  notes: string | null;
  dueDate: Date | null;
  status: TaskStatus;
  folderId: string | null;
  estimatedDuration: number | null; // seconds
  sortOrder: number;
  createdAt: Date;
  completedAt: Date | null;
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  dailyThoughts: string;
  dailyFocusScore: number | null; // 1-5
  dailyReflection: string | null;
  loggedOff: boolean;
  createdAt: Date;
}

export interface DailyTodo {
  id: string;
  taskText: string;
  completed: boolean;
  order: number;
  date: string; // YYYY-MM-DD
  taskId: string | null; // linked task id, if any
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  theme: 'light-grid' | 'light' | 'dark';
  createdAt: Date;
  role: UserRole | null;
  dailyGoalHours: number;
  timezone: string | null;
  onboardingCompleted: boolean;
  hasCompletedFirstBlock: boolean;
}
