-- Operating status for a barbershop.
--
-- Adds minimum columns to represent whether a barbershop is currently
-- attending clients. No scheduling/hours/calendar logic.
--
--   is_open      whether the shop is currently attending clients
--   opened_at    when the current (or most recent) open started
--   closed_at    when the shop was last closed
--
-- The public view is updated to expose is_open (plus existing id/slug/name).
-- access_key_hash is NEVER exposed. RLS on barbershops stays default-deny.

alter table public.barbershops
  add column if not exists is_open boolean not null default false,
  add column if not exists opened_at timestamptz null,
  add column if not exists closed_at timestamptz null;

-- Expose is_open to the public application via the security-definer view.
drop view if exists public.public_barbershops;

create view public.public_barbershops
with (security_barrier = true)
as
  select id, slug, name, is_open
  from public.barbershops;

comment on view public.public_barbershops is
  'Public tenant resolution view. Never exposes access_key_hash.';

grant select on public.public_barbershops to anon;
