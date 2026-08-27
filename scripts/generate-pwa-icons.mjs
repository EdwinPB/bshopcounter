import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

async function renderSvgToPng(svgPath, outPath, size) {
  const svg = await readFile(join(root, svgPath), "utf8");
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });

  const html = `<!doctype html><html><head><style>*{margin:0;padding:0}html,body{width:${size}px;height:${size}px;overflow:hidden}</style></head><body><img src="${dataUri}" width="${size}" height="${size}" style="display:block"/></body></html>`;

  await page.setContent(html);
  const img = page.locator("img");
  await img.waitFor({ state: "visible" });

  const buf = await page.screenshot({
    type: "png",
    clip: { x: 0, y: 0, width: size, height: size },
  });

  await browser.close();
  await writeFile(join(root, outPath), buf);
  console.log(`generated ${outPath} (${size}x${size})`);
}

async function main() {
  await renderSvgToPng("public/pwa-icon-source.svg", "public/pwa-icon-192.png", 192);
  await renderSvgToPng("public/pwa-icon-source.svg", "public/pwa-icon-512.png", 512);
  await renderSvgToPng("public/pwa-icon-maskable-source.svg", "public/pwa-icon-maskable-512.png", 512);
  await renderSvgToPng("public/pwa-icon-source.svg", "public/apple-touch-icon.png", 180);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
