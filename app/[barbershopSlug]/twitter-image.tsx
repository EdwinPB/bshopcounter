import type { CSSProperties } from "react";
import { ImageResponse } from "next/og";
import { resolveTenantOrNotFound } from "@/lib/tenant";

export const runtime = "nodejs";

export const alt = "Barbershop Counter";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const NAVY = "#16283f";
const NAVY_DEEP = "#101d30";
const RED = "#b44b4b";
const BLUE = "#3f6ea8";
const OFFWHITE = "#f5f7fa";
const MUTED = "#c7d2e0";

function BarberBand({ style }: { style: CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        transform: "rotate(24deg)",
        ...style,
      }}
    >
      <div style={{ width: 14, height: "100%", background: BLUE }} />
      <div style={{ width: 12, height: "100%", background: OFFWHITE }} />
      <div style={{ width: 14, height: "100%", background: RED }} />
      <div style={{ width: 12, height: "100%", background: OFFWHITE }} />
      <div style={{ width: 14, height: "100%", background: BLUE }} />
      <div style={{ width: 12, height: "100%", background: OFFWHITE }} />
      <div style={{ width: 14, height: "100%", background: RED }} />
      <div style={{ width: 12, height: "100%", background: OFFWHITE }} />
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ barbershopSlug: string }>;
}) {
  const { barbershopSlug } = await params;
  const tenant = await resolveTenantOrNotFound(barbershopSlug);

  const name = tenant.name.toUpperCase();
  const cta = "¡DALE CLICK AQUÍ!";
  const explain1 = "para ver cuántas personas faltan";
  const explain2 = "antes de venir";

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
          background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        <BarberBand
          style={{
            top: -30,
            left: -70,
            width: 240,
            height: 150,
            opacity: 0.2,
          }}
        />
        <BarberBand
          style={{
            bottom: -30,
            right: -70,
            width: 240,
            height: 150,
            opacity: 0.2,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 42%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 64,
            bottom: 56,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#8fa3bd",
            fontSize: 22,
            letterSpacing: "0.22em",
            opacity: 0.8,
          }}
        >
          <div
            style={{
              width: 34,
              height: 4,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${RED}, ${BLUE})`,
              display: "flex",
            }}
          />
          BARBERSHOP COUNTER
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            width: 860,
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: "0.02em",
              lineHeight: 1.08,
              color: OFFWHITE,
              display: "flex",
              maxWidth: 840,
            }}
          >
            {name}
          </div>

          <div
            style={{
              marginTop: 30,
              marginBottom: 26,
              width: 140,
              height: 6,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${RED}, ${BLUE})`,
              display: "flex",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              color: OFFWHITE,
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.05,
              textAlign: "center",
            }}
          >
            {cta}
            <span
              style={{
                color: RED,
                fontSize: 60,
                fontWeight: 700,
                display: "flex",
              }}
            >
              →
            </span>
          </div>

          <div
            style={{
              marginTop: 22,
              color: MUTED,
              fontSize: 40,
              fontWeight: 500,
              lineHeight: 1.25,
              display: "flex",
            }}
          >
            {explain1}
          </div>
          <div
            style={{
              color: MUTED,
              fontSize: 40,
              fontWeight: 500,
              lineHeight: 1.25,
              display: "flex",
            }}
          >
            {explain2}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
