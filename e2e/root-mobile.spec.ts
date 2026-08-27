import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://localhost:3000" });

for (const bp of [
  { name: "320", w: 320, h: 640 },
  { name: "375", w: 375, h: 812 },
]) {
  test(`root finder no overflow @ ${bp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: bp.w, height: bp.h });
    await page.goto("/");
    await expect(page.getByPlaceholder("Ej. Yepes")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
    await page.screenshot({ path: `test-results/root-${bp.name}.png` });
  });
}
