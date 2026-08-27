import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Counter from "@/components/counter/Counter";
import BarberPoleBackground from "@/components/ui/BarberPoleBackground";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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
    "Consulta cuántas personas están esperando y el tiempo estimado.";

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
}: PageProps<"/[barbershopSlug]">) {
  const { barbershopSlug } = await params;
  const supabase = createServerSupabaseClient();

  const { data: barbershop, error: shopError } = await supabase
    .from("public_barbershops")
    .select("id, name, is_open")
    .eq("slug", barbershopSlug)
    .maybeSingle();

  if (shopError) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-neutral-600 text-lg">
          No se pudo cargar la barbería.
        </p>
      </main>
    );
  }

  if (!barbershop) {
    notFound();
  }

  const { data: counter, error: counterError } = await supabase
    .from("counters")
    .select("value")
    .eq("barbershop_id", barbershop.id)
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

  return (
    <BarberPoleBackground>
      <main className="flex flex-1 items-center justify-center p-8">
        <Counter
          name={barbershop.name}
          count={counter?.value ?? 0}
          isOpen={barbershop.is_open}
          slug={barbershopSlug}
        />
      </main>
    </BarberPoleBackground>
  );
}
