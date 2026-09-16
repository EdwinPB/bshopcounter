-- DIELEM public theme correction.
--
-- YEPES Premium stays exclusive to YEPES. The initial theme assignment gave
-- DIELEM the same premium theme; this corrects DIELEM to Executive Navy so each
-- banner tenant has its own visual identity.
--
-- Presentation-only: updates a single theme_key (scoped by slug). Does NOT touch
-- counters, jornada (is_open) state, share_message, access keys, or branding.
--
-- The check constraint already permits 'executive-navy', so no schema change.

update public.barbershops
  set theme_key = 'executive-navy'
  where slug = 'dielem';
