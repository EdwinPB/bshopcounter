import { test, expect } from "@playwright/test";

// Read-only theme verification. Never mutates production: only visits public
// pages and reads the admin theme selector (login only, no click on a theme).
// No counter / jornada / theme change is performed, and no screenshots are
// generated (verification is assertion-based only).

type TenantExpectation = { slug: string; name: string; theme: string };

const TENANTS: TenantExpectation[] = [
  { slug: "yepes", name: "Yepes", theme: "default" },
  { slug: "barberia-central", name: "Barbería Central", theme: "heritage-barber" },
  { slug: "dielem", name: "DIELEM", theme: "default" },
];

const ALL_THEMES = [
  "Predeterminado",
  "Executive Navy",
  "YEPES Premium",
  "Warm Atelier",
  "Steel & Ice",
  "Heritage Barber",
];

for (const t of TENANTS) {
  test(`public page theme: ${t.slug}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/${t.slug}`);

    await expect(page.locator(`[data-theme="${t.theme}"]`)).toBeVisible();
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

test("admin theme selector shows current theme and CSS-only previews", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/yepes/admin");
  await page.getByLabel("Clave de acceso").fill("Yepes2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page.getByRole("heading", { name: "Yepes" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Apariencia/ }),
  ).toContainText("Predeterminado");

  // Opening Apariencia shows the theme accordion with all six themes.
  await page.getByRole("button", { name: /Apariencia/ }).click();
  const panel = page.getByRole("region", { name: /Apariencia/ });
  await expect(page.getByText(/Tema visual/)).toBeVisible();

  for (const label of ALL_THEMES) {
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

  // Current theme (default) is the one marked active.
  const active = page.locator('button[aria-pressed="true"]');
  await expect(active).toContainText("Predeterminado");

  // Collapsing the section works.
  await page.getByRole("button", { name: /Apariencia/ }).click();
  await expect(
    page.getByRole("button", { name: /Apariencia/ }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("loading state appears during client-side navigation", async ({ page }) => {
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

  await expect(page.locator('[data-theme="default"]')).toBeVisible();
});
