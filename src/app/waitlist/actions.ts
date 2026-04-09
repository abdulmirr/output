'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

export async function joinWaitlist(prevState: { success: boolean; message: string } | null, formData: FormData) {
  const parsed = z.email('Please enter a valid email address').safeParse(formData.get('email'));
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('waitlist')
    .insert([{ email: parsed.data }]);

  if (error) {
    if (error.code === '23505') {
      return { success: true, message: "You're already on the waitlist!" };
    }
    return { success: false, message: 'Something went wrong. Please try again.' };
  }

  return { success: true, message: "You're on the list! We'll be in touch." };
}
