'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const FeedbackSchema = z.object({
  message: z.string().trim().min(1, 'Please write something first.').max(5000),
});

export async function submitFeedback(data: { message: string }) {
  const parsed = FeedbackSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('feedback').insert({
    user_id: user.id,
    message: parsed.data.message,
  });

  if (error) return { error: error.message };
  return { success: true };
}
