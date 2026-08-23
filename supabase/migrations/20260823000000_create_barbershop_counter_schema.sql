-- Barbershop Counter MVP - database foundation
-- Migration 1: barbershops + counters tables, indexes, and Row Level Security.

-- ============================================================================
-- barbershops (1 ─── 1 counter)
-- ============================================================================

create table if not exists public.barbershops (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  access_key_hash text not null,
  created_at      timestamptz not null default now()
);

-- Index for resolving a barbershop by slug.
-- (slug also has a UNIQUE constraint; this index makes the lookup path explicit.)
create index if not exists barbershops_slug_idx on public.barbershops (slug);

-- ============================================================================
-- counters (1 ─── 1 barbershop)
-- ============================================================================

create table if not exists public.counters (
  id             uuid primary key default gen_random_uuid(),
  barbershop_id  uuid not null unique references public.barbershops (id) on delete cascade,
  value          integer not null default 0,
  updated_at     timestamptz not null default now(),
  constraint counters_value_non_negative check (value >= 0)
);

-- Postgres does not auto-index FK columns; this accelerates lookups and cascades.
create index if not exists counters_barbershop_id_idx on public.counters (barbershop_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.barbershops enable row level security;
alter table public.counters   enable row level security;

-- ----------------------------------------------------------------------------
-- counters: public read (client-side polling of the public counter value).
-- ----------------------------------------------------------------------------
create policy counters_public_select on public.counters
  for select
  to anon
  using (true);

-- Privilege needed for the anon role to read counters via PostgREST.
-- (RLS still gates rows; only the non-sensitive counter value is exposed.)
grant select on public.counters to anon;

-- ----------------------------------------------------------------------------
-- DELIBERATELY DEFERRED (no policies created yet => default-deny).
--
-- barbershops:
--   * No anon/authenticated read policy. Public users must NOT be able to read
--     access_key_hash. RLS uses default-deny, so no role can select any column
--     (including access_key_hash). A public read of non-sensitive columns
--     (slug, name) will be added later via a security-barrier view that
--     excludes access_key_hash, once the public read flow is defined.
--
-- counters (modifiers):
--   * No INSERT / UPDATE / DELETE policies for anon or authenticated.
--     Counter updates will happen through the protected application flow
--     (operator supplies the barbershop access key). That flow requires an
--     authentication/session mechanism that does not exist yet, so modifier
--     policies are intentionally deferred until it does.
-- ----------------------------------------------------------------------------
