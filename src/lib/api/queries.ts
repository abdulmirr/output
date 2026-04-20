import { createClient } from '@/lib/supabase/server';
import type { WorkBlock, Task, TaskFolder, DailyLog, DailyTodo, UserProfile, TourProgress, WorkWindow } from '@/lib/types';
import { getLocalDayUtcRange } from '@/lib/utils';

// ── Work Blocks ──

export async function getBlocksForDate(date: string, tzOffsetMinutes = 0): Promise<WorkBlock[]> {
  const supabase = await createClient();
  const { startUtc, endUtc } = getLocalDayUtcRange(date, tzOffsetMinutes);
  const { data, error } = await supabase
    .from('work_blocks')
    .select('*')
    .eq('status', 'completed')
    .gte('start_time', startUtc)
    .lt('start_time', endUtc)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapWorkBlock);
}

export async function getAllBlocks(): Promise<WorkBlock[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('work_blocks')
    .select('*')
    .eq('status', 'completed')
    .order('start_time', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapWorkBlock);
}

// ── Task Folders ──

export async function getTaskFolders(): Promise<TaskFolder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('task_folders')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapTaskFolder);
}

// ── Tasks ──

export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .neq('status', 'deleted')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapTask);
}

export async function getCompletedTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapTask);
}

// ── Daily Logs ──

export async function getDailyLog(date: string): Promise<DailyLog | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data ? mapDailyLog(data) : null;
}

export async function getAllDailyLogs(): Promise<Record<string, DailyLog>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  const logs: Record<string, DailyLog> = {};
  (data || []).forEach((row) => {
    const log = mapDailyLog(row);
    logs[log.date] = log;
  });
  return logs;
}

// ── Daily Todos ──

export async function getTodosForDate(date: string): Promise<DailyTodo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('daily_todos')
    .select('*')
    .eq('date', date)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapDailyTodo);
}

export async function getAllDailyTodos(): Promise<DailyTodo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('daily_todos')
    .select('*')
    .order('date', { ascending: false })
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapDailyTodo);
}

// ── Profile ──

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return mapProfile(data);
}

// ── Mappers (DB row → TypeScript interface) ──

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapWorkBlock(row: any): WorkBlock {
  return {
    id: row.id,
    title: row.title,
    startTime: new Date(row.start_time),
    endTime: row.end_time ? new Date(row.end_time) : null,
    duration: row.duration,
    type: row.type,
    plannedDuration: row.planned_duration,
    focusScore: row.focus_score,
    thoughts: row.thoughts,
    status: row.status,
    quality: row.quality ?? null,
    createdAt: new Date(row.created_at),
  };
}

function mapTaskFolder(row: any): TaskFolder {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    sortOrder: row.sort_order,
    isDefault: row.is_default,
    createdAt: new Date(row.created_at),
  };
}

function mapTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    dueDate: row.due_date ? new Date(row.due_date) : null,
    status: row.status,
    folderId: row.folder_id,
    estimatedDuration: row.estimated_duration,
    sortOrder: row.sort_order ?? 0,
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
  };
}

function mapDailyLog(row: any): DailyLog {
  return {
    id: row.id,
    date: row.date,
    dailyThoughts: row.daily_thoughts || '',
    dailyFocusScore: row.daily_focus_score,
    dailyReflection: row.daily_reflection,
    loggedOff: row.logged_off,
    createdAt: new Date(row.created_at),
  };
}

function mapDailyTodo(row: any): DailyTodo {
  return {
    id: row.id,
    taskText: row.task_text,
    completed: row.completed,
    order: row.sort_order,
    date: row.date,
    taskId: row.task_id ?? null,
  };
}

function mapProfile(row: any): UserProfile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    theme: row.theme || 'light-grid',
    createdAt: new Date(row.created_at),
    role: row.role ?? null,
    dailyGoalHours: row.daily_goal_hours ?? 4,
    timezone: row.timezone ?? null,
    onboardingCompleted: row.onboarding_completed ?? false,
    hasCompletedFirstBlock: row.has_completed_first_block ?? false,
    preferredName: row.preferred_name ?? null,
    focusArea: row.focus_area ?? null,
    workWindow: (row.work_window ?? null) as WorkWindow | null,
    tourProgress: normalizeTourProgress(row.tour_progress),
  };
}

function normalizeTourProgress(raw: unknown): TourProgress {
  if (!raw || typeof raw !== 'object') {
    return { stage: 'done', step: 0, skipped: false };
  }
  const r = raw as Record<string, unknown>;
  const stage = r.stage === 'output' || r.stage === 'tasks' || r.stage === 'done' ? r.stage : 'done';
  const step = typeof r.step === 'number' ? r.step : 0;
  const skipped = typeof r.skipped === 'boolean' ? r.skipped : false;
  return { stage, step, skipped };
}

