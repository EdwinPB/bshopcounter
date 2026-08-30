import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export type PublicTenant = {
  id: string;
  slug: string;
  name: string;
  is_open: boolean;
  branding: unknown;
};

// Resolve a tenant by slug using the public tenant view.
// Returns null if not found; the caller decides how to handle it.
export async function resolveTenant(slug: string): Promise<PublicTenant | null> {
  const supabase = createServerSupabaseClient();

  const { data: barbershop } = await supabase
    .from("public_barbershops")
    .select("id, slug, name, is_open, branding")
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
