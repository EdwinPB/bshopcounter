"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import {
  createSession,
  deleteSession,
  getSession,
} from "@/lib/session";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import { normalizeLabel, tenantMatches } from "@/lib/barbershop-resolver";
import { estimateWaitingMinutes } from "@/lib/waiting-time";
import { MAX_SHARE_MESSAGE } from "@/lib/share";

const MAX_VALUE = 1000000;

type LoginState = {
  error?: string;
};

function validateValue(raw: string | null): number | null {
  if (raw === null || raw.trim() === "") return null;
  if (!/^\d+$/.test(raw.trim())) return null;
  const value = Number(raw.trim());
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_VALUE) {
    return null;
  }
  return value;
}

export async function login(
  slug: string,
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const accessKey = formData.get("accessKey");

  if (typeof accessKey !== "string" || accessKey.length === 0) {
    return { error: "Ingresá la clave de acceso." };
  }

  const supabase = createServiceRoleSupabaseClient();

  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("id, slug, access_key_hash, name")
    .eq("slug", slug)
    .maybeSingle();

  if (!barbershop || !barbershop.access_key_hash) {
    return { error: "Barbería no encontrada." };
  }

  const valid = await bcrypt.compare(accessKey, barbershop.access_key_hash);
  if (!valid) {
    return { error: "Clave incorrecta." };
  }

  await createSession({
    barbershopId: barbershop.id,
    barbershopSlug: barbershop.slug,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
  });

  redirect(`/${barbershop.slug}/admin`);
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

export type CounterUpdateResult = {
  error?: string;
  estimatedMinutes?: number;
  value?: number;
};

export async function updateCounter(
  slug: string,
  _prevState: { error?: string },
  formData: FormData,
): Promise<CounterUpdateResult> {
  const session = await getSession();
  if (!session) {
    return { error: "No autenticado." };
  }
  if (session.barbershopSlug !== slug) {
    return { error: "No autenticado." };
  }

  const rawValue = formData.get("value");
  const value = validateValue(typeof rawValue === "string" ? rawValue : null);
  if (value === null) {
    return { error: "Valor inválido." };
  }

  const supabase = createServiceRoleSupabaseClient();

  const { error } = await supabase
    .from("counters")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("barbershop_id", session.barbershopId);

  if (error) {
    return { error: "No se pudo actualizar el contador." };
  }

  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/admin`);

  // Return the confirmed persisted value so the admin UI never guesses.
  return { value, estimatedMinutes: estimateWaitingMinutes(value) };
}

// -----------------------------------------------------------------------------
// One-tap quick +/- controls.
//
// The +/- buttons never send a target count from the browser. A browser-derived
// "current + 1" would be racy (rapid taps, or a second admin device on a stale
// value, could overwrite each other). Instead the server asks Postgres to mutate
// the row atomically via adjust_counter and returns the confirmed result.
// -----------------------------------------------------------------------------

export type QuickUpdateResult =
  | { ok: true; value: number; estimatedMinutes: number }
  | { ok: false; error: string };

async function quickAdjust(
  slug: string,
  delta: 1 | -1,
): Promise<QuickUpdateResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "No autenticado." };
  }
  if (session.barbershopSlug !== slug) {
    return { ok: false, error: "No autenticado." };
  }

  // Delta is fixed server-side (+1 / -1). Tenant id comes from the trusted
  // HMAC session, never from the browser. The service-role client stays
  // server-only; adjust_counter is revoked from anon/authenticated.
  const supabase = createServiceRoleSupabaseClient();

  const { data: value, error } = await supabase.rpc("adjust_counter", {
    p_barbershop_id: session.barbershopId,
    p_delta: delta,
  });

  if (error) {
    return { ok: false, error: "No se pudo actualizar el contador." };
  }
  if (typeof value !== "number") {
    return { ok: false, error: "No se pudo actualizar el contador." };
  }

  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/admin`);

  return { ok: true, value, estimatedMinutes: estimateWaitingMinutes(value) };
}

export async function incrementCounter(slug: string) {
  return quickAdjust(slug, 1);
}

export async function decrementCounter(slug: string) {
  return quickAdjust(slug, -1);
}

export type ResolveBarbershopResult =
  | { slug: string; name: string; mode: "view" | "admin"; error?: never }
  | { error: string; slug?: never; name?: never; mode?: never };

// Resolve a user-typed barbershop name/slug against the public tenant records.
// Runs server-side against the safe public view; never trusts arbitrary ids.
export async function resolveBarbershop(
  _prevState: ResolveBarbershopResult | null,
  formData: FormData,
): Promise<ResolveBarbershopResult> {
  const raw = formData.get("name");
  if (typeof raw !== "string" || raw.trim() === "") {
    return { error: "Ingresá el nombre de la barbería." };
  }

  const normalized = normalizeLabel(raw);
  if (normalized.length === 0) {
    return { error: "Ingresá el nombre de la barbería." };
  }

  const supabase = createServerSupabaseClient();

  const { data: tenants, error } = await supabase
    .from("public_barbershops")
    .select("slug, name");

  if (error) {
    return { error: "No encontramos esa barbería." };
  }

  const match = (tenants ?? []).find((t) => tenantMatches(normalized, t));

  if (!match) {
    return { error: "No encontramos esa barbería." };
  }

  const mode = formData.get("mode") === "admin" ? "admin" : "view";
  return { slug: match.slug, name: match.name, mode };
}

export async function startJornada(
  slug: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: { error?: string },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.barbershopSlug !== slug) {
    return { error: "No autenticado." };
  }

  const supabase = createServiceRoleSupabaseClient();

  const { error } = await supabase
    .from("barbershops")
    .update({
      is_open: true,
      opened_at: new Date().toISOString(),
      closed_at: null,
    })
    .eq("id", session.barbershopId);

  if (error) {
    return { error: "No se pudo iniciar la jornada." };
  }

  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/admin`);

  return {};
}

export async function finishJornada(
  slug: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: { error?: string },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.barbershopSlug !== slug) {
    return { error: "No autenticado." };
  }

  const supabase = createServiceRoleSupabaseClient();

  const { error } = await supabase
    .from("barbershops")
    .update({
      is_open: false,
      closed_at: new Date().toISOString(),
    })
    .eq("id", session.barbershopId);

  if (error) {
    return { error: "No se pudo finalizar la jornada." };
  }

  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/admin`);

  return {};
}

export async function updateShareMessage(
  slug: string,
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string; message?: string | null }> {
  const session = await getSession();
  if (!session) {
    return { error: "No autenticado." };
  }
  if (session.barbershopSlug !== slug) {
    return { error: "No autenticado." };
  }

  const raw = formData.get("message");
  let value: string | null = null;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.length > MAX_SHARE_MESSAGE) {
      return {
        error: `Mensaje demasiado largo (máx ${MAX_SHARE_MESSAGE} caracteres).`,
      };
    }
    // Empty/whitespace resets to the default behavior (null -> default message).
    value = trimmed.length > 0 ? trimmed : null;
  }

  const supabase = createServiceRoleSupabaseClient();

  const { error } = await supabase
    .from("barbershops")
    .update({ share_message: value })
    .eq("id", session.barbershopId);

  if (error) {
    return { error: "No se pudo guardar el mensaje." };
  }

  revalidatePath(`/${slug}/admin`);

  return { message: value };
}
