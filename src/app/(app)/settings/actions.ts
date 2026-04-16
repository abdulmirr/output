'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  avatarUrl: z.string().url().optional(),
  role: z
    .enum(['founder', 'developer', 'designer', 'student', 'creator', 'other'])
    .optional(),
  dailyGoalHours: z.number().int().min(1).max(8).optional(),
  timezone: z.string().min(1).max(64).optional(),
});

export async function updateProfile(data: {
  displayName?: string;
  theme?: 'light' | 'dark' | 'system';
  avatarUrl?: string;
  role?: 'founder' | 'developer' | 'designer' | 'student' | 'creator' | 'other';
  dailyGoalHours?: number;
  timezone?: string;
}) {
  const parsed = UpdateProfileSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const validData = parsed.data;
  const updates: Record<string, unknown> = {};
  if (validData.displayName !== undefined) updates.display_name = validData.displayName;
  if (validData.theme !== undefined) updates.theme = validData.theme;
  if (validData.avatarUrl !== undefined) updates.avatar_url = validData.avatarUrl;
  if (validData.role !== undefined) updates.role = validData.role;
  if (validData.dailyGoalHours !== undefined) updates.daily_goal_hours = validData.dailyGoalHours;
  if (validData.timezone !== undefined) updates.timezone = validData.timezone;

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/settings');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.rpc('delete_current_user');
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  redirect('/login');
}
