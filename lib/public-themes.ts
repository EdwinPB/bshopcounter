// Public page theme system.
//
// All 6 themes live in application code (bundled). Supabase stores ONLY the
// selected `theme_key` string on public.barbershops. This module is the single
// source of truth for theme metadata, semantic visual tokens, and the
// CSS-generated decoration used by the public page and the admin previews.
//
// Every theme is 100% CSS: gradients, repeating gradients, borders, shadows and
// geometric pseudo-layers. No image, SVG, or network asset is required for any
// theme's appearance, so the first server-rendered paint is already correct
// (no hydration flash) and there is no extra theme network request.

export const PUBLIC_THEME_KEYS = [
  "default",
  "executive-navy",
  "yepes-premium",
  "warm-atelier",
  "steel-ice",
  "heritage-barber",
] as const;

export type PublicThemeKey = (typeof PUBLIC_THEME_KEYS)[number];

export const DEFAULT_PUBLIC_THEME_KEY: PublicThemeKey = "default";

// Decoration styles are translated into lightweight CSS primitives by
// components/public/ThemeDecor.tsx. Appearance depends ONLY on theme_key.
export type PublicThemeDecor =
  | "none"
  | "executive-geometry"
  | "gold-luxury"
  | "atelier"
  | "technical-grid"
  | "heritage-stripes";

// Semantic tokens. `bgImage` and `surface` are pure CSS values (gradients /
// repeating gradients) — never `url(...)`. Colors are #rrggbb so callers can
// append an alpha channel (e.g. `${accent}22`) without a color library.
export type PublicThemeTokens = {
  // Page background.
  bgColor: string;
  bgImage: string;
  // Translucent panel/surface tint and hairline border color.
  surface: string;
  border: string;
  // Typography / content.
  text: string;
  muted: string;
  accent: string;
  accentSecondary: string;
  numberColor: string;
  fontDisplay: string;
  decorStyle: PublicThemeDecor;
  // Status pill (open / closed) — always paired with a label so status is never
  // communicated by color alone.
  statusOpenBg: string;
  statusOpenText: string;
  statusClosedBg: string;
  statusClosedText: string;
};

export type PublicThemeMeta = {
  key: PublicThemeKey;
  label: string;
  description: string;
  tokens: PublicThemeTokens;
};

const SANS = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
const SERIF = "ui-serif, Georgia, 'Times New Roman', Cambria, serif";
const CONDENSED = "'Arial Narrow', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

// -----------------------------------------------------------------------------
// Default theme artwork (CSS only).
//
// Reproduces the original barber-pole backdrop: white base, very faint
// red + blue diagonal stripes, softened by a white radial veil so the centre
// stays clean and the queue number stays readable. Shared by the public default
// view and the admin background so there is a single source of truth.
// -----------------------------------------------------------------------------
export const BARBER_POLE_BG_COLOR = "#ffffff";

export const BARBER_POLE_BG_IMAGE = [
  // Centre veil keeps the middle calm and readable.
  "radial-gradient(120% 120% at 50% 45%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.86) 42%, rgba(255,255,255,0.14) 100%)",
  // Extremely subtle red/white/blue diagonal branding.
  "repeating-linear-gradient(115deg, rgba(201,75,75,0.13) 0px, rgba(201,75,75,0.13) 9px, rgba(255,255,255,0) 9px, rgba(255,255,255,0) 15px, rgba(58,111,176,0.12) 15px, rgba(58,111,176,0.12) 27px, rgba(255,255,255,0) 27px, rgba(255,255,255,0) 40px)",
].join(", ");

// Faint 1px technical grid, reused as a depth texture across several themes.
function gridLines(color: string, cell: number): string {
  return [
    `repeating-linear-gradient(0deg, ${color} 0 1px, transparent 1px ${cell}px)`,
    `repeating-linear-gradient(90deg, ${color} 0 1px, transparent 1px ${cell}px)`,
  ].join(", ");
}

