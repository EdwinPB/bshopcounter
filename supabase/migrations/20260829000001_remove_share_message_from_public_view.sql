-- Remove share_message from the public projection.
--
-- branding is intentionally public (OG/public rendering reads it), but
-- share_message is admin configuration and must NOT be readable by anon.
-- The admin page reads it server-side via the service-role client after session
-- validation. This recreates the view with owner/definer behavior preserved.

drop view if exists public.public_barbershops;

create view public.public_barbershops
with (security_barrier = true, security_invoker = false)
as
  select id, slug, name, is_open, branding
  from public.barbershops;

comment on view public.public_barbershops is
  'Public tenant resolution view. Never exposes access_key_hash or share_message.';

grant select on public.public_barbershops to anon;
