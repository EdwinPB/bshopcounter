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
  await expect(page.getByText("Clientes actualmente esperando")).toBeVisible();
  // Expand the Compartir accordion row to reveal the WhatsApp button.
  await page.getByRole("button", { name: /Compartir/ }).click();
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

test("Compartir shares from inside its accordion row", async ({
  page,
  context,
}) => {
  await page.goto("/yepes/admin");
  await page.getByLabel("Clave de acceso").fill("Yepes2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Clientes actualmente esperando")).toBeVisible();

  // The four accordion rows are present and compact.
  await expect(
    page.getByRole("button", { name: /Actualizar número/ }),
  ).toBeVisible();
  const compartir = page.getByRole("button", { name: /Compartir/ });
  await expect(compartir).toBeVisible();
  await expect(page.getByRole("button", { name: /Apariencia/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Mensaje/ })).toBeVisible();

  // Row click only expands — it must NOT open WhatsApp itself.
  await expect(compartir).toHaveAttribute("aria-expanded", "false");
  let popupOpened = false;
  context.on("page", () => {
    popupOpened = true;
  });
  await compartir.click();
  await expect(compartir).toHaveAttribute("aria-expanded", "true");

  const wa = page.locator('a[aria-label="Compartir en WhatsApp"]');
  await expect(wa).toBeVisible();
  expect(
    ((await wa.getAttribute("href")) ?? "").startsWith(
      "https://api.whatsapp.com/send?text=",
    ),
  ).toBe(true);
  await page.waitForTimeout(250);
  expect(popupOpened).toBe(false);

  // Counter controls are rendered and enabled alongside — verified WITHOUT
  // clicking them, so no production counter is mutated.
  await expect(
    page.getByRole("button", { name: "Aumentar clientes" }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Disminuir clientes" }),
  ).toBeEnabled();

  // The manual counter input lives behind the "Actualizar número" accordion.
  await page.getByRole("button", { name: /Actualizar número/ }).click();
  await expect(page.locator('input[name="value"]')).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Actualizar", exact: true }),
  ).toBeEnabled();
});
