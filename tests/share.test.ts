import { strict as assert } from "node:assert";
import {
  DEFAULT_SHARE_MESSAGE,
  MAX_SHARE_MESSAGE,
  normalizedShareMessage,
  buildWhatsAppShareHref,
} from "../lib/share.ts";

assert.equal(
  DEFAULT_SHARE_MESSAGE,
  "Mira cuántas personas están esperando antes de venir.",
);
assert.equal(MAX_SHARE_MESSAGE, 300);

// ---- Share message normalization (now OG/description content) ----
// Blank / null / whitespace -> default.
assert.equal(normalizedShareMessage(null), DEFAULT_SHARE_MESSAGE);
assert.equal(normalizedShareMessage(""), DEFAULT_SHARE_MESSAGE);
assert.equal(normalizedShareMessage("   \n "), DEFAULT_SHARE_MESSAGE);
// Custom message is trimmed and preserved.
assert.equal(normalizedShareMessage("  Hola, vengan  "), "Hola, vengan");

// ---- WhatsApp share payload: ONLY the canonical public URL ----
function decode(href: string): string {
  return decodeURIComponent(href.split("?text=")[1] ?? "");
}

const URLS = [
  "https://bshopcounter.vercel.app/yepes",
  "https://bshopcounter.vercel.app/barberia-central",
  "https://bshopcounter.vercel.app/dielem",
];

for (const url of URLS) {
  const href = buildWhatsAppShareHref(url);
  assert.ok(href.startsWith("https://api.whatsapp.com/send?text="), href);

  // Body is exactly the canonical URL — nothing else.
  assert.equal(decode(href), url);

  // Exactly one URL, no /admin, no share message, no access key.
  assert.equal((decode(href).match(/https?:\/\//g) ?? []).length, 1);
  assert.ok(!href.includes("/admin"));
  assert.ok(!decode(href).includes(DEFAULT_SHARE_MESSAGE));
  assert.ok(!decode(href).includes("Yepes2026!"));
  assert.ok(!decode(href).includes("Polo2026!"));
}

// A configured share_message is NOT part of the WhatsApp payload.
const custom = buildWhatsAppShareHref("https://bshopcounter.vercel.app/dielem");
assert.ok(!decode(custom).includes("Bienvenidos"));
assert.equal(decode(custom), "https://bshopcounter.vercel.app/dielem");

// Missing / invalid URL -> empty href (caller disables the link).
assert.equal(buildWhatsAppShareHref(""), "");
assert.equal(buildWhatsAppShareHref("   "), "");
assert.equal(buildWhatsAppShareHref(null), "");
assert.equal(buildWhatsAppShareHref(undefined), "");
assert.equal(buildWhatsAppShareHref("/barberia-central"), "");
assert.equal(buildWhatsAppShareHref("javascript:alert(1)"), "");

console.log("share: all assertions passed");
