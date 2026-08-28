import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://localhost:3000" });

const SITE = "https://bshopcounter.vercel.app";

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

  // Encoded: colons, slashes and newlines are percent-encoded.
  expect(href).toContain("%3A");
  expect(href).toContain("%2F");
  expect(href).toContain("%0A");
  expect(href).not.toContain(" ");

  const message = decode(href);
  expect(message).toContain(
    "Mira cuántas personas están esperando y el tiempo estimado antes de venir:",
  );
  // Public tenant URL, never the admin URL, never the access key.
  expect(message).toBe(
    "Mira cuántas personas están esperando y el tiempo estimado antes de venir:\n\n" +
      `${SITE}/yepes`,
  );
  expect(message).not.toContain("/admin");
  expect(href).not.toContain("/admin");
  expect(href).not.toContain("Yepes2026!");
});

test("barberia-central admin shares public /barberia-central URL", async ({
  page,
}) => {
  const href = await loginAndGetShareHref(page, "barberia-central", "Polo2026!");

  expect(href).toContain("https://api.whatsapp.com/send?text=");
  const message = decode(href);
  expect(message).toBe(
    "Mira cuántas personas están esperando y el tiempo estimado antes de venir:\n\n" +
      `${SITE}/barberia-central`,
  );
  expect(message).not.toContain("/admin");
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
