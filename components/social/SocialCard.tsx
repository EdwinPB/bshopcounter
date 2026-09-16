import type { CSSProperties } from "react";
import type { SocialTheme } from "@/lib/social-share";

// Long share messages are clamped so the subtitle can never dominate the card.
const MAX_CARD_MESSAGE = 240;

// Rotated barber-pole style stripe band (bar / gap / bar / gap ...). Used by the
// default and heritage decorations. Explicit elements only — no repeating
// gradients — so it renders in Satori.
function StripeBand({
  style,
  a,
  b,
}: {
  style: CSSProperties;
  a: string;
  b: string;
}) {
  const widths = [14, 12, 14, 12, 14, 12, 14, 12];
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
      {widths.map((w, i) => (
        <div
          key={i}
          style={{
            width: w,
            height: "100%",
            background: i % 2 === 0 ? a : b,
          }}
        />
      ))}
    </div>
  );
}

// Four hairline corner ticks (borders only).
function CornerTicks({
  color,
  inset = 22,
  size = 54,
}: {
  color: string;
  inset?: number;
  size?: number;
}) {
  const base: CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    borderStyle: "solid",
    borderWidth: 0,
    borderColor: color,
  };
  return (
    <>
      <div style={{ ...base, top: inset, left: inset, borderTopWidth: 2, borderLeftWidth: 2 }} />
      <div style={{ ...base, top: inset, right: inset, borderTopWidth: 2, borderRightWidth: 2 }} />
      <div style={{ ...base, bottom: inset, left: inset, borderBottomWidth: 2, borderLeftWidth: 2 }} />
      <div style={{ ...base, bottom: inset, right: inset, borderBottomWidth: 2, borderRightWidth: 2 }} />
    </>
  );
}

// Theme-aware, Satori-safe decoration. Every variant is driven by the theme
// tokens resolved in lib/social-share.ts — no colors are hardcoded here.
function CardDecor({ theme }: { theme: SocialTheme }) {
  const { accent, accentSecondary, border, decorStyle } = theme;

  if (decorStyle === "executive-geometry") {
    return (
      <>
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 360,
            height: 360,
            border: `2px solid ${accent}`,
            opacity: 0.35,
            transform: "rotate(45deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            left: -140,
            width: 420,
            height: 420,
            border: `2px solid ${border}`,
            transform: "rotate(45deg)",
          }}
        />
        <CornerTicks color={accent} inset={22} size={50} />
      </>
    );
  }

  if (decorStyle === "gold-luxury") {
    return (
      <>
        <div
          style={{
            position: "absolute",
            top: 45,
            left: 310,
            width: 580,
            height: 580,
            borderRadius: 999,
            border: `3px solid ${accent}`,
            opacity: 0.28,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 105,
            left: 370,
            width: 460,
            height: 460,
            borderRadius: 999,
            border: `2px solid ${accent}`,
            opacity: 0.16,
          }}
        />
        <CornerTicks color={accent} inset={24} size={52} />
      </>
    );
  }

  if (decorStyle === "atelier") {
    return (
      <>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 260,
            background: `radial-gradient(ellipse at 50% 0%, ${accent}33 0%, ${accent}00 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 420,
            width: 360,
            height: 3,
            background: accent,
            opacity: 0.5,
          }}
        />
      </>
    );
  }

  if (decorStyle === "technical-grid") {
    return (
      <>
        <StripeBand
          style={{ top: -40, right: -90, width: 300, height: 200, opacity: 0.18 }}
          a={accent}
          b={accentSecondary}
        />
        <StripeBand
          style={{ bottom: -40, left: -90, width: 300, height: 200, opacity: 0.18 }}
          a={accent}
          b={accentSecondary}
        />
        <CornerTicks color={accent} inset={22} size={48} />
      </>
    );
  }

  if (decorStyle === "heritage-stripes") {
    return (
      <>
        <StripeBand
          style={{ top: -34, left: -80, width: 260, height: 160, opacity: 0.9 }}
          a={accent}
          b={accentSecondary}
        />
        <StripeBand
          style={{ bottom: -34, right: -80, width: 260, height: 160, opacity: 0.9 }}
          a={accent}
          b={accentSecondary}
        />
      </>
    );
  }

  // default: extremely subtle red/blue barber accents in the corners.
  return (
    <>
      <StripeBand
        style={{ top: -40, left: -80, width: 260, height: 170, opacity: 0.14 }}
        a={accent}
        b={accentSecondary}
      />
      <StripeBand
        style={{ bottom: -40, right: -80, width: 260, height: 170, opacity: 0.14 }}
        a={accent}
        b={accentSecondary}
      />
    </>
  );
}

export default function SocialCard({
  name,
  count,
  isOpen,
  message,
  theme,
}: {
  name: string;
  count: number;
  isOpen: boolean;
  message: string;
  theme: SocialTheme;
}) {
  const queueLabel = !isOpen
    ? "Cerrado ahora"
    : count === 1
      ? "1 persona esperando"
      : `${count} personas esperando`;

  const displayedMessage =
    message.length > MAX_CARD_MESSAGE
      ? `${message.slice(0, MAX_CARD_MESSAGE - 1).trimEnd()}…`
      : message;

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
      <CardDecor theme={theme} />

      {/* Top hairline in the theme accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 3,
          background: `linear-gradient(90deg, ${theme.bgStart} 0%, ${theme.accent} 50%, ${theme.bgStart} 100%)`,
        }}
      />

      {/* Compact call to action */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 0,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          color: theme.accent,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: "0.18em",
        }}
      >
        ¡DALE CLICK AQUÍ!
        <span style={{ display: "flex", fontSize: 34 }}>→</span>
      </div>

      {/* Central content: name, live queue, tenant share message */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: 960,
          maxWidth: 960,
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: "0.06em",
            lineHeight: 1.1,
            color: theme.nameColor,
            display: "flex",
            maxWidth: 940,
          }}
        >
          {name}
        </div>

        <div
          style={{
            marginTop: 22,
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: "0.02em",
            color: theme.accent,
            display: "flex",
          }}
        >
          {queueLabel}
        </div>

        <div
          style={{
            marginTop: 26,
            fontSize: 30,
            fontWeight: 500,
            lineHeight: 1.4,
            letterSpacing: "0.01em",
            color: theme.muted,
            display: "flex",
            maxWidth: 880,
          }}
        >
          {displayedMessage}
        </div>
      </div>

      {/* Subtle bottom-right brand block */}
      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 48,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: theme.muted,
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
    </div>
  );
}
