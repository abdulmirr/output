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
