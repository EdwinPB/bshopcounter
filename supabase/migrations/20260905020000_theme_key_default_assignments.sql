-- Corrective theme rollout.
--
-- The original theme feature shipped with `executive-navy` as the fallback and
-- assigned premium themes to real client tenants. This corrects that:
--
--  * `default` is now the product fallback (matches the pre-theme public UI).
--  * The CHECK constraint accepts all six public theme keys.
--  * Client tenants are not auto-themed: yepes + dielem resolve to `default`;
--    barberia-central (the designated test tenant) keeps `heritage-barber`.
--
-- Theme_key is presentational ONLY. This touches no counter values, jornada
-- (is_open) state, share_message, access keys, or branding.

-- 1. DB default is `default`.
alter table public.barbershops
  alter column theme_key set default 'default';

-- 2. Allow all six public theme keys.
alter table public.barbershops
  drop constraint if exists barbershops_theme_key_check;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'barbershops_theme_key_check') then
    alter table public.barbershops
      add constraint barbershops_theme_key_check
      check (theme_key in (
        'default',
        'executive-navy',
        'yepes-premium',
        'warm-atelier',
        'steel-ice',
        'heritage-barber'
      ));
  end if;
end $$;

-- 3. Assignments (presentation-only). No hardcoded slug behavior in the app:
-- these keys drive the appearance via theme_key alone.
update public.barbershops set theme_key = 'default' where slug = 'yepes';
update public.barbershops set theme_key = 'default' where slug = 'dielem';
update public.barbershops set theme_key = 'heritage-barber' where slug = 'barberia-central';
