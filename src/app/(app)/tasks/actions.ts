'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Task, TaskFolder } from '@/lib/types';
import { z } from 'zod';

const UUID = z.uuid();
const DATE_STRING = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD');

// ── Helper: sync a task's due_date to daily_todos ──
async function syncTaskToDailyTodo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  taskId: string,
  taskTitle: string,
  newDate: string | null,
  oldDate?: string | null
) {
  if (oldDate || newDate === null) {
    await supabase
      .from('daily_todos')
      .delete()
      .eq('task_id', taskId)
      .neq('date', newDate ?? '0000-00-00');
  }

  if (!newDate) return;

  const { data: existing } = await supabase
    .from('daily_todos')
    .select('id')
    .eq('task_id', taskId)
    .eq('date', newDate)
    .single();

  if (existing) {
    await supabase
      .from('daily_todos')
      .update({ task_text: taskTitle })
      .eq('id', existing.id);
    return;
  }

  let { data: log } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('date', newDate)
    .single();

  if (!log) {
    const { data: newLog } = await supabase
      .from('daily_logs')
      .insert({ user_id: userId, date: newDate })
      .select('id')
      .single();
    log = newLog;
  }

  const { count } = await supabase
    .from('daily_todos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('date', newDate);

  await supabase.from('daily_todos').insert({
    user_id: userId,
    daily_log_id: log?.id ?? null,
    task_text: taskTitle,
    completed: false,
    sort_order: count || 0,
    date: newDate,
    task_id: taskId,
  });
}

const AddTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  folderId: UUID.nullable(),
  estimatedDuration: z.number().int().positive().max(8 * 3600).nullable(),
  notes: z.string().max(5000).nullable(),
  dueDate: DATE_STRING.nullable().optional(),
});

export async function addTask(data: {
  title: string;
  folderId: string | null;
  estimatedDuration: number | null;
  notes: string | null;
  dueDate?: string | null;
}) {
  const parsed = AddTaskSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const validData = parsed.data;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let sortOrder = 0;
  if (validData.folderId) {
    const { data: maxOrderData } = await supabase
      .from('tasks')
      .select('sort_order')
      .eq('user_id', user.id)
      .eq('folder_id', validData.folderId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    if (maxOrderData) {
      sortOrder = (maxOrderData.sort_order || 0) + 1;
    }
  }

  const { data: insertedTask, error } = await supabase.from('tasks').insert({
    user_id: user.id,
    title: validData.title,
    folder_id: validData.folderId,
    estimated_duration: validData.estimatedDuration,
    notes: validData.notes,
    due_date: validData.dueDate ?? null,
    sort_order: sortOrder
  }).select().single();

  if (error) return { error: error.message };

  if (validData.dueDate) {
    await syncTaskToDailyTodo(supabase, user.id, insertedTask.id, validData.title, validData.dueDate, null);
  }

  const task: Task = {
    id: insertedTask.id,
    title: insertedTask.title,
    notes: insertedTask.notes,
    dueDate: insertedTask.due_date ? new Date(insertedTask.due_date) : null,
    status: insertedTask.status,
    folderId: insertedTask.folder_id,
    estimatedDuration: insertedTask.estimated_duration,
    sortOrder: insertedTask.sort_order ?? 0,
    createdAt: new Date(insertedTask.created_at),
    completedAt: insertedTask.completed_at ? new Date(insertedTask.completed_at) : null,
  };

  revalidatePath('/tasks');
  revalidatePath('/output');
  return { success: true, task };
}

export async function toggleTask(id: string, currentStatus: string) {
  const parsedId = UUID.safeParse(id);
  if (!parsedId.success) return { error: 'Invalid ID' };
  const parsedStatus = z.enum(['pending', 'completed']).safeParse(currentStatus);
  if (!parsedStatus.success) return { error: 'Invalid status' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
  const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus, completed_at: completedAt })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/tasks');
  return { success: true };
}

export async function deleteTask(id: string) {
  const parsedId = UUID.safeParse(id);
  if (!parsedId.success) return { error: 'Invalid ID' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('tasks')
    .update({ status: 'deleted' })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/tasks');
  return { success: true };
}

const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  notes: z.string().max(5000).nullable().optional(),
  estimatedDuration: z.number().int().positive().max(8 * 3600).nullable().optional(),
  folderId: UUID.nullable().optional(),
  dueDate: DATE_STRING.nullable().optional(),
});

