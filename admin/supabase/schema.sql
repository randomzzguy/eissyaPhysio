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
  sessions_total integer not null default 1 check (sessions_total > 0),
  sessions_used integer not null default 0 check (sessions_used >= 0 and sessions_used <= sessions_total),
  next_session timestamptz,
  schedule text,
  payment_due_date date,
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
create index if not exists clients_payment_due_date_idx on public.clients(payment_due_date);
