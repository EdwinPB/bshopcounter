import { strict as assert } from "node:assert";
import {
  PUBLIC_THEME_KEYS,
  resolveEffectiveThemeKey,
} from "../lib/public-themes.ts";

// A persisted tenant theme that is NOT the default, so a passing preview
// assertion cannot be confused with the default fallback.
const PERSISTED = "heritage-barber";

// 1. Valid preview works in development (all 6 keys).
for (const key of PUBLIC_THEME_KEYS) {
  assert.equal(
    resolveEffectiveThemeKey({
      previewTheme: key,
      persistedThemeKey: PERSISTED,
      isDevelopment: true,
    }),
    key,
  );
}

// 2. Invalid / malformed preview values use the persisted theme.
for (const bad of ["bogus", "", "  ", 42, null, undefined, ["yepes-premium"], {}]) {
  assert.equal(
    resolveEffectiveThemeKey({
      previewTheme: bad,
      persistedThemeKey: PERSISTED,
      isDevelopment: true,
    }),
    PERSISTED,
    `preview ${JSON.stringify(bad)} should fall back to persisted`,
  );
}

// 3. Absent preview uses the persisted theme.
assert.equal(
  resolveEffectiveThemeKey({ persistedThemeKey: PERSISTED, isDevelopment: true }),
  PERSISTED,
);

// 4. Production ignores previewTheme entirely (uses persisted theme_key).
assert.equal(
  resolveEffectiveThemeKey({
    previewTheme: "yepes-premium",
    persistedThemeKey: PERSISTED,
    isDevelopment: false,
  }),
  PERSISTED,
);
assert.equal(
  resolveEffectiveThemeKey({
    previewTheme: "steel-ice",
    persistedThemeKey: "default",
    isDevelopment: false,
  }),
  "default",
);
// Production + invalid persisted key still resolves to the safe default.
assert.equal(
  resolveEffectiveThemeKey({
    previewTheme: "yepes-premium",
    persistedThemeKey: "bogus",
    isDevelopment: false,
  }),
  "default",
);
assert.equal(
  resolveEffectiveThemeKey({
    previewTheme: "yepes-premium",
    persistedThemeKey: undefined,
    isDevelopment: false,
  }),
  "default",
);

// 5. No database mutation: the resolver itself is pure and never references any
// persistence or network primitive (inspect its actual source).
const resolverSrc = resolveEffectiveThemeKey.toString();
for (const forbidden of [
  "supabase",
  "updateTenantTheme",
  "createServerSupabaseClient",
  "fetch(",
  "localStorage",
  "document.cookie",
  "cookies(",
]) {
  assert.equal(
    resolverSrc.toLowerCase().includes(forbidden.toLowerCase()),
    false,
    `resolveEffectiveThemeKey must not reference "${forbidden}"`,
  );
}

console.log("theme-preview: all assertions passed");
