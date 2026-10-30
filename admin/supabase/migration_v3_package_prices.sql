-- Apply this migration to an existing Eissya Physio database after migration_v2.
-- Existing package records keep their agreed price; new records use the updated prices from the portal.

alter table public.clients
  alter column package_price set default 140;
