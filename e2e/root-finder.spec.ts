import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://localhost:3000" });

test("root finder: Yepes -> Ver estado navigates to /yepes", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByPlaceholder("Ej. Yepes").fill("Yepes");
  await page.getByRole("button", { name: "Ver estado" }).click();
  await expect(page).toHaveURL(/\/yepes$/);
});

test("root finder: Yepes -> Administrar navigates to /yepes/admin", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByPlaceholder("Ej. Yepes").fill("Yepes");
  await page.getByRole("button", { name: "Administrar" }).click();
  await expect(page).toHaveURL(/\/yepes\/admin$/);
  await expect(page.getByLabel("Clave de acceso")).toBeVisible();
});

test("root finder: Barbería Central -> Ver estado navigates to /barberia-central", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByPlaceholder("Ej. Yepes").fill("Barbería Central");
  await page.getByRole("button", { name: "Ver estado" }).click();
  await expect(page).toHaveURL(/\/barberia-central$/);
});

test("root finder: unknown name shows friendly error, no navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByPlaceholder("Ej. Yepes").fill("Peluquería Inexistente");
  await page.getByRole("button", { name: "Ver estado" }).click();
  await expect(page.getByText("No encontramos esa barbería.")).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test("root finder: empty input shows validation, no navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByPlaceholder("Ej. Yepes").fill("");
  await page.getByRole("button", { name: "Ver estado" }).click();
  await expect(
    page.getByText("Ingresá el nombre de la barbería."),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test("root finder: Enter key defaults to Ver estado", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Ej. Yepes").fill("Yepes");
  await page.getByPlaceholder("Ej. Yepes").press("Enter");
  await expect(page).toHaveURL(/\/yepes$/);
});
