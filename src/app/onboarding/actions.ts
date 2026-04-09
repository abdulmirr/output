'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const RoleSchema = z.enum(['founder', 'developer', 'designer', 'student', 'creator', 'other']);
const GoalSchema = z.number().int().min(1).max(8);

export async function saveRole(role: string) {
  const parsed = RoleSchema.safeParse(role);
  if (!parsed.success) return { error: 'Invalid role' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('profiles')
    .update({ role: parsed.data })
    .eq('id', user.id);

  if (error) return { error: 'Could not save role' };
  return { success: true };
}

export async function saveDailyGoal(hours: number) {
  const parsed = GoalSchema.safeParse(hours);
  if (!parsed.success) return { error: 'Invalid goal' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('profiles')
    .update({ daily_goal_hours: parsed.data })
    .eq('id', user.id);

  if (error) return { error: 'Could not save goal' };
  return { success: true };
}

export async function completeOnboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id);

  if (error) return { error: 'Could not complete onboarding' };

  const cookieStore = await cookies();
  cookieStore.set('output-onboarding-done', '1', {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function restoreOnboardingCookie() {
  const cookieStore = await cookies();
  cookieStore.set('output-onboarding-done', '1', {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });
}

export async function dismissChecklist() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_checklist_dismissed: true })
    .eq('id', user.id);

  if (error) return { error: 'Could not dismiss checklist' };
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function markFirstBlockCompleted() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('profiles')
    .update({ has_completed_first_block: true })
    .eq('id', user.id);

  if (error) return { error: 'Could not update profile' };
  revalidatePath('/', 'layout');
  return { success: true };
}
