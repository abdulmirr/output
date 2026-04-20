'use server';

import { updateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { TAG } from '@/lib/api/queries';
import { z } from 'zod';

function invalidateBlocks() {
  updateTag(TAG.blocks);
}

function invalidateDailyLogs() {
  updateTag(TAG.dailyLogs);
}

function invalidateDailyTodos() {
  updateTag(TAG.dailyTodos);
}

function invalidateLogOff() {
  updateTag(TAG.dailyLogs);
  updateTag(TAG.dailyTodos);
}

const ISO_DATETIME = z.iso.datetime({ offset: true });
const DATE_STRING = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD');
const UUID = z.uuid();
const MAX_BLOCK_DURATION = 12 * 60 * 60; // 12 hours in seconds

const SaveWorkBlockSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  startTime: ISO_DATETIME,
  endTime: ISO_DATETIME,
  duration: z.number().int().positive().max(MAX_BLOCK_DURATION),
  type: z.enum(['stopwatch', 'timer']),
  plannedDuration: z.number().int().positive().max(MAX_BLOCK_DURATION).nullable(),
  focusScore: z.number().int().min(1).max(5).nullable(),
  thoughts: z.string().max(5000).nullable(),
});

const AddManualBlockSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  startTime: ISO_DATETIME,
  endTime: ISO_DATETIME,
  focusScore: z.number().int().min(1).max(5).nullable().optional(),
  thoughts: z.string().max(5000).nullable().optional(),
});

const UpdateWorkBlockSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  startTime: ISO_DATETIME.optional(),
  endTime: ISO_DATETIME.optional(),
  focusScore: z.number().int().min(1).max(5).nullable().optional(),
  thoughts: z.string().max(5000).nullable().optional(),
});

