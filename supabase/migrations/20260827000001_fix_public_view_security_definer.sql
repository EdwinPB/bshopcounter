-- Fix: public tenant-resolution view must actually run as security-definer.
--
-- Migrations 02/03 INTENDED this view to run as owner (security-definer) so
-- that the anon role could read the safe columns (id, slug, name, is_open)
-- despite RLS default-deny on barbershops. But they created the view with
-- `with (security_barrier = true)` only, and Supabase defaults new views to
-- security_invoker=true. A security-invoker view runs as the CALLER (anon),
-- which is blocked by RLS on barbershops -> anon reads 0 rows -> every public /
-- counter / admin route resolved no tenant (404 / null). This broke the whole
-- public-read path, including the public polling used by the quick-counter
-- iteration.
--
-- Recreate the view with security_invoker=false so it runs as owner. It exposes
-- ONLY the safe columns (access_key_hash is never selected); the barbershops
-- table itself remains RLS default-deny. The modelled security model is
-- preserved; this just makes the view honour what the earlier migrations
-- intended.

drop view if exists public.public_barbershops;

create view public.public_barbershops
with (security_barrier = true, security_invoker = false)
as
  select id, slug, name, is_open
  from public.barbershops;

comment on view public.public_barbershops is
  'Public tenant resolution view. Never exposes access_key_hash.';

grant select on public.public_barbershops to anon;
