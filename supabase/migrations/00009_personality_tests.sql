-- ============================================================
-- Migration 00009: Personality Tests (Big Five / OCEAN)
-- ============================================================

-- 1. Trait enum
create type personality_trait as enum (
  'ouverture', 'conscienciosite', 'extraversion', 'agreabilite', 'stabilite'
);

create type personality_test_status as enum (
  'in_progress', 'completed'
);

-- 2. Test sessions
create table public.personality_test_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status personality_test_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_personality_test_sessions_user on public.personality_test_sessions(user_id);

-- 3. Questions (seeded)
create table public.personality_test_questions (
  id uuid primary key default gen_random_uuid(),
  trait personality_trait not null,
  question_text text not null,
  is_reversed boolean not null default false,
  order_num int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. Answers
create table public.personality_test_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.personality_test_sessions(id) on delete cascade,
  question_id uuid not null references public.personality_test_questions(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  created_at timestamptz not null default now(),
  unique (session_id, question_id)
);

-- 5. Results (scores + AI synthesis)
create table public.personality_test_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.personality_test_sessions(id) on delete cascade unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  trait_scores jsonb not null,
  profile_type text,
  work_environments jsonb,
  strengths jsonb,
  development_axes jsonb,
  recommended_roles jsonb,
  team_fit text,
  generated_at timestamptz not null default now()
);

-- 6. Link to training_recommendations
alter table public.training_recommendations
  add column if not exists personality_test_id uuid references public.personality_test_sessions(id) on delete cascade;

create index if not exists idx_training_recommendations_personality
  on public.training_recommendations(personality_test_id);

-- ============================================================
-- SEED DATA: 30 questions Big Five (6 par trait, 2 inversées)
-- ============================================================

insert into public.personality_test_questions (trait, question_text, is_reversed, order_num) values
  -- Ouverture (6)
  ('ouverture', 'J''aime explorer de nouvelles idées et concepts', false, 1),
  ('ouverture', 'Je suis curieux(se) de découvrir des cultures différentes', false, 2),
  ('ouverture', 'Je préfère les routines bien établies', true, 3),
  ('ouverture', 'L''art et la créativité sont importants pour moi', false, 4),
  ('ouverture', 'Les changements me perturbent facilement', true, 5),
  ('ouverture', 'J''apprécie les conversations qui sortent de l''ordinaire', false, 6),
  -- Conscienciosité (6)
  ('conscienciosite', 'Je termine toujours mes tâches dans les délais', false, 7),
  ('conscienciosite', 'Je suis organisé(e) et méthodique dans mon travail', false, 8),
  ('conscienciosite', 'Je remets souvent au lendemain', true, 9),
  ('conscienciosite', 'Je prête attention aux détails importants', false, 10),
  ('conscienciosite', 'Mon espace de travail est souvent en désordre', true, 11),
  ('conscienciosite', 'Je planifie mes activités à l''avance', false, 12),
  -- Extraversion (6)
  ('extraversion', 'Je me sens à l''aise pour prendre la parole en public', false, 13),
  ('extraversion', 'J''aime être entouré(e) et travailler en équipe', false, 14),
  ('extraversion', 'Je préfère les activités solitaires', true, 15),
  ('extraversion', 'Je suis plutôt réservé(e) dans les groupes', true, 16),
  ('extraversion', 'Je prends facilement l''initiative dans les conversations', false, 17),
  ('extraversion', 'Les événements sociaux me dynamisent', false, 18),
  -- Agréabilité (6)
  ('agreabilite', 'Je fais confiance aux autres facilement', false, 19),
  ('agreabilite', 'J''essaie toujours de comprendre le point de vue des autres', false, 20),
  ('agreabilite', 'Je suis souvent en désaccord avec les autres', true, 21),
  ('agreabilite', 'Je suis reconnu(e) pour ma coopération et mon esprit d''équipe', false, 22),
  ('agreabilite', 'Je critique facilement le travail des autres', true, 23),
  ('agreabilite', 'Je me soucie du bien-être des personnes autour de moi', false, 24),
  -- Stabilité émotionnelle (6)
  ('stabilite', 'Je reste calme sous pression', false, 25),
  ('stabilite', 'Je m''inquiète souvent pour des choses mineures', true, 26),
  ('stabilite', 'Mes émotions sont stables et prévisibles', false, 27),
  ('stabilite', 'Je stresse facilement face à l''imprévu', true, 28),
  ('stabilite', 'Je rebondis rapidement après un échec', false, 29),
  ('stabilite', 'J''ai tendance à ruminer mes erreurs', true, 30);

-- ============================================================
-- RLS POLICIES
-- ============================================================

alter table public.personality_test_sessions enable row level security;
alter table public.personality_test_questions enable row level security;
alter table public.personality_test_answers enable row level security;
alter table public.personality_test_results enable row level security;

-- Sessions: users see their own
create policy "Users read own personality sessions"
  on public.personality_test_sessions for select
  using (auth.uid() = user_id);

create policy "Users insert own personality sessions"
  on public.personality_test_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users update own personality sessions"
  on public.personality_test_sessions for update
  using (auth.uid() = user_id);

-- Questions: anyone can read (seeded, no sensitive data)
create policy "Anyone read personality questions"
  on public.personality_test_questions for select
  using (true);

-- Answers: own session
create policy "Users manage own personality answers"
  on public.personality_test_answers for all
  using (exists (
    select 1 from public.personality_test_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  ));

-- Results: own session
create policy "Users read own personality results"
  on public.personality_test_results for select
  using (exists (
    select 1 from public.personality_test_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  ));

create policy "System insert personality results"
  on public.personality_test_results for insert
  with check (exists (
    select 1 from public.personality_test_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  ));
