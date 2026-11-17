-- Preserve previous packages on the same patient. Safe to run more than once.
alter table public.clients
  add column if not exists package_history jsonb not null default '[]'::jsonb;

-- The archive and new package are written together. A row lock and version check
-- prevent two tabs from renewing the same completed package twice.
create or replace function public.renew_client_package(
  p_client_id uuid,
  p_expected_updated_at timestamptz,
  p_package_name text,
  p_package_price numeric,
  p_payment_status text,
  p_next_session timestamptz
)
returns public.clients
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_client public.clients;
  renewed_client public.clients;
  new_total integer;
begin
  select * into current_client from public.clients
  where id = p_client_id and owner_id = (select auth.uid())
  for update;

  if not found then
    raise exception 'Patient record was not found.';
  end if;
  if current_client.updated_at is distinct from p_expected_updated_at then
    raise exception 'This patient record changed. Refresh the page before renewing.';
  end if;
  if current_client.payment_status <> 'paid' or current_client.sessions_used < current_client.sessions_total then
    raise exception 'Complete the current package and mark it paid before renewing.';
  end if;
  new_total := case p_package_name when 'Single Session' then 1 when 'Trial Pack' then 3 when 'Progress Pack' then 8 else null end;
  if new_total is null or p_package_price is null or p_package_price < 0
    or p_payment_status is null or p_payment_status not in ('pending', 'paid') or p_next_session is null then
    raise exception 'Choose a valid package, price, payment status and first visit.';
  end if;

  update public.clients set
    package_history = current_client.package_history || jsonb_build_array(jsonb_build_object(
      'package_name', current_client.package_name,
      'package_price', current_client.package_price,
      'sessions_total', current_client.sessions_total,
      'sessions_used', current_client.sessions_used,
      'cancelled_sessions', current_client.cancelled_sessions,
      'payment_status', current_client.payment_status,
      'renewed_at', now()
    )),
    package_name = p_package_name,
    package_price = p_package_price,
    sessions_total = new_total,
    sessions_used = 0,
    cancelled_sessions = 0,
    payment_status = p_payment_status,
    status = 'active',
    next_session = p_next_session
  where id = p_client_id
  returning * into renewed_client;

  return renewed_client;
end;
$$;

revoke all on function public.renew_client_package(uuid, timestamptz, text, numeric, text, timestamptz) from public;
grant execute on function public.renew_client_package(uuid, timestamptz, text, numeric, text, timestamptz) to authenticated;
