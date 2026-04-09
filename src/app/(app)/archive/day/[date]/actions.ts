'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function addDayTodo(date: string, taskText: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Ensure daily log exists
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
    task_text: taskText,
    completed: false,
    sort_order: count || 0,
    date,
  });

  if (error) return { error: error.message };
  revalidatePath(`/archive/day/${date}`);
  revalidatePath('/archive');
  return { success: true };
}

export async function toggleDayTodo(id: string, completed: boolean, date: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('daily_todos')
    .update({ completed })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath(`/archive/day/${date}`);
  revalidatePath('/archive');
  return { success: true };
}

export async function removeDayTodo(id: string, date: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('daily_todos')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath(`/archive/day/${date}`);
  revalidatePath('/archive');
  return { success: true };
}

export async function updateDayTodo(id: string, taskText: string, date: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('daily_todos')
    .update({ task_text: taskText })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath(`/archive/day/${date}`);
  revalidatePath('/archive');
  return { success: true };
}

export async function reorderDayTodos(orderedIds: string[], date: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updates = orderedIds.map((id, index) =>
    supabase
      .from('daily_todos')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('user_id', user.id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath(`/archive/day/${date}`);
  revalidatePath('/archive');
  return { success: true };
}

export async function addManualBlockForDate(data: {
  title: string;
  startTime: string;
  endTime: string;
  date: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

  const { error } = await supabase.from('work_blocks').insert({
    user_id: user.id,
    title: data.title,
    start_time: data.startTime,
    end_time: data.endTime,
    duration,
    type: 'stopwatch',
    status: 'completed',
  });

  if (error) return { error: error.message };
  revalidatePath(`/archive/day/${data.date}`);
  revalidatePath('/archive');
  return { success: true };
}

export async function updateDayThoughts(date: string, thoughts: string) {
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

  revalidatePath(`/archive/day/${date}`);
  revalidatePath('/archive');
  return { success: true };
}
