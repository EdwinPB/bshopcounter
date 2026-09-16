import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getSocialTheme, shadeHex, relativeLuminance } from "../lib/social-share.ts";
import { PUBLIC_THEMES, PUBLIC_THEME_KEYS } from "../lib/public-themes.ts";

const read = (rel: string) =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

// ---- All six theme keys resolve; invalid/null -> default ----
for (const key of PUBLIC_THEME_KEYS) {
  const t = getSocialTheme(key);
  assert.equal(t.key, key);
  // Derived from the single source of truth (no duplicated palette).
  assert.equal(t.bgStart, PUBLIC_THEMES[key].tokens.bgColor);
  assert.equal(t.accent, PUBLIC_THEMES[key].tokens.accent);
  assert.equal(t.accentSecondary, PUBLIC_THEMES[key].tokens.accentSecondary);
  assert.equal(t.nameColor, PUBLIC_THEMES[key].tokens.numberColor);
  assert.equal(t.decorStyle, PUBLIC_THEMES[key].tokens.decorStyle);
}

assert.equal(getSocialTheme("bogus").key, "default");
assert.equal(getSocialTheme("").key, "default");
assert.equal(getSocialTheme(null).key, "default");
assert.equal(getSocialTheme(undefined).key, "default");
assert.equal(getSocialTheme(42).key, "default");

// ---- OG-safe values (Satori): no unsupported CSS constructs ----
const FORBIDDEN = [
  "url(",
  "repeating-linear-gradient",
  "var(",
  "::",
  "mask",
  "backdrop-filter",
  "conic-gradient",
];
for (const key of PUBLIC_THEME_KEYS) {
  const serialized = JSON.stringify(getSocialTheme(key)).toLowerCase();
  for (const bad of FORBIDDEN) {
    assert.equal(
      serialized.includes(bad),
      false,
      `social theme "${key}" must not contain "${bad}"`,
    );
  }
}

// ---- Basic sanity of derived values ----
for (const key of PUBLIC_THEME_KEYS) {
  const t = getSocialTheme(key);
  assert.match(t.bgStart, /^#[0-9a-fA-F]{6}$/);
  assert.match(t.bgEnd, /^#[0-9a-fA-F]{6}$/);
  assert.match(t.text, /^#[0-9a-fA-F]{6}$/);
  assert.match(t.accent, /^#[0-9a-fA-F]{6}$/);
  assert.equal(typeof t.dark, "boolean");
  assert.notEqual(t.bgStart, t.bgEnd);
}

// Dark/light classification matches the themes' intent.
assert.equal(getSocialTheme("yepes-premium").dark, true);
assert.equal(getSocialTheme("executive-navy").dark, true);
assert.equal(getSocialTheme("steel-ice").dark, true);
assert.equal(getSocialTheme("default").dark, false);
assert.equal(getSocialTheme("warm-atelier").dark, false);
assert.equal(getSocialTheme("heritage-barber").dark, false);

// Helpers behave.
assert.ok(relativeLuminance("#ffffff") > relativeLuminance("#000000"));
assert.equal(shadeHex("#000000", 0), "#000000");
assert.equal(shadeHex("#ffffff", 0), "#FFFFFF");

// ---- Social metadata must never depend on the dev-only preview ----
for (const rel of [
  "../lib/social-share.ts",
  "../app/[barbershopSlug]/opengraph-image.tsx",
  "../app/[barbershopSlug]/twitter-image.tsx",
]) {
  const src = read(rel);
  assert.equal(src.includes("previewTheme"), false, `${rel} must ignore previewTheme`);
  assert.equal(src.includes("searchParams"), false, `${rel} must not read searchParams`);
}

console.log("social-share: all assertions passed");
