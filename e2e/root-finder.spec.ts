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

// Read-only: navigation only. Never touches counter/jornada/theme/share/branding.
test("root finder: mobile 375px, return to root, no console/hydration errors", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });

  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(e.message));

  // 1. Root renders.
  await page.goto("/");
  await expect(page.getByPlaceholder("Ej. Yepes")).toBeVisible();

  // 2. Ver estado -> /<slug>
  await page.getByPlaceholder("Ej. Yepes").fill("Yepes");
  await page.getByRole("button", { name: "Ver estado" }).click();
  await expect(page).toHaveURL(/\/yepes$/);

  // 3. Return to root and 4. Administrar -> /<slug>/admin
  await page.goto("/");
  await page.getByPlaceholder("Ej. Yepes").fill("Yepes");
  await page.getByRole("button", { name: "Administrar" }).click();
  await expect(page).toHaveURL(/\/yepes\/admin$/);

  // 5. No hydration mismatch, no console/page errors.
  const hydration = consoleErrors.filter((e) =>
    /hydrat|did not match|server rendered|mismatch/i.test(e),
  );
  expect(hydration, `hydration errors: ${hydration.join(" | ")}`).toEqual([]);
  expect(consoleErrors, `console errors: ${consoleErrors.join(" | ")}`).toEqual(
    [],
  );
});
