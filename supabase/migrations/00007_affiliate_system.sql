-- ============================================================
-- Migration 00007: Affiliate / Training Center Partnership System
-- ============================================================

-- 1. Add admin flag to profiles
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 2. Training centers
create table public.training_centers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  email text,
  commission_pct int not null default 10,
  registration_fee_paid boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Training programs offered by each center
create table public.training_programs (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.training_centers(id) on delete cascade,
  title text not null,
  category text not null,
  price int not null,
  duration text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_training_programs_center on public.training_programs(center_id);
create index idx_training_programs_category on public.training_programs(category);

-- 4. Training recommendations generated after interviews
create table public.training_recommendations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.training_programs(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

create index idx_training_recommendations_session on public.training_recommendations(session_id);
create index idx_training_recommendations_user on public.training_recommendations(user_id);

-- 5. Affiliate codes — the core tracking mechanism
create type affiliate_status as enum (
  'generated', 'sent', 'presented', 'converted', 'confirmed', 'invoiced',
  'expired', 'disputed'
);

create table public.affiliate_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.training_programs(id) on delete cascade,
  center_id uuid not null references public.training_centers(id) on delete cascade,
  status affiliate_status not null default 'generated',
  commission_amount int,
  sent_at timestamptz,
  presented_at timestamptz,
  converted_at timestamptz,
  confirmed_at timestamptz,
  expires_at timestamptz not null default now() + interval '90 days',
  user_confirmation text, -- 'yes' or 'no'
  disputed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint unique_affiliate_code unique (code)
);

create index idx_affiliate_codes_user on public.affiliate_codes(user_id);
create index idx_affiliate_codes_center on public.affiliate_codes(center_id);
create index idx_affiliate_codes_status on public.affiliate_codes(status);
create index idx_affiliate_codes_expires on public.affiliate_codes(expires_at);

-- 6. Function to generate unique affiliate code
create or replace function public.generate_affiliate_code()
returns text
language plpgsql
as $$
declare
  year_part text;
  random_part text;
  new_code text;
  done bool;
begin
  year_part := extract(year from now())::text;
  done := false;
  loop
    random_part := upper(substr(md5(random()::text), 1, 4));
    new_code := 'OKJ-' || year_part || '-' || random_part;
    if not exists (select 1 from public.affiliate_codes where code = new_code) then
      return new_code;
    end if;
  end loop;
end;
$$;

-- 7. Trigger: auto-calculate commission when converted
create or replace function public.calc_commission_on_convert()
returns trigger
language plpgsql
as $$
declare
  prog_price int;
  cent_commission int;
begin
  if NEW.status = 'converted' and OLD.status != 'converted' then
    select tp.price, tc.commission_pct into prog_price, cent_commission
    from public.training_programs tp
    join public.training_centers tc on tc.id = tp.center_id
    where tp.id = NEW.program_id;

    NEW.commission_amount := (prog_price * cent_commission) / 100;
    NEW.converted_at := now();
  end if;
  return NEW;
end;
$$;

create trigger trg_affiliate_codes_before_update
  before update on public.affiliate_codes
  for each row
  when (OLD.status is distinct from NEW.status)
  execute function public.calc_commission_on_convert();

-- 8. WhatsApp audit logs
create table public.whatsapp_logs (
  id uuid primary key default gen_random_uuid(),
  affiliate_code_id uuid references public.affiliate_codes(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  direction text not null, -- 'outbound' or 'inbound'
  message_type text not null, -- 'code_sent', 'relance', 'user_response'
  content text,
  twilio_sid text,
  status text,
  created_at timestamptz not null default now()
);

create index idx_whatsapp_logs_affiliate on public.whatsapp_logs(affiliate_code_id);

-- 9. Invoicing
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.training_centers(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  total_amount int not null,
  status text not null default 'pending', -- 'pending', 'paid', 'disputed'
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_invoices_center on public.invoices(center_id);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  affiliate_code_id uuid not null references public.affiliate_codes(id) on delete cascade,
  amount int not null,
  created_at timestamptz not null default now()
);

create index idx_invoice_items_invoice on public.invoice_items(invoice_id);

-- ============================================================
-- RLS Policies
-- ============================================================

alter table public.training_centers enable row level security;
alter table public.training_programs enable row level security;
alter table public.training_recommendations enable row level security;
alter table public.affiliate_codes enable row level security;
alter table public.whatsapp_logs enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

-- Centres: public read for active, admin-only write
create policy "centres_lecture_publique"
  on public.training_centers for select
  using (is_active = true);

-- Programmes: public read for active
create policy "programmes_lecture_publique"
  on public.training_programs for select
  using (is_active = true);

-- Recommendations: user reads own
create policy "recommendations_lecture_own"
  on public.training_recommendations for select
  using (auth.uid() = user_id);

create policy "recommendations_insert_own"
  on public.training_recommendations for insert
  with check (auth.uid() = user_id);

-- Codes: user reads own, admin reads all
create policy "codes_lecture_own"
  on public.affiliate_codes for select
  using (auth.uid() = user_id);

-- WhatsApp logs: user reads own
create policy "whatsapp_logs_lecture_own"
  on public.whatsapp_logs for select
  using (auth.uid() = user_id);

-- ============================================================
-- Seed data: training centers and programs (Option B)
-- ============================================================

insert into public.training_centers (id, name, address, phone, email, commission_pct, is_active) values
  ('a0000001-0000-0000-0000-000000000001', 'ISIG International', 'Centre-ville, Brazzaville', '+242055501001', 'contact@isig.cg', 10, true),
  ('a0000001-0000-0000-0000-000000000002', 'Centre Bureautique Congo', 'Avenue de la Liberté, Kinshasa', '+243099902002', 'info@bureautiquecongo.cd', 10, true),
  ('a0000001-0000-0000-0000-000000000003', 'Formation Plus', 'Quartier Latin, Pointe-Noire', '+242055503003', 'contact@formationplus.cg', 10, true),
  ('a0000001-0000-0000-0000-000000000004', 'Excel Academy Congo', 'Gombe, Kinshasa', '+243099904004', 'info@excelacademy.cd', 10, true),
  ('a0000001-0000-0000-0000-000000000005', 'Centre OHADA Pro', 'Moungali, Brazzaville', '+242055505005', 'contact@ohadapro.cg', 10, true)
on conflict (id) do nothing;

insert into public.training_programs (center_id, title, category, price, duration) values
  -- ISIG
  ('a0000001-0000-0000-0000-000000000001', 'Initiation à l''informatique', 'bureautique', 50000, '2 mois'),
  ('a0000001-0000-0000-0000-000000000001', 'Excel avancé', 'bureautique', 75000, '1.5 mois'),
  ('a0000001-0000-0000-0000-000000000001', 'Comptabilité OHADA', 'comptabilite', 150000, '3 mois'),
  ('a0000001-0000-0000-0000-000000000001', 'Développement Web Full Stack', 'dev', 250000, '6 mois'),
  ('a0000001-0000-0000-0000-000000000001', 'Anglais professionnel', 'langues', 80000, '3 mois'),
  -- Centre Bureautique Congo
  ('a0000001-0000-0000-0000-000000000002', 'Pack Office complet', 'bureautique', 60000, '2 mois'),
  ('a0000001-0000-0000-0000-000000000002', 'Gestion de projet', 'bureautique', 100000, '2 mois'),
  ('a0000001-0000-0000-0000-000000000002', 'Français professionnel', 'langues', 50000, '2 mois'),
  -- Formation Plus
  ('a0000001-0000-0000-0000-000000000003', 'Marketing digital', 'dev', 120000, '3 mois'),
  ('a0000001-0000-0000-0000-000000000003', 'Logiciel Sage 100 Comptabilité', 'comptabilite', 200000, '3 mois'),
  ('a0000001-0000-0000-0000-000000000003', 'Anglais intensif', 'langues', 100000, '4 mois'),
  -- Excel Academy
  ('a0000001-0000-0000-0000-000000000004', 'Excel de base', 'bureautique', 30000, '1 mois'),
  ('a0000001-0000-0000-0000-000000000004', 'Power BI', 'bureautique', 150000, '2 mois'),
  -- OHADA Pro
  ('a0000001-0000-0000-0000-000000000005', 'Comptabilité générale OHADA', 'comptabilite', 180000, '3 mois'),
  ('a0000001-0000-0000-0000-000000000005', 'Fiscalité congolaise', 'comptabilite', 120000, '2 mois'),
  ('a0000001-0000-0000-0000-000000000005', 'Logiciel Sage', 'comptabilite', 150000, '2 mois')
on conflict do nothing;
