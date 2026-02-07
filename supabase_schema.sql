-- ============================================================
-- Byte's Bank — Supabase Schema
-- Run this in the Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. TABLES
-- ────────────────────────────────────────────────────────────

-- Public profiles linked 1-to-1 with auth.users
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  updated_at  timestamptz default now()
);

comment on table public.profiles is 'User profile data, one row per auth.users entry.';

-- Bank statements uploaded by each user
create table if not exists public.bank_statements (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  bank_name         text,
  account_last_four char(4) check (account_last_four ~ '^\d{4}$'),
  statement_date    date not null default current_date,
  transaction_data  jsonb not null default '[]'::jsonb,
  total_balance     numeric(14,2),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

comment on table public.bank_statements is 'Parsed bank statement data per user.';

-- ────────────────────────────────────────────────────────────
-- 2. INDEXES
-- ────────────────────────────────────────────────────────────

create index if not exists idx_bank_statements_user_id
  on public.bank_statements(user_id);

create index if not exists idx_bank_statements_statement_date
  on public.bank_statements(statement_date);

-- Composite index for the most common query pattern (user + date range)
create index if not exists idx_bank_statements_user_date
  on public.bank_statements(user_id, statement_date desc);

-- ────────────────────────────────────────────────────────────
-- 3. AUTOMATION — updated_at trigger
-- ────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger trg_bank_statements_updated_at
  before update on public.bank_statements
  for each row
  execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- 4. AUTOMATION — auto-create profile on signup
-- ────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public          -- avoid search_path injection
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

-- Trigger fires after every INSERT on auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

-- Enable RLS on both tables
alter table public.profiles         enable row level security;
alter table public.bank_statements  enable row level security;

-- ── profiles policies ──────────────────────────────────────

create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- ── bank_statements policies ───────────────────────────────

create policy "Users can insert their own statements"
  on public.bank_statements
  for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own statements"
  on public.bank_statements
  for select
  using (auth.uid() = user_id);

create policy "Users can delete their own statements"
  on public.bank_statements
  for delete
  using (auth.uid() = user_id);

-- No update policy — statements are immutable once uploaded.
-- Add one here if you later allow edits:
--
-- create policy "Users can update their own statements"
--   on public.bank_statements
--   for update
--   using  (auth.uid() = user_id)
--   with check (auth.uid() = user_id);
