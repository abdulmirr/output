-- Output App Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================
-- 1. Profiles table (extends auth.users)
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 2. Work blocks table
-- ============================================
create table if not exists public.work_blocks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  duration integer not null, -- seconds
  type text not null check (type in ('stopwatch', 'timer')),
  planned_duration integer, -- seconds
  focus_score integer check (focus_score between 1 and 10),
  thoughts text,
  status text not null default 'completed' check (status in ('idle', 'active', 'completed', 'discarded')),
  created_at timestamptz default now() not null
);

alter table public.work_blocks enable row level security;

create policy "Users can view own work blocks"
  on public.work_blocks for select
  using (auth.uid() = user_id);

create policy "Users can insert own work blocks"
  on public.work_blocks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own work blocks"
  on public.work_blocks for update
  using (auth.uid() = user_id);

create policy "Users can delete own work blocks"
  on public.work_blocks for delete
  using (auth.uid() = user_id);

create index if not exists idx_work_blocks_user_date
  on public.work_blocks (user_id, start_time);

alter table public.work_blocks
  add column if not exists quality text check (quality in ('deep', 'meh', 'distracted'));

-- ============================================
-- 3. Tasks table
-- ============================================
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  notes text,
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'completed', 'deleted')),
  category text not null default 'inbox' check (category in ('inbox', 'today', 'this_week')),
  sort_order integer default 0,
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

alter table public.tasks enable row level security;

create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

create index if not exists idx_tasks_user_status
  on public.tasks (user_id, status);

-- ============================================
-- 4. Daily logs table
-- ============================================
create table if not exists public.daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  daily_thoughts text default '',
  daily_focus_score integer check (daily_focus_score between 1 and 10),
  daily_reflection text,
  logged_off boolean default false,
  created_at timestamptz default now() not null,
  unique (user_id, date)
);

alter table public.daily_logs enable row level security;

create policy "Users can view own daily logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily logs"
  on public.daily_logs for update
  using (auth.uid() = user_id);

create index if not exists idx_daily_logs_user_date
  on public.daily_logs (user_id, date);

-- ============================================
-- 5. Daily todos table
-- ============================================
create table if not exists public.daily_todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  daily_log_id uuid references public.daily_logs on delete cascade,
  task_text text not null,
  completed boolean default false,
  sort_order integer default 0,
  date date not null,
  created_at timestamptz default now() not null
);

alter table public.daily_todos enable row level security;

create policy "Users can view own daily todos"
  on public.daily_todos for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily todos"
  on public.daily_todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily todos"
  on public.daily_todos for update
  using (auth.uid() = user_id);

create policy "Users can delete own daily todos"
  on public.daily_todos for delete
  using (auth.uid() = user_id);

create index if not exists idx_daily_todos_user_date
  on public.daily_todos (user_id, date);

-- ============================================
-- 6. Waitlist table
-- ============================================
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamptz default now() not null
);

alter table public.waitlist enable row level security;

create policy "Anyone can insert into waitlist"
  on public.waitlist for insert
  with check (true);

create index if not exists idx_waitlist_email on public.waitlist (email);

-- ============================================
-- 7. Onboarding fields on profiles
-- ============================================
alter table public.profiles
  add column if not exists role text
    check (role in ('founder', 'developer', 'designer', 'student', 'creator', 'other')),
  add column if not exists daily_goal_hours integer default 4
    check (daily_goal_hours between 1 and 8),
  add column if not exists onboarding_completed boolean default false not null,
  add column if not exists has_completed_first_block boolean default false not null,
  add column if not exists onboarding_checklist_dismissed boolean default false not null;
