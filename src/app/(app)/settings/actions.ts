'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function updateProfile(data: {
  displayName?: string;
  theme?: 'light' | 'dark' | 'system';
  avatarUrl?: string;
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

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/settings');
  return { success: true };
}
