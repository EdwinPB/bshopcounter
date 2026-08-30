import type { CSSProperties } from "react";
import type { Theme } from "@/lib/tenant-branding";

function BarberBand({
  style,
  accent,
  accentSecondary,
  text,
}: {
  style: CSSProperties;
  accent: string;
  accentSecondary: string;
  text: string;
}) {
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
      <div style={{ width: 14, height: "100%", background: accentSecondary }} />
      <div style={{ width: 12, height: "100%", background: text }} />
      <div style={{ width: 14, height: "100%", background: accent }} />
      <div style={{ width: 12, height: "100%", background: text }} />
      <div style={{ width: 14, height: "100%", background: accentSecondary }} />
      <div style={{ width: 12, height: "100%", background: text }} />
      <div style={{ width: 14, height: "100%", background: accent }} />
      <div style={{ width: 12, height: "100%", background: text }} />
    </div>
  );
}

export default function SocialCard({
  name,
  theme,
}: {
  name: string;
  theme: Theme;
}) {
  const cta = "¡DALE CLICK AQUÍ!";
  const benefit1 = "PARA VER CUÁNTAS PERSONAS";
  const benefit2 = "FALTAN ANTES DE VENIR";
  const showTagline =
    theme.kind === "custom" &&
    theme.tagline &&
    theme.tagline.trim().length > 0 &&
    theme.tagline.trim().toUpperCase() !== name;
  const nameColor = theme.kind === "default" ? "#ffffff" : theme.text;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(180deg, ${theme.bgStart} 0%, ${theme.bgEnd} 100%)`,
        position: "relative",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {/* Barber-pole accents, mostly around edges/corners */}
      <BarberBand
        style={{ top: -30, left: -70, width: 240, height: 150, opacity: 0.2 }}
        accent={theme.accent}
        accentSecondary={theme.accentSecondary}
        text={theme.text}
      />
      <BarberBand
        style={{ bottom: -30, right: -70, width: 240, height: 150, opacity: 0.2 }}
        accent={theme.accent}
        accentSecondary={theme.accentSecondary}
        text={theme.text}
      />

      {/* Soft radial light in the center to lift content and add depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%)",
        }}
      />

      {/* Subtle bottom-right brand block */}
      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 56,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: theme.brandText,
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
            background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentSecondary})`,
            display: "flex",
          }}
        />
        BARBERSHOP COUNTER
      </div>

      {/* Central content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: 900,
          zIndex: 2,
        }}
      >
        {/* 1. CTA — the immediate action */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            color: theme.text,
            fontSize: 60,
            fontWeight: 800,
            letterSpacing: "0.01em",
            lineHeight: 1.05,
            textAlign: "center",
          }}
        >
          {cta}
          <span
            style={{
              color: theme.accent,
              fontSize: 62,
              fontWeight: 700,
              display: "flex",
            }}
          >
            →
          </span>
        </div>

        {/* 2. Benefit message — the emotional focal point */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              color: theme.text,
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "0.02em",
              lineHeight: 1.28,
              display: "flex",
            }}
          >
            {benefit1}
          </div>
          <div
            style={{
              color: theme.accentEmphasis,
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "0.02em",
              lineHeight: 1.28,
              display: "flex",
            }}
          >
            {benefit2}
          </div>
        </div>

        {/* Thin accent divider */}
        <div
          style={{
            marginTop: 40,
            marginBottom: 28,
            width: 120,
            height: 5,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentSecondary})`,
            display: "flex",
          }}
        />

        {/* 3. Tenant identity — the wordmark/name serves as the logo */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 600,
            letterSpacing: "0.08em",
            lineHeight: 1.1,
            color: nameColor,
            display: "flex",
            maxWidth: 900,
          }}
        >
          {name}
        </div>

        {showTagline && (
          <div
            style={{
              marginTop: 14,
              fontSize: 30,
              fontWeight: 500,
              letterSpacing: "0.3em",
              color: theme.accentEmphasis,
              display: "flex",
            }}
          >
            {theme.tagline}
          </div>
        )}
      </div>
    </div>
  );
}
