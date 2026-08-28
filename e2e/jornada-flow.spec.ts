import { test, expect } from "@playwright/test";
import { mutationGuardReason } from "./helpers/db-guard";

test.use({ baseURL: "http://localhost:3000" });

test("jornada flow: closed -> iniciar -> atendiendo -> finalizar -> closed", async ({
  page,
}) => {
  test.skip(Boolean(mutationGuardReason()), mutationGuardReason());
  // start closed + counter 5
  // public shows Cerrado
  await page.goto("/yepes");
  await expect(page.locator("span.tabular-nums")).toHaveText("5");
  await expect(page.getByText("Cerrado").first()).toBeVisible();

  // admin: login
  await page.goto("/yepes/admin");
  await page.getByLabel("Clave de acceso").fill("Yepes2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Nuevo número")).toBeVisible();

  // admin shows Cerrado + Iniciar jornada
  await expect(page.getByText("🔴 Cerrado")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "🟢 Iniciar jornada" }),
  ).toBeVisible();

  // Iniciar jornada -> Atendiendo + Finalizar button
  await page.getByRole("button", { name: "🟢 Iniciar jornada" }).click();
  await expect(page.getByText("🟢 Atendiendo")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "🔴 Finalizar jornada" }),
  ).toBeVisible();

  // public page shows Atendiendo
  await page.goto("/yepes");
  await expect(page.getByText("Atendiendo").first()).toBeVisible();

  // counter endpoint reflects is_open true
  const data = await page.request.get("/yepes/counter");
  const json = await data.json();
  expect(json.is_open).toBe(true);
  expect(json.value).toBe(5);

  // back to admin: Finalizar -> Cerrado
  await page.goto("/yepes/admin");
  await expect(
    page.getByRole("button", { name: "🔴 Finalizar jornada" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "🔴 Finalizar jornada" }).click();
  await expect(page.getByText("🔴 Cerrado")).toBeVisible();

  const data2 = await page.request.get("/yepes/counter");
  const json2 = await data2.json();
  expect(json2.is_open).toBe(false);
});
