import { test, expect } from "@playwright/test";
import { mutationGuardReason } from "./helpers/db-guard";

const BASE = "http://localhost:3000";

test.use({ baseURL: BASE });

test("Yepes admin flow end to end", async ({ page }) => {
  test.skip(Boolean(mutationGuardReason()), mutationGuardReason());
  // 1. /yepes shows Yepes with a server-rendered counter value
  await page.goto("/yepes");
  await expect(page.getByText("Yepes").first()).toBeVisible();
  await expect(page.locator("span.tabular-nums")).toBeVisible();

  // 2. /yepes/admin asks for access key
  await page.goto("/yepes/admin");
  await expect(page.getByText("Yepes").first()).toBeVisible();
  await expect(page.getByLabel("Clave de acceso")).toBeVisible();
  await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();

  // 6. Wrong key -> authentication rejected
  await page.getByLabel("Clave de acceso").fill("WRONG_KEY");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Clave incorrecta.")).toBeVisible();

  // 3. Correct key -> authenticated admin UI
  await page.getByLabel("Clave de acceso").fill("Yepes2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(
    page.getByRole("heading", { name: "Yepes" }),
  ).toBeVisible();
  await expect(page.getByText("Clientes actualmente esperando")).toBeVisible();
  await expect(page.getByText("Nuevo número")).toBeVisible();
  await expect(page.getByRole("button", { name: "Actualizar" })).toBeVisible();

  // 4. Set counter to an arbitrary value (initial + 1, or 1 to track state)
  const target = 1;
  await page.locator('input[name="value"]').fill(String(target));
  await page.getByRole("button", { name: "Actualizar" }).click();
  // after revalidate, current count shows target
  await expect(
    page.getByText(String(target), { exact: true }).last(),
  ).toBeVisible();

  // 5. /yepes shows target
  await page.goto("/yepes");
  await expect(page.getByText(String(target), { exact: true }).last()).toBeVisible();

  // 7. Logout -> admin access removed
  await page.goto("/yepes/admin");
  await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  // logout() redirects to home; confirm we left the admin page and session cleared
  await expect(page).toHaveURL("/");
  // returning to admin shows the access key form again
  await page.goto("/yepes/admin");
  await expect(page.getByLabel("Clave de acceso")).toBeVisible();
  await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();

  // 8. Try /barberia-central/admin using a Yepes-authenticated session
  await page.goto("/yepes/admin");
  await page.getByLabel("Clave de acceso").fill("Yepes2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Nuevo número")).toBeVisible(); // authed as yepes
  // now attempt to access barberia-central admin with this yepes session
  await page.goto("/barberia-central/admin");
  // must NOT be authorized -> shows access key form (LoginForm), not the counter UI
  await expect(page.getByLabel("Clave de acceso")).toBeVisible();
  await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
  // ensure NO counter mutation controls are shown for central
  await expect(page.getByText("Nuevo número")).toHaveCount(0);
});
