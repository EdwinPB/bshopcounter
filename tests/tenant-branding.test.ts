import { strict as assert } from "node:assert";
import { normalizeTheme } from "../lib/tenant-branding.ts";

// Empty / {} / non-custom -> default theme (no visual regression).
const def = normalizeTheme({});
assert.equal(def.kind, "default");
assert.equal(def.bgStart, "#16283f");
assert.equal(def.bgEnd, "#101d30");
assert.equal(def.text, "#f5f7fa");
assert.equal(def.accent, "#b44b4b");
assert.equal(def.accentEmphasis, "#c85a5a");
assert.equal(def.accentSecondary, "#3f6ea8");
assert.equal(def.tagline, "Barbershop Counter");

// Null / malformed -> default.
assert.equal(normalizeTheme(null).kind, "default");
assert.equal(normalizeTheme("nope").kind, "default");

// Custom theme maps provided colors.
const custom = normalizeTheme({
  theme: "custom",
  primaryColor: "#e0bf78",
  secondaryColor: "#efe7d3",
  accentColor: "#c9a24b",
  backgroundColor: "#101010",
  textColor: "#f2ead8",
  tagline: "BARBERÍA PREMIUM",
});
assert.equal(custom.kind, "custom");
assert.equal(custom.bgStart, "#101010");
assert.equal(custom.text, "#f2ead8");
assert.equal(custom.accent, "#c9a24b");
assert.equal(custom.accentEmphasis, "#e0bf78");
assert.equal(custom.accentSecondary, "#efe7d3");
assert.equal(custom.bgEnd.startsWith("#"), true);
assert.notEqual(custom.bgStart, custom.bgEnd);

// Invalid color falls back to default without throwing.
const fallback = normalizeTheme({
  theme: "custom",
  accentColor: "not-a-color",
  backgroundColor: "",
});
assert.equal(fallback.accent, "#b44b4b");

console.log("tenant-branding: all assertions passed");
