import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://localhost:3000" });

const KEY = "preferredAdminPath";

// Seed localStorage on a real initial page so redirect logic on later
// navigations observes it, and login flows aren't clobbered by init scripts.
async function setPrefOnce(
  page: import("@playwright/test").Page,
  value: string | null,
) {
  await page.goto("/");
  await page.evaluate(([k, v]) => {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  }, [KEY, value] as const);
}

async function storedPref(page: import("@playwright/test").Page) {
  return page.evaluate(() => localStorage.getItem("preferredAdminPath"));
}

test("1. No stored preference: / remains the normal root page", async ({
  page,
}) => {
  await setPrefOnce(page, null);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Barbershop Counter" })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test("2. Stored /yepes/admin -> / navigates to /yepes/admin", async ({
  page,
}) => {
  await setPrefOnce(page, "/yepes/admin");
  await page.goto("/");
  await expect(page).toHaveURL(/\/yepes\/admin$/);
  await expect(page.getByLabel("Clave de acceso")).toBeVisible();
});

test("3. Expired/no session: remembered route opens /yepes/admin -> access-key screen", async ({
  page,
}) => {
  await setPrefOnce(page, "/yepes/admin");
  await page.goto("/barberia-central/admin"); // ensure no yepes session
  await page.goto("/");
  await expect(page).toHaveURL(/\/yepes\/admin$/);
  await expect(page.getByLabel("Clave de acceso")).toBeVisible();
});

test("4. Successful login at /yepes/admin saves preference", async ({
  page,
}) => {
  await setPrefOnce(page, null);
  await page.goto("/yepes/admin");
  await page.getByLabel("Clave de acceso").fill("Yepes2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Nuevo número")).toBeVisible();

  expect(await storedPref(page)).toBe("/yepes/admin");
});

test("5. Successful login at /barberia-central/admin replaces preference", async ({
  page,
}) => {
  await setPrefOnce(page, "/yepes/admin");
  await page.goto("/barberia-central/admin");
  await page.getByLabel("Clave de acceso").fill("Polo2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Nuevo número")).toBeVisible();

  expect(await storedPref(page)).toBe("/barberia-central/admin");
});

test("6. Malicious https://evil.example ignored", async ({ page }) => {
  await setPrefOnce(page, "https://evil.example");
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: "Barbershop Counter" }),
  ).toBeVisible();
});

test("7. Malicious //evil.example ignored", async ({ page }) => {
  await setPrefOnce(page, "//evil.example");
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: "Barbershop Counter" }),
  ).toBeVisible();
});

test("8. Arbitrary internal /something-else ignored", async ({ page }) => {
  await setPrefOnce(page, "/something-else");
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: "Barbershop Counter" }),
  ).toBeVisible();
});
