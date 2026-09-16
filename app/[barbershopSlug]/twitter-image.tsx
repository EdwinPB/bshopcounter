import { ImageResponse } from "next/og";
import SocialCard from "@/components/social/SocialCard";
import { normalizedShareMessage } from "@/lib/share";
import { getSocialTheme } from "@/lib/social-share";
import {
  getTenantCounterValue,
  getTenantShareMessage,
  resolveTenantOrNotFound,
} from "@/lib/tenant";

export const runtime = "nodejs";

// Generated per request (see opengraph-image for the caching rationale). The
// dev-only theme preview query never affects the shared Twitter card.
export const dynamic = "force-dynamic";

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

  const [shareMessage, count] = await Promise.all([
    getTenantShareMessage(barbershopSlug),
    getTenantCounterValue(tenant.id),
  ]);

  const theme = getSocialTheme(tenant.theme_key);

  return new ImageResponse(
    (
      <SocialCard
        name={tenant.name.toUpperCase()}
        count={count}
        isOpen={tenant.is_open}
        message={normalizedShareMessage(shareMessage)}
        theme={theme}
      />
    ),
    { ...size },
  );
}
