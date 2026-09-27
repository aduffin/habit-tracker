-- HABITS: one row per habit
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  description text,
  weekly_goal int not null check (weekly_goal between 1 and 7),
  color text not null,
  created_at timestamptz default now()
);

-- COMPLETIONS: one row per habit checked off on a given day
create table completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  completed_on date not null,
  unique (habit_id, completed_on)
);

-- SECURITY: turn on row level security
alter table habits enable row level security;
alter table completions enable row level security;

-- Each user can only see and change their own rows
create policy "Users manage their own habits"
  on habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own completions"
  on completions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);