export async function updateTask(
  id: string,
  updates: {
    title?: string;
    notes?: string | null;
    estimatedDuration?: number | null;
    folderId?: string | null;
    dueDate?: string | null;
  }
) {
  const parsedId = UUID.safeParse(id);
  if (!parsedId.success) return { error: 'Invalid ID' };
  const parsed = UpdateTaskSchema.safeParse(updates);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const validUpdates = parsed.data;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: oldTask } = await supabase
    .from('tasks')
    .select('due_date, title')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!oldTask) return { error: 'Task not found' };

  const dbUpdates: Record<string, unknown> = {};
  if (validUpdates.title !== undefined) dbUpdates.title = validUpdates.title;
  if (validUpdates.notes !== undefined) dbUpdates.notes = validUpdates.notes;
  if (validUpdates.estimatedDuration !== undefined) dbUpdates.estimated_duration = validUpdates.estimatedDuration;
  if (validUpdates.folderId !== undefined) dbUpdates.folder_id = validUpdates.folderId;
  if (validUpdates.dueDate !== undefined) dbUpdates.due_date = validUpdates.dueDate;

  const { error } = await supabase
    .from('tasks')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  if (validUpdates.dueDate !== undefined || validUpdates.title !== undefined) {
    const effectiveDate = validUpdates.dueDate !== undefined ? validUpdates.dueDate : (oldTask?.due_date ?? null);
    const effectiveTitle = validUpdates.title ?? oldTask?.title ?? '';
    const oldDate = oldTask?.due_date ?? null;

    if (effectiveDate !== oldDate || validUpdates.title !== undefined) {
      await syncTaskToDailyTodo(
        supabase, user.id, id, effectiveTitle,
        effectiveDate, oldDate
      );
    }
  }

  revalidatePath('/tasks');
  revalidatePath('/output');
  return { success: true };
}

export async function updateTaskOrders(updates: { id: string; sortOrder: number }[]) {
  const parsed = z.array(z.object({ id: UUID, sortOrder: z.number().int().min(0) }))
    .min(1)
    .max(200)
    .safeParse(updates);
  if (!parsed.success) return { error: 'Invalid update data' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  for (const update of parsed.data) {
    await supabase
      .from('tasks')
      .update({ sort_order: update.sortOrder })
      .eq('id', update.id)
      .eq('user_id', user.id);
  }

  revalidatePath('/tasks');
  return { success: true };
}

const AddFolderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  icon: z.string().min(1).max(10),
});

export async function addFolder(name: string, icon: string) {
  const parsed = AddFolderSchema.safeParse({ name, icon });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: maxOrderData } = await supabase
    .from('task_folders')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const sortOrder = maxOrderData ? (maxOrderData.sort_order || 0) + 1 : 0;

  const { data: insertedFolder, error } = await supabase.from('task_folders').insert({
    user_id: user.id,
    name: parsed.data.name,
    icon: parsed.data.icon,
    sort_order: sortOrder,
    is_default: false
  }).select().single();

  if (error) return { error: error.message };
  revalidatePath('/tasks');

  const folder: TaskFolder = {
    id: insertedFolder.id,
    name: insertedFolder.name,
    icon: insertedFolder.icon,
    sortOrder: insertedFolder.sort_order,
    isDefault: insertedFolder.is_default,
    createdAt: new Date(insertedFolder.created_at)
  };

  return { success: true, folder };
}

export async function deleteFolder(id: string) {
  const parsedId = UUID.safeParse(id);
  if (!parsedId.success) return { error: 'Invalid ID' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: inboxFolder } = await supabase
    .from('task_folders')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', 'Inbox')
    .eq('is_default', true)
    .single();

  if (inboxFolder) {
    await supabase
      .from('tasks')
      .update({ folder_id: inboxFolder.id })
      .eq('folder_id', id)
      .eq('user_id', user.id);
  }

  const { error } = await supabase
    .from('task_folders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_default', false);

  if (error) return { error: error.message };
  revalidatePath('/tasks');
  return { success: true };
}
