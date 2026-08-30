// Default invitation shown when a tenant has not configured a custom message.
export const DEFAULT_SHARE_MESSAGE =
  "Mira cuántas personas están esperando antes de venir.";

export const MAX_SHARE_MESSAGE = 300;

// Resolve the effective message: blank/null -> default, otherwise trimmed.
export function normalizedShareMessage(raw: string | null | undefined): string {
  const trimmed = (raw ?? "").trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_SHARE_MESSAGE;
}

// Final WhatsApp text: <message> then a blank line then the absolute public URL.
// The URL is appended by the app (from getPublicTenantUrl), never typed by the
// admin, so /admin can never be accidentally shared. Exactly one public URL.
export function buildWhatsAppShareText(
  message: string | null | undefined,
  publicUrl: string,
): string {
  return `${normalizedShareMessage(message)}\n\n${publicUrl}`;
}
