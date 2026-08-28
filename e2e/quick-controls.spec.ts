import { test, expect } from "@playwright/test";
import { mutationGuardReason } from "./helpers/db-guard";

test.use({ baseURL: "http://localhost:3000" });

const NOWAIT_BUTTONS = 8000;

test("quick +/- controls update counter, sync input & estimate, persist, poll", async ({
  page,
  context,
  request,
}) => {
  test.skip(Boolean(mutationGuardReason()), mutationGuardReason());
  // 0. Login as Yepes admin.
  await page.goto("/yepes/admin");
  await page.getByLabel("Clave de acceso").fill("Yepes2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Nuevo número")).toBeVisible();

  // Quick buttons are present with accessible labels.
  const inc = page.getByRole("button", { name: "Aumentar clientes" });
  const dec = page.getByRole("button", { name: "Disminuir clientes" });
  await expect(inc).toBeVisible();
  await expect(dec).toBeVisible();

  // Ensure jornada open so the public page shows the estimate.
  const data0 = await request.get("/yepes/counter");
  if (!(await data0.json()).is_open) {
    await page.getByRole("button", { name: "🟢 Iniciar jornada" }).click();
    await expect(page.getByText("🟢 Atendiendo")).toBeVisible();
  }

  // 1. Manual set to 3 (baseline) -> count + estimate.
  await page.locator('input[name="value"]').fill("3");
  await page.getByRole("button", { name: "Actualizar" }).click();
  await expect(page.locator('div[aria-live="polite"]')).toHaveText("3");
  await expect(page.getByText("1 hora y 30 min")).toBeVisible();

  const input = page.locator('input[name="value"]');

  // 2. Public page renders 3; then quick updates must propagate via polling.
  const pub = await context.newPage();
  await pub.goto("/yepes");
  await expect(pub.locator("span.tabular-nums")).toHaveText("3");

  // 3. Tap ▲ -> 4, estimate 2 horas.
  await inc.click();
  await expect(page.locator('div[aria-live="polite"]')).toHaveText("4");
  await expect(page.getByText("2 horas")).toBeVisible();
  await expect(input).toHaveValue("4");

  // 4. Public page picks up 4 through existing 5s polling (no reload).
  await expect(pub.locator("span.tabular-nums")).toHaveText("4", {
    timeout: NOWAIT_BUTTONS,
  });
  await expect(pub.getByText("2 horas")).toBeVisible();

  // 5. Tap ▲ -> 5.
  await inc.click();
  await expect(page.locator('div[aria-live="polite"]')).toHaveText("5");
  await expect(input).toHaveValue("5");

  // 6. Tap ▼ -> 4.
  await dec.click();
  await expect(page.locator('div[aria-live="polite"]')).toHaveText("4");
  await expect(input).toHaveValue("4");

  // 7. Manual input still works: 3 -> 10.
  await page.locator('input[name="value"]').fill("10");
  await page.getByRole("button", { name: "Actualizar" }).click();
  await expect(page.locator('div[aria-live="polite"]')).toHaveText("10");

  // 8. Manual input still works: set to 0.
  await page.locator('input[name="value"]').fill("0");
  await page.getByRole("button", { name: "Actualizar" }).click();
  await expect(page.locator('div[aria-live="polite"]')).toHaveText("0");
  await expect(page.getByText("Sin espera")).toBeVisible();

  // 9. ▼ at 0 remains 0.
  await dec.click();
  await expect(page.locator('div[aria-live="polite"]')).toHaveText("0");

  // 10. Persisted value matches confirmed result (DB).
  const persisted = await request.get("/yepes/counter");
  expect((await persisted.json()).value).toBe(0);

  // Restore shared baseline: counter 5, jornada closed.
  await page.locator('input[name="value"]').fill("5");
  await page.getByRole("button", { name: "Actualizar" }).click();
  await expect(page.locator('div[aria-live="polite"]')).toHaveText("5");
  const after = await request.get("/yepes/counter");
  if ((await after.json()).is_open) {
    await page.getByRole("button", { name: "🔴 Finalizar jornada" }).click();
    await expect(page.getByText("🔴 Cerrado")).toBeVisible();
  }
});

test("anonymous user cannot quick-update (no session)", async ({ page }) => {
  await page.goto("/yepes/admin");
  // No session -> redirected to login form, no quick buttons.
  await expect(page.getByLabel("Clave de acceso")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Aumentar clientes" }),
  ).toHaveCount(0);
});

test("quick controls do not overflow at mobile viewports", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/yepes/admin");
  await page.getByLabel("Clave de acceso").fill("Yepes2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Nuevo número")).toBeVisible();

  for (const width of [320, 375, 414]) {
    await page.setViewportSize({ width, height: 800 });
    await expect(
      page.getByRole("button", { name: "Aumentar clientes" }),
    ).toBeVisible();

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  }

  // Mobile touch targets >= 48px.
  const box = await page
    .getByRole("button", { name: "Aumentar clientes" })
    .boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(48);
  expect(box!.height).toBeGreaterThanOrEqual(48);
});
