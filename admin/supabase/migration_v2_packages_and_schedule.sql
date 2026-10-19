-- Run this once if you already created the clients table with schema.sql.
-- It keeps existing client records and adds package-payment and fixed-schedule fields.

alter table public.clients
  add column if not exists package_price numeric(10,2),
  add column if not exists payment_status text,
  add column if not exists schedule_day_1 smallint,
  add column if not exists schedule_time_1 time,
  add column if not exists schedule_day_2 smallint,
  add column if not exists session_duration_minutes integer,
  add column if not exists cancelled_sessions integer;

-- The Progress Pack is now eight sessions at the existing RM100/session rate.
update public.clients
set sessions_total = 8
where package_name = 'Progress Pack' and sessions_total = 6;

update public.clients
set package_price = case package_name
  when 'Single Session' then 120
  when 'Trial Pack' then 330
  when 'Progress Pack' then 800
  else 0
end
where package_price is null;

update public.clients
set payment_status = case
  when sessions_used >= sessions_total then 'due'
  else 'pending'
end
where payment_status is null;

update public.clients set session_duration_minutes = 60 where session_duration_minutes is null;
update public.clients set cancelled_sessions = 0 where cancelled_sessions is null;

alter table public.clients
  alter column package_price set default 120,
  alter column package_price set not null,
  alter column payment_status set default 'pending',
  alter column payment_status set not null,
  alter column session_duration_minutes set default 60,
  alter column session_duration_minutes set not null,
  alter column cancelled_sessions set default 0,
  alter column cancelled_sessions set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'clients_package_price_check') then
    alter table public.clients add constraint clients_package_price_check check (package_price >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'clients_payment_status_check') then
    alter table public.clients add constraint clients_payment_status_check check (payment_status in ('pending', 'due', 'paid'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'clients_schedule_day_1_check') then
    alter table public.clients add constraint clients_schedule_day_1_check check (schedule_day_1 between 0 and 6);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'clients_schedule_day_2_check') then
    alter table public.clients add constraint clients_schedule_day_2_check check (schedule_day_2 between 0 and 6);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'clients_session_duration_check') then
    alter table public.clients add constraint clients_session_duration_check check (session_duration_minutes in (60, 90, 120));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'clients_cancelled_sessions_check') then
    alter table public.clients add constraint clients_cancelled_sessions_check check (cancelled_sessions >= 0);
  end if;
end $$;

create index if not exists clients_payment_status_idx on public.clients(payment_status);
