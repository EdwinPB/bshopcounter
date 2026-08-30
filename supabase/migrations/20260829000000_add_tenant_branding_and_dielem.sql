-- Tenant branding + configurable WhatsApp share message.
--
-- Adds per-tenant presentation/branding and a custom share message to
-- barbershops. Existing tenants keep the default design and default message
-- until they set their own branding/message (branding defaults to '{}').
--
-- The safe public projection gains branding + share_message; access_key_hash
-- stays hidden. security_invoker=false is set explicitly (Supabase defaults new
-- views to security_invoker=true, which would break anon reads via RLS
-- default-deny on barbershops). We did NOT reintroduce that production bug.

alter table public.barbershops
  add column if not exists share_message text null,
  add column if not exists branding jsonb not null default '{}'::jsonb;

drop view if exists public.public_barbershops;

create view public.public_barbershops
with (security_barrier = true, security_invoker = false)
as
  select id, slug, name, is_open, branding, share_message
  from public.barbershops;

comment on view public.public_barbershops is
  'Public tenant resolution view. Never exposes access_key_hash.';

grant select on public.public_barbershops to anon;

-- Provision DIELEM (idempotent: safe no-op if it already exists). The admin
-- access key is stored ONLY as a bcrypt hash; the plaintext is never written
-- here. Existing tenants are not touched.
insert into public.barbershops (slug, name, access_key_hash, is_open, branding, share_message)
values (
  'dielem',
  'DIELEM',
  '$2b$10$EUixrvlobMIyATBBAkbEte6ZvAc0gbqwwH6n95VeWLr8meUW8dypK',
  false,
  '{"theme":"custom","primaryColor":"#e0bf78","secondaryColor":"#efe7d3","accentColor":"#c9a24b","backgroundColor":"#101010","textColor":"#f2ead8","tagline":"BARBERÍA PREMIUM"}'::jsonb,
  null
)
on conflict (slug) do nothing;

insert into public.counters (barbershop_id, value)
select id, 0
from public.barbershops
where slug = 'dielem'
  and not exists (select 1 from public.counters c where c.barbershop_id = public.barbershops.id);
