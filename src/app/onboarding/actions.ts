'use server';

import { updateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { TAG } from '@/lib/api/queries';
import { z } from 'zod';

const RoleSchema = z.enum(['founder', 'developer', 'designer', 'student', 'creator', 'other']);
const GoalSchema = z.number().int().min(1).max(8);
const WorkWindowSchema = z.enum(['mornings', 'afternoons', 'evenings', 'split', 'flexible']);
const TourStageSchema = z.enum(['output', 'tasks', 'done']);
const TourProgressSchema = z.object({
  stage: TourStageSchema,
  step: z.number().int().min(0).max(20),
  skipped: z.boolean(),
});
const ProfileDetailsSchema = z.object({
  preferredName: z.string().trim().max(40).nullable().optional(),
  focusArea: z.string().trim().max(80).nullable().optional(),
  workWindow: WorkWindowSchema.nullable().optional(),
});

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

export async function completeOnboarding(options?: { startTour?: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const tourProgress = options?.startTour
    ? { stage: 'output', step: 0, skipped: false }
    : { stage: 'done', step: 0, skipped: true };

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true, tour_progress: tourProgress })
    .eq('id', user.id);

  if (error) return { error: 'Could not complete onboarding' };

  const cookieStore = await cookies();
  cookieStore.set('output-onboarding-done', '1', {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });

  updateTag(TAG.profile);
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

export async function saveProfileDetails(details: {
  preferredName?: string | null;
  focusArea?: string | null;
  workWindow?: 'mornings' | 'afternoons' | 'evenings' | 'split' | 'flexible' | null;
}) {
  const parsed = ProfileDetailsSchema.safeParse(details);
  if (!parsed.success) return { error: 'Invalid profile details' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const payload: Record<string, unknown> = {};
  if (parsed.data.preferredName !== undefined) {
    payload.preferred_name = parsed.data.preferredName || null;
  }
  if (parsed.data.focusArea !== undefined) {
    payload.focus_area = parsed.data.focusArea || null;
  }
  if (parsed.data.workWindow !== undefined) {
    payload.work_window = parsed.data.workWindow;
  }
  if (Object.keys(payload).length === 0) return { success: true };

  const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
  if (error) return { error: 'Could not save details' };
  return { success: true };
}

export async function updateTourProgress(progress: {
  stage: 'output' | 'tasks' | 'done';
  step: number;
  skipped: boolean;
}) {
  const parsed = TourProgressSchema.safeParse(progress);
  if (!parsed.success) return { error: 'Invalid progress' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('profiles')
    .update({ tour_progress: parsed.data })
    .eq('id', user.id);

  if (error) return { error: 'Could not update tour progress' };
  return { success: true };
}

export async function resetTour() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.rpc('reset_tour_progress');

  if (error) return { error: 'Could not reset tour' };
  updateTag(TAG.profile);
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
  updateTag(TAG.profile);
  return { success: true };
}
