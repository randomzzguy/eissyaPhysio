-- Eissya Physio admin portal schema
-- Run this once in Supabase Dashboard > SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  location text,
  condition text,
  package_name text not null check (package_name in ('Single Session', 'Trial Pack', 'Progress Pack')),
  package_price numeric(10,2) not null default 140 check (package_price >= 0),
  sessions_total integer not null default 1 check (sessions_total > 0),
  sessions_used integer not null default 0 check (sessions_used >= 0 and sessions_used <= sessions_total),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'due', 'paid')),
  next_session timestamptz,
  schedule_day_1 smallint check (schedule_day_1 between 0 and 6),
  schedule_time_1 time,
  schedule_day_2 smallint check (schedule_day_2 between 0 and 6),
  session_duration_minutes integer not null default 60 check (session_duration_minutes in (60, 90, 120)),
  schedule text,
  cancelled_sessions integer not null default 0 check (cancelled_sessions >= 0),
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;

drop policy if exists "Users can view their own clients" on public.clients;
create policy "Users can view their own clients"
on public.clients for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Users can add their own clients" on public.clients;
create policy "Users can add their own clients"
on public.clients for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "Users can update their own clients" on public.clients;
create policy "Users can update their own clients"
on public.clients for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "Users can delete their own clients" on public.clients;
create policy "Users can delete their own clients"
on public.clients for delete
to authenticated
using ((select auth.uid()) = owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

create index if not exists clients_owner_id_idx on public.clients(owner_id);
create index if not exists clients_next_session_idx on public.clients(next_session);
create index if not exists clients_payment_status_idx on public.clients(payment_status);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  scheduled_start timestamptz not null,
  original_scheduled_start timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes in (60, 90, 120)),
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  cc_diagnosis text,
  pain_level smallint check (pain_level between 0 and 10),
  patient_goals text,
  functional_limitations text,
  posture_gait text,
  rom text,
  strength_grade smallint check (strength_grade between 0 and 5),
  balance_coordination text,
  functional_activities text,
  special_tests text,
  assistive_devices text,
  clinical_impression text,
  progress text,
  barriers_progress text,
  response_treatment text,
  treatment_focus text,
  interventions text,
  modalities text,
  frequency text,
  hep text,
  referrals_follow_up text,
  next_session_goals text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, original_scheduled_start)
);

alter table public.appointments enable row level security;

drop policy if exists "Users can view their own appointments" on public.appointments;
create policy "Users can view their own appointments" on public.appointments for select to authenticated using ((select auth.uid()) = owner_id);
drop policy if exists "Users can add their own appointments" on public.appointments;
create policy "Users can add their own appointments" on public.appointments for insert to authenticated with check ((select auth.uid()) = owner_id);
drop policy if exists "Users can update their own appointments" on public.appointments;
create policy "Users can update their own appointments" on public.appointments for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "Users can delete their own appointments" on public.appointments;
create policy "Users can delete their own appointments" on public.appointments for delete to authenticated using ((select auth.uid()) = owner_id);

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at before update on public.appointments for each row execute function public.set_updated_at();

create index if not exists appointments_owner_id_idx on public.appointments(owner_id);
create index if not exists appointments_client_id_idx on public.appointments(client_id);
create index if not exists appointments_scheduled_start_idx on public.appointments(scheduled_start);
