import { test, expect } from "@playwright/test";

test("session cookie security attributes", async ({ page, context }) => {
  await page.goto("/yepes/admin");
  await page.getByLabel("Clave de acceso").fill("Yepes2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Nuevo número")).toBeVisible();

  const cookies = await context.cookies();
  const session = cookies.find((c) => c.name === "bshop_session");
  expect(session).toBeTruthy();
  expect(session!.httpOnly).toBe(true);
  expect(session!.sameSite).toBe("Lax");
  expect(session!.secure).toBe(true); // prod build (NODE_ENV=production)
  expect(session!.expires).toBeGreaterThan(Date.now() / 1000);
  // cookie must not contain plaintext access key
  expect(session!.value).not.toContain("Yepes2026!");
  // must be bound to tenant (decoded)
  const payload = JSON.parse(
    Buffer.from(session!.value.split(".")[0], "base64url").toString("utf8"),
  );
  expect(payload.barbershopSlug).toBe("yepes");
  expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
});
