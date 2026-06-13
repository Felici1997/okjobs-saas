-- ============================================================
-- Okjobs - Migration 00003 : RLS feedback + cleanup policies
-- ============================================================

-- 1. Vue publique sur le feedback (score + summary seulement)
create view public.v_feedback_public
with (security_barrier = true)
as
select
  f.id,
  f.session_id,
  f.score,
  f.summary
from public.interview_feedback f
where exists (
  select 1 from public.interview_sessions s
  where s.id = f.session_id
    and s.user_id = auth.uid()
);

-- 2. Restreindre les politiques sur interview_feedback
--    Seuls les users Pro peuvent SELECT directement la table
drop policy if exists "users can view own feedback" on public.interview_feedback;

create policy "users can view own feedback (pro)"
  on public.interview_feedback for select
  using (
    exists (
      select 1 from public.interview_sessions
      where id = session_id and user_id = auth.uid()
    )
    and (
      select plan from public.profiles where id = auth.uid()
    ) = 'pro'
  );

-- 3. Policy INSERT : uniquement via service_role (admin client)
--    On garde la possibilité INSERT pour le admin client qui bypass RLS
--    et on interdit INSERT depuis le client public
drop policy if exists "users can insert own feedback" on public.interview_feedback;

create policy "users cannot insert feedback"
  on public.interview_feedback for insert
  with check (false);

-- 4. Bloquer UPDATE et DELETE sur le feedback (lecture seule après création)
create policy "users cannot update feedback"
  on public.interview_feedback for update
  using (false);

create policy "users cannot delete feedback"
  on public.interview_feedback for delete
  using (false);

-- 5. Accorder SELECT sur la vue au rôle authenticated
grant select on public.v_feedback_public to authenticated;
