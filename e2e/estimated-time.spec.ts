import { test, expect } from "@playwright/test";
import { mutationGuardReason } from "./helpers/db-guard";

test.use({ baseURL: "http://localhost:3000" });

test("estimated waiting time updates via admin + polling, isolated", async ({
  page,
  request,
}) => {
  test.skip(Boolean(mutationGuardReason()), mutationGuardReason());
  // 1. Open /yepes
  await page.goto("/yepes");

  // login as admin, set counter to 3
  await page.goto("/yepes/admin");
  await page.getByLabel("Clave de acceso").fill("Yepes2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Nuevo número")).toBeVisible();

  // begin jornada (so estimate is shown as attending)
  const data0 = await request.get("/yepes/counter");
  const json0 = await data0.json();
  if (!json0.is_open) {
    await page.getByRole("button", { name: "🟢 Iniciar jornada" }).click();
    await expect(page.getByText("🟢 Atendiendo")).toBeVisible();
  }

  // 2. Set counter to 3
  await page.locator('input[name="value"]').fill("3");
  await page.getByRole("button", { name: "Actualizar" }).click();
  // admin shows estimate
  await expect(page.getByText("1 hora y 30 min")).toBeVisible();

  // 3. public page displays 3 and estimate
  await page.goto("/yepes");
  await expect(page.getByText("3", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("1 hora y 30 min")).toBeVisible();

  // 4. Change counter to 1
  await page.goto("/yepes/admin");
  await page.locator('input[name="value"]').fill("1");
  await page.getByRole("button", { name: "Actualizar" }).click();
  await expect(page.getByText("30 min")).toBeVisible();

  // 5. polling updates the estimate on public page to 30 min
  await page.goto("/yepes");
  await expect(page.getByText("30 min")).toBeVisible({ timeout: 8000 });

  // 6. jornada status still works
  const data = await request.get("/yepes/counter");
  const json = await data.json();
  expect(typeof json.is_open).toBe("boolean");
  expect(json.estimatedMinutes).toBe(30);

  // 7. Barbería Central isolated
  const central = await request.get("/barberia-central/counter");
  const jsonCentral = await central.json();
  // central must be unaffected by yepes changes
  expect(jsonCentral.value).not.toBe(1);
  // yepes was set to 1; ensure it's not bleeding into central
  expect(jsonCentral.value).toBeGreaterThanOrEqual(0);

  // restore clean shared state: counter=5, close jornada
  await page.goto("/yepes/admin");
  const afterCtl = await request.get("/yepes/counter");
  if ((await afterCtl.json()).is_open) {
    await page.getByRole("button", { name: "🔴 Finalizar jornada" }).click();
    await expect(page.getByText("🔴 Cerrado")).toBeVisible();
  }
  await page.locator('input[name="value"]').fill("5");
  await page.getByRole("button", { name: "Actualizar" }).click();
  await expect(page.getByText("Clientes actualmente esperando")).toBeVisible();
});
