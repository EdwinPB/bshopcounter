-- Barbershop Counter MVP - development seed.
--
-- Creates one demo barbershop:
--   * Barbería Central
--   * slug: barberia-central
--   * counter: 7
--
-- NOTE: access_key_hash is a clearly-marked PLACEHOLDER, not a real secret.
-- Replace before going to production.

insert into public.barbershops (slug, name, access_key_hash)
values (
  'barberia-central',
  'Barbería Central',
  'PLACEHOLDER_ACCESS_KEY_HASH__replace_me'
);

insert into public.counters (barbershop_id, value)
select id, 7
from public.barbershops
where slug = 'barberia-central';