export const PUBLIC_THEMES: Record<PublicThemeKey, PublicThemeMeta> = {
  default: {
    key: "default",
    label: "Predeterminado",
    description: "Diseño original de la aplicación.",
    tokens: {
      bgColor: BARBER_POLE_BG_COLOR,
      bgImage: BARBER_POLE_BG_IMAGE,
      surface: "rgba(0,0,0,0.04)",
      border: "rgba(0,0,0,0.10)",
      text: "#171717",
      muted: "#737373",
      accent: "#c94b4b",
      accentSecondary: "#3a6fb0",
      numberColor: "#0a0a0a",
      fontDisplay: SANS,
      decorStyle: "none",
      statusOpenBg: "#D1FAE5",
      statusOpenText: "#047857",
      statusClosedBg: "#FEE2E2",
      statusClosedText: "#B91C1C",
    },
  },
  "executive-navy": {
    key: "executive-navy",
    label: "Executive Navy",
    description: "Corporate premium, restrained, midnight blue.",
    tokens: {
      bgColor: "#071A2B",
      bgImage: [
        gridLines("rgba(248,250,252,0.035)", 48),
        "linear-gradient(115deg, rgba(210,177,106,0.08) 0%, rgba(210,177,106,0) 38%)",
        "radial-gradient(120% 120% at 50% 0%, #0D2740 0%, #071A2B 60%, #051321 100%)",
      ].join(", "),
      surface: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.16)",
      text: "#F8FAFC",
      muted: "#B8C5D1",
      accent: "#D2B16A",
      accentSecondary: "#6B93BF",
      numberColor: "#F8FAFC",
      fontDisplay: SANS,
      decorStyle: "executive-geometry",
      statusOpenBg: "rgba(52, 211, 153, 0.16)",
      statusOpenText: "#6EE7B7",
      statusClosedBg: "rgba(248, 113, 113, 0.16)",
      statusClosedText: "#FCA5A5",
    },
  },
  "yepes-premium": {
    key: "yepes-premium",
    label: "YEPES Premium",
    description: "Exclusive black & gold barber identity.",
    tokens: {
      bgColor: "#0B0B0B",
      bgImage: [
        gridLines("rgba(212,175,55,0.05)", 56),
        "radial-gradient(120% 90% at 50% 0%, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0) 55%)",
        "radial-gradient(130% 130% at 50% 0%, #151515 0%, #0B0B0B 55%, #000000 100%)",
      ].join(", "),
      surface: "rgba(212,175,55,0.08)",
      border: "rgba(212,175,55,0.28)",
      text: "#F7F2E8",
      muted: "#C8BDAA",
      accent: "#D4AF37",
      accentSecondary: "#C9A45F",
      numberColor: "#F3EAD7",
      fontDisplay: SERIF,
      decorStyle: "gold-luxury",
      statusOpenBg: "rgba(216, 182, 106, 0.14)",
      statusOpenText: "#E4C77F",
      statusClosedBg: "rgba(200, 120, 120, 0.16)",
      statusClosedText: "#E8A8A8",
    },
  },
  "warm-atelier": {
    key: "warm-atelier",
    label: "Warm Atelier",
    description: "Boutique editorial, warm cream, refined serif.",
    tokens: {
      bgColor: "#F4EFE6",
      bgImage: [
        gridLines("rgba(20,32,42,0.025)", 40),
        "radial-gradient(120% 100% at 50% 0%, #FBF8F2 0%, #F4EFE6 68%, #EDE6DA 100%)",
      ].join(", "),
      surface: "rgba(193,160,108,0.12)",
      border: "rgba(20,32,42,0.14)",
      text: "#14202A",
      muted: "#756F68",
      accent: "#C1A06C",
      accentSecondary: "#A98B57",
      numberColor: "#14202A",
      fontDisplay: SERIF,
      decorStyle: "atelier",
      statusOpenBg: "rgba(62, 151, 105, 0.14)",
      statusOpenText: "#1F7A4D",
      statusClosedBg: "rgba(180, 60, 60, 0.14)",
      statusClosedText: "#A3383F",
    },
  },
  "steel-ice": {
    key: "steel-ice",
    label: "Steel & Ice",
    description: "Technical, masculine, cool slate & blue.",
    tokens: {
      bgColor: "#102531",
      bgImage: [
        gridLines("rgba(105,190,232,0.06)", 32),
        "linear-gradient(135deg, rgba(105,190,232,0.12) 0%, rgba(105,190,232,0) 36%)",
        "linear-gradient(135deg, #203E4C 0%, #102531 55%, #0A1A24 100%)",
      ].join(", "),
      surface: "rgba(105,190,232,0.10)",
      border: "rgba(105,190,232,0.30)",
      text: "#F7FBFE",
      muted: "#AFC0CA",
      accent: "#69BEE8",
      accentSecondary: "#9ADBF7",
      numberColor: "#F7FBFE",
      fontDisplay: SANS,
      decorStyle: "technical-grid",
      statusOpenBg: "rgba(105, 190, 232, 0.16)",
      statusOpenText: "#9ADBF7",
      statusClosedBg: "rgba(248, 113, 113, 0.16)",
      statusClosedText: "#FCA5A5",
    },
  },
  "heritage-barber": {
    key: "heritage-barber",
    label: "Heritage Barber",
    description: "Classic barber, modernized, cream & burgundy.",
    tokens: {
      bgColor: "#F7F3EA",
      bgImage: [
        gridLines("rgba(16,40,61,0.03)", 36),
        "radial-gradient(120% 100% at 50% 0%, #FBF8F2 0%, rgba(251,248,242,0) 62%)",
        "linear-gradient(180deg, #F7F3EA 0%, #F1EADD 100%)",
      ].join(", "),
      surface: "rgba(164,59,71,0.10)",
      border: "rgba(16,40,61,0.16)",
      text: "#10283D",
      muted: "#69737A",
      accent: "#A43B47",
      accentSecondary: "#10283D",
      numberColor: "#10283D",
      fontDisplay: CONDENSED,
      decorStyle: "heritage-stripes",
      statusOpenBg: "rgba(38, 105, 90, 0.14)",
      statusOpenText: "#226B54",
      statusClosedBg: "rgba(164, 59, 71, 0.14)",
      statusClosedText: "#96333C",
    },
  },
};

