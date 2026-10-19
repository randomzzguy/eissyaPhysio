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
  package_price numeric(10,2) not null default 120 check (package_price >= 0),
  sessions_total integer not null default 1 check (sessions_total > 0),
  sessions_used integer not null default 0 check (sessions_used >= 0 and sessions_used <= sessions_total),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'due', 'paid')),
  next_session timestamptz,
  schedule_day_1 smallint check (schedule_day_1 between 0 and 6),
  schedule_time_1 time,
  schedule_day_2 smallint check (schedule_day_2 between 0 and 6),
  schedule_time_2 time,
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
