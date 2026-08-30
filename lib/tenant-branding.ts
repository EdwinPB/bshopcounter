// Raw branding as stored in barbershops.branding (jsonb). Fields optional.
export type TenantBranding = {
  theme?: "default" | "custom";
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  tagline?: string;
};

// Normalized theme used by the social/OG card. Defaults reproduce the exact
// current premium barber design so Yepes/Barbería Central are not regressed.
export type Theme = {
  kind: "default" | "custom";
  bgStart: string;
  bgEnd: string;
  text: string;
  accent: string;
  accentEmphasis: string;
  accentSecondary: string;
  brandText: string;
  tagline: string;
};

const DEFAULT_THEME: Theme = {
  kind: "default",
  bgStart: "#16283f", // NAVY
  bgEnd: "#101d30", // NAVY_DEEP
  text: "#f5f7fa", // OFFWHITE
  accent: "#b44b4b", // RED (arrow, band A, divider start)
  accentEmphasis: "#c85a5a", // RED_EMPHASIS (benefit line 2)
  accentSecondary: "#3f6ea8", // BLUE (band B, divider end)
  brandText: "#8fa3bd", // subtle brand block text
  tagline: "Barbershop Counter",
};

function isValidHex(value: unknown): value is string {
  return typeof value === "string" && /^#([0-9a-fA-F]{6})$/.test(value.trim());
}

// Lighten (pct>0) or darken (pct<0) a #rrggbb color in [-1, 1].
function shade(hex: string, pct: number): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  const target = pct < 0 ? 0 : 255;
  const p = Math.abs(pct);
  r = Math.round(r + (target - r) * p);
  g = Math.round(g + (target - g) * p);
  b = Math.round(b + (target - b) * p);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`.toUpperCase();
}

// Turn stored branding (or {} / empty) into a usable Theme. Theme "default" or
// empty branding always yields the default design; unknown/invalid colors fall
// back to defaults so a malformed value never breaks the card.
export function normalizeTheme(branding: unknown): Theme {
  if (!branding || typeof branding !== "object") return DEFAULT_THEME;
  const b = branding as TenantBranding;
  if (b.theme !== "custom") return DEFAULT_THEME;

  const bgStart = isValidHex(b.backgroundColor) ? b.backgroundColor : DEFAULT_THEME.bgStart;
  const accent = isValidHex(b.accentColor) ? b.accentColor : DEFAULT_THEME.accent;

  return {
    kind: "custom",
    bgStart,
    bgEnd: shade(bgStart, -0.25),
    text: isValidHex(b.textColor) ? b.textColor : DEFAULT_THEME.text,
    accent,
    accentEmphasis: isValidHex(b.primaryColor) ? b.primaryColor : DEFAULT_THEME.accentEmphasis,
    accentSecondary: isValidHex(b.secondaryColor)
      ? b.secondaryColor
      : DEFAULT_THEME.accentSecondary,
    brandText: shade(accent, -0.35),
    tagline: (b.tagline ?? "").trim() || DEFAULT_THEME.tagline,
  };
}