export function isPublicThemeKey(value: unknown): value is PublicThemeKey {
  return (
    typeof value === "string" &&
    (PUBLIC_THEME_KEYS as readonly string[]).includes(value)
  );
}

// Resolve any stored value to a valid theme, with a safe fallback so an
// unknown/empty/null key never crashes the public page.
export function resolvePublicTheme(value: unknown): PublicThemeMeta {
  return isPublicThemeKey(value) ? PUBLIC_THEMES[value] : PUBLIC_THEMES[DEFAULT_PUBLIC_THEME_KEY];
}

// The list of themes in canonical order (used by the admin selector).
export function listPublicThemes(): PublicThemeMeta[] {
  return PUBLIC_THEME_KEYS.map((k) => PUBLIC_THEMES[k]);
}

// -----------------------------------------------------------------------------
// Development-only preview resolution.
//
// A developer may locally render any bundled theme with `?previewTheme=<key>`.
// This resolver is PURE: nothing is ever persisted (no database, storage or
// session write) — it only decides which theme key to render for the current
// request. It is honored strictly in development; in production the tenant's
// persisted `theme_key` always wins. An absent, unknown, or malformed preview
// value falls back to the persisted theme.
// -----------------------------------------------------------------------------
export function resolveEffectiveThemeKey({
  previewTheme,
  persistedThemeKey,
  isDevelopment,
}: {
  previewTheme?: unknown;
  persistedThemeKey?: unknown;
  isDevelopment: boolean;
}): PublicThemeKey {
  const persisted: PublicThemeKey = isPublicThemeKey(persistedThemeKey)
    ? persistedThemeKey
    : DEFAULT_PUBLIC_THEME_KEY;

  if (isDevelopment && isPublicThemeKey(previewTheme)) {
    return previewTheme;
  }

  return persisted;
}

// Convert tokens to the CSS custom properties injected inline on the themed
// wrapper. Single place that maps the semantic model to CSS variables.
export function themeToCssVars(tokens: PublicThemeTokens): Record<string, string> {
  return {
    "--pt-bg-color": tokens.bgColor,
    "--pt-bg-image": tokens.bgImage,
    "--pt-surface": tokens.surface,
    "--pt-border": tokens.border,
    "--pt-text": tokens.text,
    "--pt-muted": tokens.muted,
    "--pt-accent": tokens.accent,
    "--pt-accent-2": tokens.accentSecondary,
    "--pt-number": tokens.numberColor,
    "--pt-font-display": tokens.fontDisplay,
    "--pt-status-open-bg": tokens.statusOpenBg,
    "--pt-status-open-text": tokens.statusOpenText,
    "--pt-status-closed-bg": tokens.statusClosedBg,
    "--pt-status-closed-text": tokens.statusClosedText,
  };
}
