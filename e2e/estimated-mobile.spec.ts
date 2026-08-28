import { test, expect } from "@playwright/test";
import { mutationGuardReason } from "./helpers/db-guard";

test.use({ baseURL: "http://localhost:3000" });

for (const bp of [
  { name: "320", w: 320, h: 640 },
  { name: "375", w: 375, h: 812 },
  { name: "tablet", w: 768, h: 1024 },
  { name: "desktop", w: 1440, h: 900 },
]) {
  test(`public estimate no overflow @ ${bp.name}`, async ({ page }) => {
    test.skip(Boolean(mutationGuardReason()), mutationGuardReason());
    await page.setViewportSize({ width: bp.w, height: bp.h });

    // ensure the shop is open so the estimate renders
    await page.goto("/yepes/admin");
    await page.getByLabel("Clave de acceso").fill("Yepes2026!");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page.getByText("Nuevo número")).toBeVisible();
    const openBtn = page.getByRole("button", { name: "🟢 Iniciar jornada" });
    if (await openBtn.isVisible().catch(() => false)) {
      await openBtn.click();
      await expect(page.getByText("🟢 Atendiendo")).toBeVisible();
    }

    await page.goto("/yepes");
    await expect(page.getByText("Tiempo estimado")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });
}
