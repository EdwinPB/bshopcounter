import type { Metadata } from "next";
import PublicQueueView from "@/components/public/PublicQueueView";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveEffectiveThemeKey } from "@/lib/public-themes";
import { resolveTenantOrNotFound } from "@/lib/tenant";

export async function generateMetadata({
  params,
}: PageProps<"/[barbershopSlug]">): Promise<Metadata> {
  const { barbershopSlug } = await params;
  const tenant = await resolveTenantOrNotFound(barbershopSlug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const ogUrl = `${siteUrl ?? ""}/${tenant.slug}`;

  const title = `${tenant.name} Peluquería`;
  const description =
    "Dale click para ver cuántas personas están esperando y el tiempo estimado antes de venir.";

  return {
    title,
    description,
    openGraph: {
      type: "website",
      url: ogUrl,
      title,
      description,
      siteName: tenant.name,
      images: [
        {
          url: `${ogUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${tenant.name} · Barbershop Counter`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: `${ogUrl}/twitter-image`,
          width: 1200,
          height: 630,
          alt: `${tenant.name} · Barbershop Counter`,
        },
      ],
    },
    alternates: {
      canonical: ogUrl,
    },
  };
}

export default async function BarbershopPage({
  params,
  searchParams,
}: PageProps<"/[barbershopSlug]">) {
  const { barbershopSlug } = await params;
  const { previewTheme } = (await searchParams) ?? {};
  const tenant = await resolveTenantOrNotFound(barbershopSlug);

  // Developer tool only: in development `?previewTheme=<key>` can render any
  // bundled theme WITHOUT persisting anything. Production ignores it entirely
  // and always uses the tenant's persisted theme_key. Resolved on the server so
  // the first paint already has the correct theme (no hydration flash).
  const themeKey = resolveEffectiveThemeKey({
    previewTheme,
    persistedThemeKey: tenant.theme_key,
    isDevelopment: process.env.NODE_ENV === "development",
  });

  const supabase = createServerSupabaseClient();

  const { data: counter, error: counterError } = await supabase
    .from("counters")
    .select("value")
    .eq("barbershop_id", tenant.id)
    .maybeSingle();

  if (counterError) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-neutral-600 text-lg">
          No se pudo cargar el contador.
        </p>
      </main>
    );
  }

  const branding =
    typeof tenant.branding === "object" &&
    tenant.branding !== null &&
    "tagline" in tenant.branding
      ? (tenant.branding as { tagline?: unknown }).tagline
      : undefined;
  const tagline = typeof branding === "string" ? branding : null;

  return (
    <PublicQueueView
      name={tenant.name}
      tagline={tagline}
      themeKey={themeKey}
      initialCount={counter?.value ?? 0}
      isOpen={tenant.is_open}
      slug={barbershopSlug}
    />
  );
}
