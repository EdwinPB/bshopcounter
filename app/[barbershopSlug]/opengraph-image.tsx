import { ImageResponse } from "next/og";
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

  const name = tenant.name.toUpperCase();
  const tagline = "Consulta la espera antes de venir";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Subtle barber-pole diagonal accents */}
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: "-20%",
            width: "60%",
            height: "160%",
            display: "flex",
            transform: "rotate(24deg)",
            background:
              "linear-gradient(160deg, rgba(201,75,75,0.14), rgba(201,75,75,0) 45%), linear-gradient(160deg, rgba(58,111,176,0.14), rgba(58,111,176,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30%",
            right: "-20%",
            width: "60%",
            height: "160%",
            display: "flex",
            transform: "rotate(24deg)",
            background:
              "linear-gradient(-20deg, rgba(201,75,75,0.12), rgba(201,75,75,0) 50%), linear-gradient(-20deg, rgba(58,111,176,0.12), rgba(58,111,176,0) 75%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 30,
              letterSpacing: "0.35em",
              color: "#a3a3a3",
              display: "flex",
            }}
          >
            BARBERSHOP COUNTER
          </div>

          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              color: "#171717",
              letterSpacing: "0.02em",
              display: "flex",
            }}
          >
            {name}
          </div>

          <div
            style={{
              width: 120,
              height: 6,
              borderRadius: 999,
              background: "linear-gradient(90deg, #c94b4b, #3a6fb0)",
              display: "flex",
            }}
          />

          <div
            style={{
              fontSize: 36,
              color: "#525252",
              display: "flex",
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
