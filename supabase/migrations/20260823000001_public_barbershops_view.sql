-- Public tenant resolution surface.
--
-- Exposes ONLY non-sensitive barbershop columns (id, slug, name) so the
-- anonymous public application can resolve slug -> id + name.
--
-- access_key_hash and any other internal columns are NEVER exposed by this
-- view. `barbershops` itself remains Row-Level-Security-protected (default
-- deny for anon/authenticated), so it is not directly readable by the public
-- role.
--
-- Runs with owner (security-definer) semantics: anon may read through the
-- view despite RLS on the underlying table, but only the safe columns above
-- are reachable. security_barrier prevents leaky predicate optimization.

create view public.public_barbershops
with (security_barrier = true)
as
  select id, slug, name
  from public.barbershops;

comment on view public.public_barbershops is
  'Public tenant resolution view. Never exposes access_key_hash.';

-- Enable anonymous public reads of the view (PostgREST uses the anon role).
grant select on public.public_barbershops to anon;
