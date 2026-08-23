-- Fix: public tenant-resolution view must run as security-definer.
--
-- Supabase applies security_invoker=on by default on new views, which makes the
-- view run with the CALLER's (anon) privileges. Because barbershops is RLS
-- default-deny (no SELECT policy), anon could read 0 rows through the view ->
-- every tenant resolved to empty and all public/admin/counter routes returned
-- 404.
--
-- Recreate the view WITHOUT security_invoker so it runs with owner (postgres)
-- privileges. anon may then read the safe columns through the view despite RLS
-- on the underlying table. access_key_hash is NOT selected, so it is never
-- exposed; barbershops itself stays RLS-protected.

drop view if exists public.public_barbershops;

create view public.public_barbershops
with (security_barrier = true)
as
  select id, slug, name
  from public.barbershops;

comment on view public.public_barbershops is
  'Public tenant resolution view. Never exposes access_key_hash.';

grant select on public.public_barbershops to anon;
