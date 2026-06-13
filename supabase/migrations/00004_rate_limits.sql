-- ============================================================
-- Okjobs - Migration 00004 : Rate limits persistants
-- ============================================================

-- 1. Table des compteurs par fenêtre glissante
create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 1,
  created_at timestamptz not null default now(),
  primary key (key, window_start)
);

create index idx_rate_limits_key on public.rate_limits(key);
create index idx_rate_limits_cleanup on public.rate_limits(window_start);

-- 2. Fonction atomique de check + incrément
--    Retourne { allowed: bool, remaining: int }
create or replace function public.check_rate_limit(
  p_key text,
  p_max_requests int default 60,
  p_window_ms int default 60000
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_window_start timestamptz;
  v_count int;
  v_now timestamptz := now();
begin
  -- Arrondir à la seconde pour fenêtre stable
  v_window_start := date_trunc('second', v_now);

  -- Nettoyer les entrées expirées
  delete from public.rate_limits
  where key = p_key
    and window_start < v_now - (p_window_ms * interval '1 ms');

  -- UPSERT atomique : insère ou incrémente
  insert into public.rate_limits (key, window_start, count)
  values (p_key, v_window_start, 1)
  on conflict (key, window_start)
  do update set count = public.rate_limits.count + 1
  returning count into v_count;

  if v_count > p_max_requests then
    return jsonb_build_object('allowed', false, 'remaining', 0);
  else
    return jsonb_build_object('allowed', true, 'remaining', p_max_requests - v_count);
  end if;
end;
$$;

-- 3. RLS : accessible uniquement via service_role (admin client)
alter table public.rate_limits enable row level security;

create policy "rate_limits admin only"
  on public.rate_limits for all
  using (false)
  with check (false);
