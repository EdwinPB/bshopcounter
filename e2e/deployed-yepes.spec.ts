import { test, expect } from "@playwright/test";

test.use({ baseURL: "https://bshopcounter.vercel.app" });

test("deployed: yepes login + counter update", async ({ page }) => {
  await page.goto("/yepes");
  await expect(page.locator("span.tabular-nums")).toHaveText("5");

  await page.goto("/yepes/admin");
  await page.getByLabel("Clave de acceso").fill("Yepes2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Nuevo número")).toBeVisible();

  await page.locator('input[name="value"]').fill("5");
  await page.getByRole("button", { name: "Actualizar" }).click();
  await expect(page.getByText("Clientes actualmente esperando")).toBeVisible();

  await page.goto("/yepes");
  await expect(page.locator("span.tabular-nums")).toHaveText("5");
});
