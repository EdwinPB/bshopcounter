-- Tenant public-page theme selector.
--
-- Adds a server-configured theme_key on barbershops. Only the selected key is
-- stored; all theme definitions live in the app (lib/public-themes.ts). This is
-- presentational ONLY and never touches counters, jornada state, access keys,
-- or share messages.
--
-- Existing tenants are assigned a sensible presentation theme that matches
-- their current brand without changing any operational state.

alter table public.barbershops
  add column if not exists theme_key text not null default 'executive-navy';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'barbershops_theme_key_check') then
    alter table public.barbershops
      add constraint barbershops_theme_key_check
      check (theme_key in (
        'executive-navy',
        'yepes-premium',
        'warm-atelier',
        'steel-ice',
        'heritage-barber'
      ));
  end if;
end $$;

-- Presentation-only assignments (counters, jornada, access keys, share messages
-- are untouched).
update public.barbershops set theme_key = 'yepes-premium' where slug = 'yepes';
update public.barbershops set theme_key = 'heritage-barber' where slug = 'barberia-central';
-- Dielem's stored branding is dark + premium gold, so it maps to the premium
-- theme rather than the default navy.
update public.barbershops set theme_key = 'yepes-premium' where slug = 'dielem';

-- Expose theme_key publicly (safe, presentational). access_key_hash and
-- share_message stay hidden. Security model preserved: security_barrier=true,
-- security_invoker=false, anon SELECT only.
drop view if exists public.public_barbershops;

create view public.public_barbershops
with (security_barrier = true, security_invoker = false)
as
  select id, slug, name, is_open, branding, theme_key
  from public.barbershops;

comment on view public.public_barbershops is
  'Public tenant resolution view. Never exposes access_key_hash or share_message.';

grant select on public.public_barbershops to anon;
