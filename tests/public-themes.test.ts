import { strict as assert } from "node:assert";
import {
  BARBER_POLE_BG_COLOR,
  BARBER_POLE_BG_IMAGE,
  PUBLIC_THEME_KEYS,
  DEFAULT_PUBLIC_THEME_KEY,
  isPublicThemeKey,
  listPublicThemes,
  resolvePublicTheme,
  themeToCssVars,
} from "../lib/public-themes.ts";

const DECOR_STYLES = [
  "none",
  "executive-geometry",
  "gold-luxury",
  "atelier",
  "technical-grid",
  "heritage-stripes",
];

// `default` is the product fallback and must be a valid, resolvable theme.
assert.equal(DEFAULT_PUBLIC_THEME_KEY, "default");
assert.equal(isPublicThemeKey("default"), true);

const dflt = resolvePublicTheme("default");
assert.equal(dflt.key, "default");
assert.equal(dflt.label, "Predeterminado");
assert.equal(dflt.description, "Diseño original de la aplicación.");
assert.equal(dflt.tokens.bgColor, "#ffffff");
assert.equal(dflt.tokens.text, "#171717");
assert.equal(dflt.tokens.accent, "#c94b4b");
assert.equal(dflt.tokens.accentSecondary, "#3a6fb0");
assert.equal(dflt.tokens.numberColor, "#0a0a0a");
assert.equal(dflt.tokens.decorStyle, "none");

// Valid theme resolution.
const naval = resolvePublicTheme("executive-navy");
assert.equal(naval.key, "executive-navy");
assert.equal(naval.label, "Executive Navy");
assert.equal(naval.tokens.bgColor, "#071A2B");
assert.equal(naval.tokens.text, "#F8FAFC");
assert.equal(naval.tokens.accent, "#D2B16A");
assert.equal(naval.tokens.accentSecondary, "#6B93BF");
assert.equal(naval.tokens.decorStyle, "executive-geometry");

const yepes = resolvePublicTheme("yepes-premium");
assert.equal(yepes.key, "yepes-premium");
assert.equal(yepes.label, "YEPES Premium");
assert.equal(yepes.tokens.bgColor, "#0B0B0B");
assert.equal(yepes.tokens.accent, "#D4AF37");
assert.equal(yepes.tokens.decorStyle, "gold-luxury");

const atelier = resolvePublicTheme("warm-atelier");
assert.equal(atelier.tokens.bgColor, "#F4EFE6");
assert.equal(atelier.tokens.decorStyle, "atelier");

const steel = resolvePublicTheme("steel-ice");
assert.equal(steel.tokens.accent, "#69BEE8");
assert.equal(steel.tokens.decorStyle, "technical-grid");

const heritage = resolvePublicTheme("heritage-barber");
assert.equal(heritage.tokens.bgColor, "#F7F3EA");
assert.equal(heritage.tokens.accent, "#A43B47");
assert.equal(heritage.tokens.accentSecondary, "#10283D");
assert.equal(heritage.tokens.decorStyle, "heritage-stripes");

// Invalid / unknown / empty / null -> safe default fallback.
assert.equal(resolvePublicTheme("bogus").key, DEFAULT_PUBLIC_THEME_KEY);
assert.equal(resolvePublicTheme("").key, DEFAULT_PUBLIC_THEME_KEY);
assert.equal(resolvePublicTheme(null).key, DEFAULT_PUBLIC_THEME_KEY);
assert.equal(resolvePublicTheme(undefined).key, DEFAULT_PUBLIC_THEME_KEY);
assert.equal(resolvePublicTheme(42).key, DEFAULT_PUBLIC_THEME_KEY);

// Theme key validation.
for (const key of PUBLIC_THEME_KEYS) {
  assert.equal(isPublicThemeKey(key), true);
}
assert.equal(isPublicThemeKey("junk-theme"), false);
assert.equal(isPublicThemeKey(""), false);
assert.equal(isPublicThemeKey(123), false);
assert.equal(isPublicThemeKey(null), false);

// Metadata: exactly the 6 curated themes, canonical order (default first),
// complete semantic tokens.
const all = listPublicThemes();
assert.equal(all.length, PUBLIC_THEME_KEYS.length);
assert.equal(all.length, 6);
assert.deepEqual(
  all.map((t) => t.key),
  [...PUBLIC_THEME_KEYS],
);
assert.equal(all[0].key, "default");
for (const t of all) {
  assert.ok(t.label.length > 0);
  assert.ok(t.description.length > 0);
  assert.match(t.tokens.bgColor, /^#[0-9a-fA-F]{6}$/);
  assert.match(t.tokens.text, /^#[0-9a-fA-F]{6}$/);
  assert.match(t.tokens.accent, /^#[0-9a-fA-F]{6}$/);
  assert.equal(typeof t.tokens.bgImage, "string");
  assert.ok(t.tokens.bgImage.length > 0);
  assert.ok(DECOR_STYLES.includes(t.tokens.decorStyle));
  // Status is always paired with a label in the UI, so these must be colors.
  assert.match(t.tokens.statusOpenBg, /rgba|^#/);
  assert.match(t.tokens.statusOpenText, /^#/);
  assert.match(t.tokens.statusClosedText, /^#/);
}

// CSS-only guarantee: no theme may depend on an image/SVG asset.
for (const t of all) {
  const serialized = JSON.stringify(t.tokens);
  assert.equal(serialized.includes("url("), false, `${t.key} must not use url()`);
  assert.equal(/\.(png|jpe?g|webp|gif|svg)\b/i.test(serialized), false, `${t.key} must not reference an image file`);
  // Backgrounds are generated from gradients, not flat colors alone.
  assert.ok(t.tokens.bgImage.includes("gradient"), `${t.key} background must be a CSS gradient`);
}

// The shared default-theme barber-pole artwork is pure CSS too.
assert.equal(BARBER_POLE_BG_COLOR, "#ffffff");
assert.ok(BARBER_POLE_BG_IMAGE.includes("repeating-linear-gradient"));
assert.ok(BARBER_POLE_BG_IMAGE.includes("radial-gradient"));
assert.equal(BARBER_POLE_BG_IMAGE.includes("url("), false);

// CSS vars injection produces every consumed token (new semantic names).
const vars = themeToCssVars(naval.tokens);
assert.equal(vars["--pt-bg-color"], "#071A2B");
assert.equal(vars["--pt-text"], "#F8FAFC");
assert.equal(vars["--pt-number"], "#F8FAFC");
assert.equal(vars["--pt-accent-2"], "#6B93BF");
assert.ok(vars["--pt-bg-image"].includes("gradient"));
assert.ok("--pt-font-display" in vars);
assert.ok("--pt-status-open-bg" in vars);
assert.ok("--pt-surface" in vars);
assert.ok("--pt-border" in vars);

console.log("public-themes: all assertions passed");
