// Open Graph / WhatsApp preview theme adapter.
//
// Derives OG-safe (Satori / next/og ImageResponse) values from the SINGLE source
// of truth — lib/public-themes.ts — so the shared preview card shares each
// tenant theme's identity without a second, duplicated palette.
//
// Satori does NOT support repeating-linear-gradient, CSS variables, masks or
// pseudo-elements, so this adapter exposes only flat colors + a simple two-stop
// gradient and a `decorStyle` flag that components/social/SocialCard.tsx maps to
// explicit positioned elements.

import {
  DEFAULT_PUBLIC_THEME_KEY,
  PUBLIC_THEMES,
  isPublicThemeKey,
  type PublicThemeDecor,
  type PublicThemeKey,
} from "./public-themes.ts";

export type SocialTheme = {
  key: PublicThemeKey;
  bgStart: string;
  bgEnd: string;
  dark: boolean;
  text: string;
  muted: string;
  accent: string;
  accentSecondary: string;
  nameColor: string;
  border: string;
  decorStyle: PublicThemeDecor;
};

function clampChannel(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// pct in [-1, 1]: negative darkens toward black, positive lightens toward white.
export function shadeHex(hex: string, pct: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const target = pct < 0 ? 0 : 255;
  const p = Math.min(1, Math.abs(pct));
  const r = clampChannel(rgb.r + (target - rgb.r) * p);
  const g = clampChannel(rgb.g + (target - rgb.g) * p);
  const b = clampChannel(rgb.b + (target - rgb.b) * p);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

// Perceived brightness (0 = black, 1 = white) — decides gradient direction.
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(rgb.r) + 0.7152 * f(rgb.g) + 0.0722 * f(rgb.b);
}

// Resolve a tenant's persisted theme_key into OG-safe values. Unknown/null keys
// fall back to the default theme, so a malformed value never breaks the image.
export function getSocialTheme(themeKey: unknown): SocialTheme {
  const meta = isPublicThemeKey(themeKey)
    ? PUBLIC_THEMES[themeKey]
    : PUBLIC_THEMES[DEFAULT_PUBLIC_THEME_KEY];
  const t = meta.tokens;
  const dark = relativeLuminance(t.bgColor) < 0.4;

  return {
    key: meta.key,
    bgStart: t.bgColor,
    // Slightly lifted for dark themes, slightly deepened for light themes.
    bgEnd: shadeHex(t.bgColor, dark ? 0.12 : -0.07),
    dark,
    text: t.text,
    muted: t.muted,
    accent: t.accent,
    accentSecondary: t.accentSecondary,
    nameColor: t.numberColor,
    border: t.border,
    decorStyle: t.decorStyle,
  };
}
