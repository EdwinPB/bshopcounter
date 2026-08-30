import { ImageResponse } from "next/og";
import SocialCard from "@/components/social/SocialCard";
import { normalizeTheme } from "@/lib/tenant-branding";
import { resolveTenantOrNotFound } from "@/lib/tenant";

export const runtime = "nodejs";

export const alt = "Barbershop Counter";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ barbershopSlug: string }>;
}) {
  const { barbershopSlug } = await params;
  const tenant = await resolveTenantOrNotFound(barbershopSlug);
  const theme = normalizeTheme(tenant.branding);
  const name = tenant.name.toUpperCase();

  return new ImageResponse(
    <SocialCard name={name} theme={theme} />,
    { ...size },
  );
}
