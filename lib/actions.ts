"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import {
  createSession,
  deleteSession,
  getSession,
} from "@/lib/session";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

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

export async function updateCounter(
  slug: string,
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
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

  return {};
}
