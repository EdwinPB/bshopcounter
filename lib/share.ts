// Default invitation shown when a tenant has not configured a custom message.
//
// This message is SOCIAL/METADATA content now: it becomes the Open Graph
// description and the generated preview card subtitle. It is NOT sent as
// WhatsApp message-body text anymore (the body is the canonical URL only).
export const DEFAULT_SHARE_MESSAGE =
  "Mira cuántas personas están esperando antes de venir.";

export const MAX_SHARE_MESSAGE = 300;

// Resolve the effective social message: blank/null -> default, otherwise trimmed.
export function normalizedShareMessage(raw: string | null | undefined): string {
  const trimmed = (raw ?? "").trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_SHARE_MESSAGE;
}

// WhatsApp share deep-link. The message body is ONLY the canonical public tenant
// URL — the configured share_message is no longer message text (it is surfaced
// through the link preview: og:description + generated OG/Twitter card).
//
// Exactly one URL, never /admin, never an access key. Returns "" for a
// missing/invalid URL so the caller can disable the share link.
export function buildWhatsAppShareHref(
  publicUrl: string | null | undefined,
): string {
  const url = (publicUrl ?? "").trim();
  if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url)) return "";
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`;
}
