import type { CSSProperties } from "react";
import type { PublicThemeDecor, PublicThemeTokens } from "@/lib/public-themes";

// Four hairline corner ticks, drawn with borders only (no assets).
function CornerTicks({
  color,
  inset = 16,
  size = 38,
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
      <span style={{ ...base, top: inset, left: inset, borderTopWidth: 1, borderLeftWidth: 1 }} />
      <span style={{ ...base, top: inset, right: inset, borderTopWidth: 1, borderRightWidth: 1 }} />
      <span style={{ ...base, bottom: inset, left: inset, borderBottomWidth: 1, borderLeftWidth: 1 }} />
      <span style={{ ...base, bottom: inset, right: inset, borderBottomWidth: 1, borderRightWidth: 1 }} />
    </>
  );
}

// CSS-only decorative primitives. Each variant is built exclusively from the
// active theme's tokens — gradients, repeating gradients, borders and shadows,
// never images or JS. Layers sit behind the content and are aria-hidden and
// pointer-events-none so they can never intercept controls.
export default function ThemeDecor({
  decor,
  tokens,
}: {
  decor: PublicThemeDecor;
  tokens: PublicThemeTokens;
}) {
  if (decor === "none") return null;

  const accent = tokens.accent;
  const secondary = tokens.accentSecondary;
  const border = tokens.border;

  if (decor === "executive-geometry") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Faint grid for depth. */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, ${accent}14 0 1px, transparent 1px 48px), repeating-linear-gradient(90deg, ${accent}14 0 1px, transparent 1px 48px)`,
          }}
        />
        {/* Restrained angular sections. */}
        <div
          className="absolute -right-20 -top-20 size-64 rotate-45"
          style={{ border: `1px solid ${accent}1f` }}
        />
        <div
          className="absolute -bottom-24 -left-24 size-72 rotate-45"
          style={{ border: `1px solid ${border}` }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}59, transparent)` }}
        />
      </div>
    );
  }

  if (decor === "gold-luxury") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Restrained gold halo behind the number. */}
        <div
          className="absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            border: `1px solid ${accent}26`,
            boxShadow: `inset 0 0 80px ${accent}14`,
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ border: `1px solid ${accent}12` }}
        />
        <CornerTicks color={`${accent}40`} inset={18} size={44} />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}59, transparent)` }}
        />
      </div>
    );
  }

  if (decor === "atelier") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Warm top wash + barely-there grain grid. */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `radial-gradient(60% 40% at 50% 0%, ${accent}1f, transparent 70%)` }}
        />
        <div
          className="absolute inset-0 opacity-45"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, ${border} 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, ${border} 0 1px, transparent 1px 40px)`,
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}4d, transparent)` }}
        />
      </div>
    );
  }

  if (decor === "technical-grid") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Diagonal technical lines + precise grid. */}
        <div
          className="absolute inset-0 opacity-70"
          style={{ backgroundImage: `repeating-linear-gradient(135deg, ${accent}12 0 1px, transparent 1px 22px)` }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, ${accent}1a 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, ${accent}1a 0 1px, transparent 1px 32px)`,
          }}
        />
        <CornerTicks color={`${accent}33`} inset={16} size={34} />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}80, transparent)` }}
        />
      </div>
    );
  }

  if (decor === "heritage-stripes") {
    // Restrained burgundy/navy diagonal stripe, corners only.
    const stripe = `repeating-linear-gradient(135deg, ${accent}1a 0 8px, ${secondary}22 8px 16px)`;
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-16 -top-16 size-44 rotate-45"
          style={{ background: stripe }}
        />
        <div
          className="absolute -bottom-16 -right-16 size-44 rotate-45"
          style={{ background: stripe }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}59, ${secondary}40, transparent)` }}
        />
      </div>
    );
  }

  return null;
}
