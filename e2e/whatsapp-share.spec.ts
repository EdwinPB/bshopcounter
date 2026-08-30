import { test, expect } from "@playwright/test";
import { DEFAULT_SHARE_MESSAGE } from "../lib/share";

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

  // Standard WhatsApp share deep-link.
  expect(href).toContain("https://api.whatsapp.com/send?text=");

  // Encoded: colon + slashes are percent-encoded.
  expect(href).toContain("%3A");
  expect(href).toContain("%2F");
  expect(href).not.toContain(" ");

  // Message = default invitation, blank line, absolute public URL.
  const message = decode(href);
  expect(message).toBe(
    `${DEFAULT_SHARE_MESSAGE}\n\nhttps://bshopcounter.vercel.app/yepes`,
  );
  // Exactly one public URL, no /admin, no access key.
  expect(message.match(/https:\/\/bshopcounter\.vercel\.app\/yepes/g)).toHaveLength(1);
  expect(message).not.toContain("/admin");
  expect(message).not.toContain("Yepes2026!");
  expect(href).not.toContain("/admin");
});

test("barberia-central admin shares public URL (default message)", async ({
  page,
}) => {
  const href = await loginAndGetShareHref(page, "barberia-central", "Polo2026!");

  expect(href).toContain("https://api.whatsapp.com/send?text=");
  const message = decode(href);
  expect(message).toBe(
    `${DEFAULT_SHARE_MESSAGE}\n\nhttps://bshopcounter.vercel.app/barberia-central`,
  );
  expect(
    message.match(/https:\/\/bshopcounter\.vercel\.app\/barberia-central/g),
  ).toHaveLength(1);
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
  await expect(page.getByText("Compartir estado")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Personalizar mensaje" }),
  ).toBeVisible();

  // Counter controls are rendered and enabled alongside it — verified WITHOUT
  // clicking them, so no production counter is mutated.
  await expect(page.getByRole("button", { name: "Aumentar clientes" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Disminuir clientes" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Actualizar" })).toBeEnabled();
  await expect(page.locator('input[name="value"]')).toBeEnabled();
});
