-- Run this once on an existing Eissya Physio database to add appointment records and SOAP notes.

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
