import { strict as assert } from "node:assert";
import {
  DEFAULT_SHARE_MESSAGE,
  MAX_SHARE_MESSAGE,
  normalizedShareMessage,
  buildWhatsAppShareText,
} from "../lib/share.ts";

assert.equal(
  DEFAULT_SHARE_MESSAGE,
  "Mira cuántas personas están esperando antes de venir.",
);
assert.equal(MAX_SHARE_MESSAGE, 300);

// Blank / null / whitespace -> default.
assert.equal(normalizedShareMessage(null), DEFAULT_SHARE_MESSAGE);
assert.equal(normalizedShareMessage(""), DEFAULT_SHARE_MESSAGE);
assert.equal(normalizedShareMessage("   \n "), DEFAULT_SHARE_MESSAGE);
assert.equal(normalizedShareMessage("Hola, vengan"), "Hola, vengan");

// Exactly one public URL, message then blank line then absolute URL.
assert.equal(
  buildWhatsAppShareText(null, "https://bshopcounter.vercel.app/yepes"),
  `${DEFAULT_SHARE_MESSAGE}\n\nhttps://bshopcounter.vercel.app/yepes`,
);
assert.equal(
  buildWhatsAppShareText("     ", "https://bshopcounter.vercel.app/barberia-central"),
  `${DEFAULT_SHARE_MESSAGE}\n\nhttps://bshopcounter.vercel.app/barberia-central`,
);
assert.equal(
  buildWhatsAppShareText("Bienvenidos", "https://bshopcounter.vercel.app/dielem"),
  "Bienvenidos\n\nhttps://bshopcounter.vercel.app/dielem",
);

// Never contains /admin.
for (const url of [
  "https://bshopcounter.vercel.app/yepes",
  "https://bshopcounter.vercel.app/barberia-central",
  "https://bshopcounter.vercel.app/dielem",
]) {
  assert.ok(!buildWhatsAppShareText(null, url).includes("/admin"), url);
}

// Contains exactly one occurrence of the public URL.
const text = buildWhatsAppShareText(
  "Mensaje",
  "https://bshopcounter.vercel.app/yepes",
);
assert.equal(text.match(/https:\/\/bshopcounter\.vercel\.app\/yepes/g)!.length, 1);

console.log("share: all assertions passed");
