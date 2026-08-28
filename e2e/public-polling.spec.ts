import { test, expect } from "@playwright/test";
import { mutationGuardReason } from "./helpers/db-guard";

test("public counter live-polls (5s) without page reload, tenant-isolated", async ({
  page,
  context,
}) => {
  test.skip(Boolean(mutationGuardReason()), mutationGuardReason());
  const countLocator = page.locator("span.tabular-nums");

  // 1 & 2: open /yepes, initial value rendered server-side is 5
  await page.goto("/yepes");
  await expect(page.getByText("Yepes").first()).toBeVisible();
  await expect(countLocator).toHaveText("5");

  // 6: mark this page so a full reload can be detected
  await page.evaluate(() => {
    (window as unknown as { __NO_RELOAD__?: boolean }).__NO_RELOAD__ = true;
  });

  // 3: open a second page (same browser context) and change Yepes 5 -> 6
  const adminPage = await context.newPage();
  await adminPage.goto("/yepes/admin");
  await adminPage.getByLabel("Clave de acceso").fill("Yepes2026!");
  await adminPage.getByRole("button", { name: "Ingresar" }).click();
  await expect(adminPage.getByText("Nuevo número")).toBeVisible();
  await adminPage.locator('input[name="value"]').fill("6");
  await adminPage.getByRole("button", { name: "Actualizar" }).click();

  // 5: the /yepes page (still open) updates to 6 within one polling interval
  await expect(countLocator).toHaveText("6", { timeout: 8000 });

  // 6: marker preserved -> no full reload happened on /yepes
  const marker = await page.evaluate(
    () => (window as unknown as { __NO_RELOAD__?: boolean }).__NO_RELOAD__,
  );
  expect(marker).toBe(true);

  // 7: /barberia-central remains isolated, still shows its own value
  const centralPage = await context.newPage();
  await centralPage.goto("/barberia-central");
  const centralLocator = centralPage.locator("span.tabular-nums");
  await expect(centralLocator).toHaveText("7");
});
