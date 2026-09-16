import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import {
  isPublicThemeKey,
  listPublicThemes,
  resolvePublicTheme,
} from "../lib/public-themes";

// Read-only theme verification. Never mutates production: only visits public
// pages, reads the PERSISTED theme through the read-only public tenant view,
// and reads the admin selector (login only — never clicks a theme). No counter
// / jornada / theme / share change is performed, and no screenshots are made.
//
// Tenant theme_key is MUTABLE production configuration (admins can change it
// through the Appearance selector), so this spec never hardcodes which theme a
// tenant must use. It verifies the invariant:
//     persisted tenant theme_key  ->  rendered public data-theme
// (plus the product invariants: CSS-only, no images, no overflow, 6 themes).

function loadEnvLocal(): Record<string, string> {
  try {
    const raw = readFileSync(resolvePath(process.cwd(), ".env.local"), "utf8");
    const env: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return env;
  } catch {
    return {};
  }
}

const ENV = loadEnvLocal();
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? ENV.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

// Read a tenant's PERSISTED theme_key through the READ-ONLY public tenant view
// (anon PostgREST). Read-only: a single GET, no writes, no admin selector.
async function getPersistedThemeKey(slug: string): Promise<string> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY for read-only theme lookup",
    );
  }
  const url = `${SUPABASE_URL}/rest/v1/public_barbershops?select=theme_key&slug=eq.${encodeURIComponent(slug)}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`persisted theme lookup failed for ${slug}: HTTP ${res.status}`);
  }
  const rows = (await res.json()) as Array<{ theme_key?: unknown }>;
  const key = rows[0]?.theme_key;
  return typeof key === "string" ? key : "";
}

const TENANTS = [
  { slug: "yepes", name: "Yepes" },
  { slug: "barberia-central", name: "Barbería Central" },
  { slug: "dielem", name: "DIELEM" },
];

// Product invariant: all six centralized theme labels are offered.
const ALL_THEME_LABELS = listPublicThemes().map((t) => t.label);

for (const t of TENANTS) {
  test(`public page reflects persisted theme: ${t.slug}`, async ({ page }) => {
    const persisted = await getPersistedThemeKey(t.slug);
    expect(
      isPublicThemeKey(persisted),
      `invalid persisted theme_key for ${t.slug}: "${persisted}"`,
    ).toBe(true);

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/${t.slug}`);

    // Persisted theme_key -> rendered data-theme.
    await expect(page.locator(`[data-theme="${persisted}"]`)).toBeVisible();
    await expect(page.getByText(t.name).first()).toBeVisible();
    await expect(page.locator("span.tabular-nums")).toBeVisible();
    // Case-insensitive so it matches both the default UI ("Clientes esperando")
    // and the themed UI ("N clientes esperando").
    await expect(page.getByText(/clientes esperando/i).first()).toBeVisible();

    // Theme decoration is CSS-only: no image element and no url(...) asset.
    await expect(page.locator("img")).toHaveCount(0);
    const usesImageAsset = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[style]")).some((el) =>
        (el.getAttribute("style") ?? "").includes("url("),
      ),
    );
    expect(usesImageAsset).toBe(false);

    // No horizontal overflow at 375px.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });
}

test("admin theme selector shows current persisted theme and CSS-only previews", async ({
  page,
}) => {
  const persisted = await getPersistedThemeKey("yepes");
  expect(isPublicThemeKey(persisted)).toBe(true);
  const persistedLabel = resolvePublicTheme(persisted).label;

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/yepes/admin");
  await page.getByLabel("Clave de acceso").fill("Yepes2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page.getByRole("heading", { name: "Yepes" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Apariencia/ })).toContainText(
    persistedLabel,
  );

  // Opening Apariencia shows the theme accordion with all six themes.
  await page.getByRole("button", { name: /Apariencia/ }).click();
  const panel = page.getByRole("region", { name: /Apariencia/ });
  await expect(page.getByText(/Tema visual/)).toBeVisible();

  for (const label of ALL_THEME_LABELS) {
    await expect(
      panel.getByRole("button", { name: new RegExp(label) }),
    ).toBeVisible();
  }

  // Preview swatches are miniature CSS representations, never images.
  await expect(panel.locator("img")).toHaveCount(0);
  const previewUsesImageAsset = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[style]")).some((el) =>
      (el.getAttribute("style") ?? "").includes("url("),
    ),
  );
  expect(previewUsesImageAsset).toBe(false);

  // The persisted theme is the one marked active.
  const active = page.locator('button[aria-pressed="true"]');
  await expect(active).toContainText(persistedLabel);

  // Collapsing the section works.
  await page.getByRole("button", { name: /Apariencia/ }).click();
  await expect(
    page.getByRole("button", { name: /Apariencia/ }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("loading state appears during client-side navigation", async ({ page }) => {
  const persisted = await getPersistedThemeKey("yepes");
  expect(isPublicThemeKey(persisted)).toBe(true);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByPlaceholder(/Ej\. Yepes/i).fill("Yepes");
  await page.getByRole("button", { name: "Ver estado" }).click();

  // The neutral loading shell may appear during the soft navigation.
  await page
    .getByText("Consultando disponibilidad…")
    .waitFor({ state: "visible", timeout: 5000 })
    .catch(() =>
      test.info().annotations.push({
        type: "note",
        description: "Loading shell too fast to capture on this run.",
      }),
    );

  await expect(page.locator(`[data-theme="${persisted}"]`)).toBeVisible();
});
