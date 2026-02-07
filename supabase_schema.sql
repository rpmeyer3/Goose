-- ============================================================
-- Byte's Bank — Supabase Schema
-- Run this in the Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. CUSTOM TYPES
-- ────────────────────────────────────────────────────────────

-- Preferred currency for display
create type public.currency_code as enum ('USD', 'EUR', 'GBP', 'GAL');

-- Wizard rank unlocked by usage milestones
create type public.wizard_rank as enum (
  'Muggle',            -- new user, 0 analyses
  'First-Year',        -- 1 analysis
  'Prefect',           -- 5 analyses
  'Head Boy/Girl',     -- 15 analyses
  'Auror',             -- 30 analyses
  'Order of Merlin'    -- 50+ analyses
);

-- ────────────────────────────────────────────────────────────
-- 2. TABLES
-- ────────────────────────────────────────────────────────────

-- Public profiles linked 1-to-1 with auth.users
create table if not exists public.profiles (
  -- ── identity ──
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique,                     -- denormalised from auth for fast lookups
  full_name       text,
  first_name      text,
  last_name       text,
  avatar_url      text,
  phone           text,

  -- ── financial preferences ──
  preferred_currency  public.currency_code default 'USD',
  monthly_budget_goal numeric(14,2),               -- target spending limit per month
  savings_goal        numeric(14,2),               -- target savings per month
  default_bank        text,                        -- e.g. "Gringotts", auto-filled on upload

  -- ── notification & display settings ──
  notify_overspend    boolean default true,         -- alert when spending exceeds budget
  notify_weekly_recap boolean default true,         -- weekly owl-post summary
  notify_ai_tips      boolean default true,         -- Gringotts advisor tips
  dark_mode           boolean default true,         -- UI theme (default: dark wizarding)

  -- ── gamification & engagement ──
  wizard_rank         public.wizard_rank default 'Muggle',
  total_analyses      int default 0,               -- lifetime count of statement analyses
  streak_days         int default 0,               -- consecutive days with an upload
  last_analysis_at    timestamptz,                 -- most recent analysis timestamp
  favorite_categories text[] default '{}',         -- pinned spending categories

  -- ── onboarding ──
  onboarding_completed boolean default false,
  accepted_terms_at    timestamptz,

  -- ── metadata ──
  created_at  timestamptz default now(),
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
  total_income      numeric(14,2),
  total_spent       numeric(14,2),
  category_spending jsonb default '{}'::jsonb,      -- {category: amount} snapshot
  advisor_summary   text,                           -- cached Gringotts AI summary
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

comment on table public.bank_statements is 'Parsed bank statement data per user.';

-- ────────────────────────────────────────────────────────────
-- 3. INDEXES
-- ────────────────────────────────────────────────────────────

create index if not exists idx_profiles_email
  on public.profiles(email);

create index if not exists idx_bank_statements_user_id
  on public.bank_statements(user_id);

create index if not exists idx_bank_statements_statement_date
  on public.bank_statements(statement_date);

-- Composite index for the most common query pattern (user + date range)
create index if not exists idx_bank_statements_user_date
  on public.bank_statements(user_id, statement_date desc);

-- ────────────────────────────────────────────────────────────
-- 4. AUTOMATION — updated_at trigger
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
-- 5. AUTOMATION — auto-create profile on signup
-- ────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public          -- avoid search_path injection
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    avatar_url
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name',  ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name',  ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url',  '')
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
-- 6. AUTOMATION — bump wizard rank after each analysis
-- ────────────────────────────────────────────────────────────

create or replace function public.update_profile_on_analysis()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_total int;
  new_rank  public.wizard_rank;
begin
  -- Increment analysis count, compute rank, apply in a single UPDATE
  select total_analyses + 1 into new_total
    from public.profiles where id = new.user_id;

  new_rank := case
    when new_total >= 50 then 'Order of Merlin'
    when new_total >= 30 then 'Auror'
    when new_total >= 15 then 'Head Boy/Girl'
    when new_total >=  5 then 'Prefect'
    when new_total >=  1 then 'First-Year'
    else 'Muggle'
  end;

  update public.profiles
    set total_analyses   = new_total,
        last_analysis_at = now(),
        wizard_rank      = new_rank
    where id = new.user_id;

  return new;
end;
$$;

create trigger trg_bank_statements_rank_up
  after insert on public.bank_statements
  for each row
  execute function public.update_profile_on_analysis();

-- ────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY
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
