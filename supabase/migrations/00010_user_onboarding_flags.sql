-- ============================================================
-- Migration 00010: User Onboarding Flags
-- ============================================================

create table public.user_onboarding_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module text not null check (module in ('cognitive_test', 'skills_assessment', 'personality_test', 'interview')),
  created_at timestamptz not null default now(),
  unique (user_id, module)
);

create index idx_onboarding_flags_user on public.user_onboarding_flags(user_id);

alter table public.user_onboarding_flags enable row level security;

create policy "Users manage own onboarding flags"
  on public.user_onboarding_flags for all
  using (auth.uid() = user_id);
