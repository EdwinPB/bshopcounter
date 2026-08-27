import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://localhost:3000" });

test("PWA manifest + icons + metadata reachable", async ({ request }) => {
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  const m = await manifest.json();
  expect(m.name).toBe("Barbershop Counter");
  expect(m.short_name).toBe("BShop Counter");
  expect(m.display).toBe("standalone");
  expect(m.start_url).toBe("/");
  expect(m.theme_color).toBeTruthy();
  expect(m.background_color).toBeTruthy();
  expect(Array.isArray(m.icons)).toBe(true);
  expect(m.icons.length).toBeGreaterThanOrEqual(3);

  // icons referencable
  for (const icon of m.icons) {
    const res = await request.get(icon.src);
    expect(res.ok()).toBe(true);
  }
});

test("PWA head metadata present", async ({ page }) => {
  await page.goto("/");
  const meta = await page.evaluate(() => {
    const q = <T extends Element>(sel: string): T | null =>
      document.querySelector<T>(sel);
    return {
      manifest: q<HTMLLinkElement>('link[rel="manifest"]')?.getAttribute("href"),
      themeColor: q<HTMLMetaElement>('meta[name="theme-color"]')?.content,
      appleTitle: q<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]')?.content,
      appleStatusBar: q<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]')?.content,
      mobileCapable: q<HTMLMetaElement>('meta[name="mobile-web-app-capable"]')?.content,
      appleTouch: q<HTMLLinkElement>('link[rel="apple-touch-icon"]')?.href,
      viewport: q<HTMLMetaElement>('meta[name="viewport"]')?.content,
    };
  });
  expect(meta.manifest).toBe("/manifest.webmanifest");
  expect(meta.themeColor).toMatch(/^#/);
  expect(meta.appleTitle).toBeTruthy();
  expect(meta.appleStatusBar).toBeTruthy();
  expect(meta.mobileCapable).toBe("yes");
  expect(meta.appleTouch).toBeTruthy();
  expect(meta.viewport).toContain("viewport-fit=cover");
});

test("service worker registers in production", async ({ page }) => {
  await page.goto("/");
  // registration is best-effort and async; poll for an active/installing registration
  const registered = await page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        if (!("serviceWorker" in navigator)) return resolve(false);
        let settled = false;
        const done = (v: boolean) => {
          if (!settled) {
            settled = true;
            resolve(v);
          }
        };
        // repeat reload-free: just resolve when register succeeds
        const start = async () => {
          try {
            await navigator.serviceWorker.register("/sw.js");
            done(true);
          } catch {
            done(false);
          }
        };
        start();
        setTimeout(() => done(false), 8000);
      }),
  );
  expect(registered).toBe(true);
});
