-- Migrations to apply against the existing live database.
-- Run each section in the Supabase SQL Editor.

-- ============================================
-- Tighten work_blocks.focus_score from 1-10 to 1-5
-- ============================================
-- First clamp any out-of-range values so the new CHECK doesn't reject existing
-- rows (rows with focus_score > 5 get set to 5).
update public.work_blocks
  set focus_score = 5
  where focus_score > 5;

alter table public.work_blocks
  drop constraint if exists work_blocks_focus_score_check;

alter table public.work_blocks
  add constraint work_blocks_focus_score_check
  check (focus_score between 1 and 5);

-- Note: daily_logs.daily_focus_score stays as 1-10 (end-of-day rating).

-- ============================================
-- Feedback table (user-submitted ideas/bugs/notes)
-- ============================================
create table if not exists public.feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  email text,
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz default now() not null
);

alter table public.feedback enable row level security;

-- Users can insert their own feedback. user_id must match auth.uid() (or be null
-- if anonymous — we always attach user_id from the server, so this covers it).
create policy "Users can insert own feedback"
  on public.feedback for insert
  with check (auth.uid() = user_id);

-- Users can read back their own submissions (e.g. for a future "my submissions"
-- view). Feedback is otherwise private to the app owner via the service role.
create policy "Users can view own feedback"
  on public.feedback for select
  using (auth.uid() = user_id);

create index if not exists idx_feedback_user_created
  on public.feedback (user_id, created_at desc);