export async function saveWorkBlock(block: {
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: 'stopwatch' | 'timer';
  plannedDuration: number | null;
  focusScore: number | null;
  thoughts: string | null;
}) {
  const parsed = SaveWorkBlockSchema.safeParse(block);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  if (end <= start) return { error: 'End time must be after start time' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('work_blocks').insert({
    user_id: user.id,
    title: data.title,
    start_time: data.startTime,
    end_time: data.endTime,
    duration: data.duration,
    type: data.type,
    planned_duration: data.plannedDuration,
    focus_score: data.focusScore,
    thoughts: data.thoughts,
    status: 'completed',
  });

  if (error) return { error: error.message };
  invalidateBlocks();
  return { success: true };
}

export async function addManualBlock(data: {
  title: string;
  startTime: string;
  endTime: string;
  focusScore?: number | null;
  thoughts?: string | null;
}) {
  const parsed = AddManualBlockSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const validData = parsed.data;
  const start = new Date(validData.startTime);
  const end = new Date(validData.endTime);
  if (end <= start) return { error: 'End time must be after start time' };

  const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
  if (duration > MAX_BLOCK_DURATION) return { error: 'Block duration cannot exceed 12 hours' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('work_blocks').insert({
    user_id: user.id,
    title: validData.title,
    start_time: validData.startTime,
    end_time: validData.endTime,
    duration,
    type: 'stopwatch',
    status: 'completed',
    ...(validData.focusScore != null ? { focus_score: validData.focusScore } : {}),
    ...(validData.thoughts != null ? { thoughts: validData.thoughts } : {}),
  });

  if (error) return { error: error.message };
  invalidateBlocks();
  return { success: true };
}

export async function updateDailyThoughts(date: string, thoughts: string) {
  const parsedDate = DATE_STRING.safeParse(date);
  if (!parsedDate.success) return { error: 'Invalid date format' };
  const parsedThoughts = z.string().max(10000).safeParse(thoughts);
  if (!parsedThoughts.success) return { error: 'Thoughts too long' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: existing } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', date)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('daily_logs')
      .update({ daily_thoughts: thoughts })
      .eq('id', existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('daily_logs').insert({
      user_id: user.id,
      date,
      daily_thoughts: thoughts,
    });
    if (error) return { error: error.message };
  }

  invalidateDailyLogs();
  return { success: true };
}

const LogOffSchema = z.object({
  date: DATE_STRING,
  focusScore: z.number().int().min(1).max(5),
  reflection: z.string().max(5000),
  tomorrowTasks: z.array(z.string().max(500)).max(10),
});

export async function logOff(data: {
  date: string;
  focusScore: number;
  reflection: string;
  tomorrowTasks: string[];
}) {
  const parsed = LogOffSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const validData = parsed.data;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: existing } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', validData.date)
    .single();

  let logId: string;

  if (existing) {
    const { error } = await supabase
      .from('daily_logs')
      .update({
        daily_focus_score: validData.focusScore,
        daily_reflection: validData.reflection,
        logged_off: true,
      })
      .eq('id', existing.id);
    if (error) return { error: error.message };
    logId = existing.id;
  } else {
    const { data: newLog, error } = await supabase
      .from('daily_logs')
      .insert({
        user_id: user.id,
        date: validData.date,
        daily_focus_score: validData.focusScore,
        daily_reflection: validData.reflection,
        logged_off: true,
      })
      .select('id')
      .single();
    if (error || !newLog) return { error: error?.message || 'Failed to create log' };
    logId = newLog.id;
  }

  // Create tomorrow's daily todos
  const tomorrow = new Date(validData.date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const { data: tomorrowLog } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', tomorrowStr)
    .single();

  let tomorrowLogId: string | null = tomorrowLog?.id || null;

  if (!tomorrowLogId) {
    const { data: newTomorrowLog } = await supabase
      .from('daily_logs')
      .insert({ user_id: user.id, date: tomorrowStr })
      .select('id')
      .single();
    tomorrowLogId = newTomorrowLog?.id || null;
  }

  const todosToInsert = validData.tomorrowTasks
    .filter((t) => t.trim())
    .map((text, i) => ({
      user_id: user.id,
      daily_log_id: tomorrowLogId,
      task_text: text.trim(),
      completed: false,
      sort_order: i,
      date: tomorrowStr,
    }));

  if (todosToInsert.length > 0) {
    const { error: todoError } = await supabase
      .from('daily_todos')
      .insert(todosToInsert);
    if (todoError) return { error: todoError.message };
  }

  invalidateLogOff();
  return { success: true, logId };
}

// ── Daily Todo actions ──

export async function addDailyTodo(date: string, taskText: string) {
  const parsedDate = DATE_STRING.safeParse(date);
  if (!parsedDate.success) return { error: 'Invalid date format' };
  const parsedText = z.string().min(1).max(500).safeParse(taskText);
  if (!parsedText.success) return { error: parsedText.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let { data: log } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', date)
    .single();

  if (!log) {
    const { data: newLog } = await supabase
      .from('daily_logs')
      .insert({ user_id: user.id, date })
      .select('id')
      .single();
    log = newLog;
  }

  const { count } = await supabase
    .from('daily_todos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('date', date);

  const { error } = await supabase.from('daily_todos').insert({
    user_id: user.id,
    daily_log_id: log?.id,
    task_text: taskText.trim(),
    completed: false,
    sort_order: count || 0,
    date,
  });

  if (error) return { error: error.message };
  invalidateDailyTodos();
  return { success: true };
}

export async function toggleDailyTodo(id: string, completed: boolean) {
  const parsedId = UUID.safeParse(id);
  if (!parsedId.success) return { error: 'Invalid ID' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('daily_todos')
    .update({ completed })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  invalidateDailyTodos();
  return { success: true };
}

export async function removeDailyTodo(id: string) {
  const parsedId = UUID.safeParse(id);
  if (!parsedId.success) return { error: 'Invalid ID' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('daily_todos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  invalidateDailyTodos();
  return { success: true };
}

export async function updateWorkBlock(id: string, data: {
  title?: string;
  startTime?: string;
  endTime?: string;
  focusScore?: number | null;
  thoughts?: string | null;
}) {
  const parsedId = UUID.safeParse(id);
  if (!parsedId.success) return { error: 'Invalid ID' };
  const parsed = UpdateWorkBlockSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const validData = parsed.data;

  if (validData.startTime && validData.endTime) {
    const start = new Date(validData.startTime);
    const end = new Date(validData.endTime);
    if (end <= start) return { error: 'End time must be after start time' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updates: Record<string, unknown> = {};
  if (validData.title !== undefined) updates.title = validData.title;
  if (validData.startTime !== undefined) updates.start_time = validData.startTime;
  if (validData.endTime !== undefined) updates.end_time = validData.endTime;
  if (validData.focusScore !== undefined) updates.focus_score = validData.focusScore;
  if (validData.thoughts !== undefined) updates.thoughts = validData.thoughts;

  if (validData.startTime && validData.endTime) {
    const start = new Date(validData.startTime);
    const end = new Date(validData.endTime);
    updates.duration = Math.floor((end.getTime() - start.getTime()) / 1000);
  }

  const { error } = await supabase
    .from('work_blocks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  invalidateBlocks();
  return { success: true };
}

export async function updateWorkBlockQuality(id: string, quality: 'deep' | 'meh' | 'distracted' | null) {
  const parsedId = UUID.safeParse(id);
  if (!parsedId.success) return { error: 'Invalid ID' };
  const parsedQuality = z.enum(['deep', 'meh', 'distracted']).nullable().safeParse(quality);
  if (!parsedQuality.success) return { error: 'Invalid quality value' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('work_blocks')
    .update({ quality })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  invalidateBlocks();
  return { success: true };
}

export async function updateWorkBlockFocusScore(id: string, focusScore: number | null) {
  const parsedId = UUID.safeParse(id);
  if (!parsedId.success) return { error: 'Invalid ID' };
  const parsedScore = z.number().int().min(1).max(5).nullable().safeParse(focusScore);
  if (!parsedScore.success) return { error: 'Focus score must be between 1 and 5' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('work_blocks')
    .update({ focus_score: focusScore })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  invalidateBlocks();
  return { success: true };
}

export async function removeWorkBlock(id: string) {
  const parsedId = UUID.safeParse(id);
  if (!parsedId.success) return { error: 'Invalid ID' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('work_blocks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  invalidateBlocks();
  return { success: true };
}

export async function reorderDailyTodos(orderedIds: string[]) {
  const parsed = z.array(UUID).min(1).max(50).safeParse(orderedIds);
  if (!parsed.success) return { error: 'Invalid IDs' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updates = parsed.data.map((id, index) =>
    supabase
      .from('daily_todos')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('user_id', user.id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  invalidateDailyTodos();
  return { success: true };
}

export async function moveDailyTodoToTomorrow(id: string) {
  const parsedId = UUID.safeParse(id);
  if (!parsedId.success) return { error: 'Invalid ID' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: todo } = await supabase
    .from('daily_todos')
    .select('date')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!todo) return { error: 'Todo not found' };

  const tomorrow = new Date(todo.date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  let { data: log } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', tomorrowStr)
    .single();

  if (!log) {
    const { data: newLog } = await supabase
      .from('daily_logs')
      .insert({ user_id: user.id, date: tomorrowStr })
      .select('id')
      .single();
    log = newLog;
  }

  const { count } = await supabase
    .from('daily_todos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('date', tomorrowStr);

  const { error } = await supabase
    .from('daily_todos')
    .update({
      date: tomorrowStr,
      daily_log_id: log?.id,
      sort_order: count || 0,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  invalidateDailyTodos();
  return { success: true };
}

export async function updateDailyTodo(id: string, taskText: string) {
  const parsedId = UUID.safeParse(id);
  if (!parsedId.success) return { error: 'Invalid ID' };
  const parsedText = z.string().min(1).max(500).safeParse(taskText);
  if (!parsedText.success) return { error: parsedText.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('daily_todos')
    .update({ task_text: taskText.trim() })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  invalidateDailyTodos();
  return { success: true };
}
