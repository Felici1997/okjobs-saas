-- ============================================================
-- Okjobs - Migration 00005 : Timeout automatique des sessions
-- ============================================================

-- Passe en timeout les sessions in_progress depuis plus de
-- timer_minutes + 15 min (appelé par cron externe)
create or replace function public.timeout_stale_sessions()
returns int  -- nombre de sessions impactées
language plpgsql
security definer
as $$
declare
  v_count int;
begin
  with updated as (
    update public.interview_sessions
    set status = 'timeout',
        ended_at = now()
    where status = 'in_progress'
      and started_at < now() - ((timer_minutes + 15) * interval '1 minute')
    returning id
  )
  select count(*) into v_count from updated;

  return v_count;
end;
$$;

grant execute on function public.timeout_stale_sessions() to authenticated;
