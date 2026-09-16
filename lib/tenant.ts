import "server-only";

import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export type PublicTenant = {
  id: string;
  slug: string;
  name: string;
  is_open: boolean;
  branding: unknown;
  theme_key: string;
};

// Resolve a tenant by slug using the public tenant view.
// Returns null if not found; the caller decides how to handle it.
export async function resolveTenant(slug: string): Promise<PublicTenant | null> {
  const supabase = createServerSupabaseClient();

  const { data: barbershop } = await supabase
    .from("public_barbershops")
    .select("id, slug, name, is_open, branding, theme_key")
    .eq("slug", slug)
    .maybeSingle();

  if (!barbershop) {
    return null;
  }

  return {
    id: barbershop.id,
    slug: barbershop.slug,
    name: barbershop.name,
    is_open: barbershop.is_open,
    branding: barbershop.branding,
    theme_key: barbershop.theme_key,
  };
}

// Resolve a tenant or throw notFound.
export async function resolveTenantOrNotFound(
  slug: string,
): Promise<PublicTenant> {
  const tenant = await resolveTenant(slug);
  if (!tenant) {
    notFound();
  }
  return tenant;
}

// Admin-only `share_message`, read server-side with the service-role client and
// scoped by SLUG (never a browser-supplied id). It is intentionally absent from
// the public view; this is used ONLY to build public Open Graph / Twitter
// description content (the tenant configured it as public preview copy).
export async function getTenantShareMessage(
  slug: string,
): Promise<string | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data } = await supabase
    .from("barbershops")
    .select("share_message")
    .eq("slug", slug)
    .maybeSingle();

  return data?.share_message ?? null;
}

// Current waiting count for a tenant (anon-readable). 0 when no row exists.
export async function getTenantCounterValue(
  barbershopId: string,
): Promise<number> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("counters")
    .select("value")
    .eq("barbershop_id", barbershopId)
    .maybeSingle();

  return data?.value ?? 0;
}
