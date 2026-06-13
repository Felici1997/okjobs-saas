-- ============================================================
-- Okjobs - Schema initial
-- ============================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- 1. Profiles (lié à auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 2. CV documents
create table public.cv_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Mon CV',
  is_active boolean not null default false,
  personal_details jsonb not null default '{}'::jsonb,
  experiences jsonb not null default '[]'::jsonb,
  educations jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  languages jsonb not null default '[]'::jsonb,
  hobbies jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Interview sessions
create type public.interview_type as enum ('technique', 'comportemental', 'motivationnel');
create type public.difficulty_level as enum ('debutant', 'intermediaire', 'avance');
create type public.session_status as enum ('in_progress', 'completed', 'abandoned', 'timeout');

create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  cv_id uuid references public.cv_documents(id) on delete set null,
  job_title text not null,
  sector text not null default '',
  interview_type public.interview_type not null,
  difficulty public.difficulty_level not null default 'intermediaire',
  nb_questions int not null default 5,
  timer_minutes int not null default 0,
  status public.session_status not null default 'in_progress',
  score int,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

-- 4. Interview messages
create table public.interview_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- 5. Interview feedback
create table public.interview_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade unique,
  summary text not null default '',
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  score int not null default 0
);

-- 6. API keys
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  key_hash text not null,
  key_prefix text not null,
  name text not null default 'Ma clé',
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  revoked boolean not null default false
);

-- 7. API usage logs
create table public.api_usage_logs (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid not null references public.api_keys(id) on delete cascade,
  endpoint text not null,
  method text not null,
  status int not null,
  ip text not null default '',
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.cv_documents enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_messages enable row level security;
alter table public.interview_feedback enable row level security;
alter table public.api_keys enable row level security;
alter table public.api_usage_logs enable row level security;

-- Profiles : chacun voit/modifie son propre profil
create policy "users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- CV documents
create policy "users can view own cv"
  on public.cv_documents for select
  using (auth.uid() = user_id);

create policy "users can insert own cv"
  on public.cv_documents for insert
  with check (auth.uid() = user_id);

create policy "users can update own cv"
  on public.cv_documents for update
  using (auth.uid() = user_id);

create policy "users can delete own cv"
  on public.cv_documents for delete
  using (auth.uid() = user_id);

-- Interview sessions
create policy "users can view own sessions"
  on public.interview_sessions for select
  using (auth.uid() = user_id);

create policy "users can insert own sessions"
  on public.interview_sessions for insert
  with check (auth.uid() = user_id);

create policy "users can update own sessions"
  on public.interview_sessions for update
  using (auth.uid() = user_id);

-- Messages
create policy "users can view own messages"
  on public.interview_messages for select
  using (
    exists (
      select 1 from public.interview_sessions
      where id = session_id and user_id = auth.uid()
    )
  );

create policy "users can insert own messages"
  on public.interview_messages for insert
  with check (
    exists (
      select 1 from public.interview_sessions
      where id = session_id and user_id = auth.uid()
    )
  );

-- Feedback
create policy "users can view own feedback"
  on public.interview_feedback for select
  using (
    exists (
      select 1 from public.interview_sessions
      where id = session_id and user_id = auth.uid()
    )
  );

create policy "users can insert own feedback"
  on public.interview_feedback for insert
  with check (
    exists (
      select 1 from public.interview_sessions
      where id = session_id and user_id = auth.uid()
    )
  );

-- API keys
create policy "users can view own api keys"
  on public.api_keys for select
  using (auth.uid() = user_id);

create policy "users can insert own api keys"
  on public.api_keys for insert
  with check (auth.uid() = user_id);

create policy "users can update own api keys"
  on public.api_keys for update
  using (auth.uid() = user_id);

create policy "users can delete own api keys"
  on public.api_keys for delete
  using (auth.uid() = user_id);

-- API usage logs (lecture seulement)
create policy "users can view own api logs"
  on public.api_usage_logs for select
  using (
    exists (
      select 1 from public.api_keys
      where id = api_key_id and user_id = auth.uid()
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_cv_documents_user_id on public.cv_documents(user_id);
create index idx_interview_sessions_user_id on public.interview_sessions(user_id);
create index idx_interview_messages_session_id on public.interview_messages(session_id);
create index idx_api_keys_user_id on public.api_keys(user_id);
create index idx_api_usage_logs_api_key_id on public.api_usage_logs(api_key_id);
create index idx_api_keys_key_hash on public.api_keys(key_hash);

-- ============================================================
-- AUTO-PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
