import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://localhost:3000" });

async function loginAndGetShareHref(
  page: import("@playwright/test").Page,
  slug: string,
  key: string,
) {
  await page.goto(`/${slug}/admin`);
  await page.getByLabel("Clave de acceso").fill(key);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Nuevo número")).toBeVisible();
  const wa = page.locator('a[aria-label="Compartir en WhatsApp"]');
  await expect(wa).toBeVisible();
  return (await wa.getAttribute("href")) ?? "";
}

function decode(href: string) {
  return decodeURIComponent((href.split("?text=")[1] ?? "").replace(/\+/g, " "));
}

test("yepes admin shares public /yepes URL, never /admin", async ({ page }) => {
  const href = await loginAndGetShareHref(page, "yepes", "Yepes2026!");

  // Standard WhatsApp share deep-link, open in new window.
  expect(href).toContain("https://api.whatsapp.com/send?text=");

  // Encoded: colon + slashes are percent-encoded.
  expect(href).toContain("%3A");
  expect(href).toContain("%2F");
  expect(href).not.toContain(" ");

  // Exactly the absolute public URL — no explanatory message precedes it.
  const message = decode(href);
  expect(message).toBe(`https://bshopcounter.vercel.app/yepes`);
  expect(message).toMatch(/^https:\/\//);
  expect(message).not.toContain("/admin");
  expect(message).not.toContain("Mira cuántas");
  expect(href).not.toContain("/admin");
  expect(href).not.toContain("Yepes2026!");
});

test("barberia-central admin shares absolute public URL", async ({ page }) => {
  const href = await loginAndGetShareHref(page, "barberia-central", "Polo2026!");

  expect(href).toContain("https://api.whatsapp.com/send?text=");
  const message = decode(href);
  expect(message).toBe(`https://bshopcounter.vercel.app/barberia-central`);
  expect(message).toMatch(/^https:\/\//);
  expect(message).not.toContain("/admin");
  expect(message).not.toContain("Mira cuántas");
  expect(href).not.toContain("/admin");
});

test("share button is a secondary action alongside counter controls", async ({
  page,
}) => {
  await page.goto("/yepes/admin");
  await page.getByLabel("Clave de acceso").fill("Yepes2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Nuevo número")).toBeVisible();

  // WhatsApp button present and secondary (below the counter area).
  const wa = page.locator('a[aria-label="Compartir en WhatsApp"]');
  await expect(wa).toBeVisible();

  // Counter controls are rendered and enabled alongside it — verified WITHOUT
  // clicking them, so no production counter is mutated.
  await expect(page.getByRole("button", { name: "Aumentar clientes" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Disminuir clientes" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Actualizar" })).toBeEnabled();
  await expect(page.locator('input[name="value"]')).toBeEnabled();
});
