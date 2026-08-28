-- Atomic, tenant-scoped counter adjustment for the admin one-tap quick controls.
--
-- WHY THIS IS NEEDED:
-- The manual "Actualizar" flow sends a target value from the browser to the
-- server, which then writes it with the service-role client. Setting an exact
-- value is fine, but one-tap +/- must be ATOMIC with respect to the stored
-- value. A browser-computed target (current + 1) is racy: rapid taps, or a
-- second admin device on a stale count, would overwrite the real value.
--
-- Instead Postgres mutates the row in place:
--     value = GREATEST(value + p_delta, 0)
-- so +1 always yields stored+1 and -1 always yields stored-1 (floored at 0),
-- regardless of what any client previously read. The confirmed new value is
-- returned so the admin UI can sync to it (never to a client guess).
--
-- SECURITY MODEL (preserved):
--   * Runs SECURITY INVOKER (default) -> executes with the caller privileges.
--     No SECURITY DEFINER, so RLS remains in force for normal roles.
--   * ONLY the Supabase service_role may call it. EXECUTE is revoked from
--     public/anon/authenticated, so it is NOT an anonymous write endpoint and
--     is invisible to the public Data API. The existing RLS default-deny model
--     on counters/barbershops is untouched.
--   * Tenant scoping comes from the trusted server-side HMAC session: the
--     Next.js server produces p_barbershop_id from session.barbershopId. The
--     browser cannot address this function nor supply the tenant id.
--   * No new table is created; only the existing counters row is mutated.

create or replace function public.adjust_counter(p_barbershop_id uuid, p_delta integer)
returns integer
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  new_value integer;
begin
  -- Contract: only the one-tap +1 / -1 is valid. Reject anything else so the
  -- function can never blow the counter to an arbitrary absolute value.
  if p_delta is null or p_delta not in (1, -1) then
    raise exception 'adjust_counter: p_delta must be 1 or -1, got %', p_delta;
  end if;

  update public.counters
     set value = greatest(value + p_delta, 0),
         updated_at = now()
   where barbershop_id = p_barbershop_id
  returning value
  into new_value;

  return new_value;
end;
$$;

comment on function public.adjust_counter(uuid, integer) is
  'Atomic tenant-scoped +/- counter adjustment. Only callable by service_role.';

-- Supabase auto-grants EXECUTE to anon/authenticated via default privileges, so
-- revoke from PUBLIC, anon and authenticated: this must NOT be an anonymous or
-- authenticated write endpoint. Grant back to the server-side service_role only.
revoke execute on function public.adjust_counter(uuid, integer) from public;
revoke execute on function public.adjust_counter(uuid, integer) from anon;
revoke execute on function public.adjust_counter(uuid, integer) from authenticated;
grant execute on function public.adjust_counter(uuid, integer) to service_role;
