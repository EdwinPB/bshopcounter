import "server-only";

import { headers } from "next/headers";

// Accept only a well-formed absolute http(s) base; otherwise return "".
function validAbsoluteBase(raw: string | undefined | null): string {
  if (!raw) return "";
  const v = raw.trim().replace(/\/+$/, "");
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(v) ? v : "";
}

// Resolve a reliable absolute site base:
//   1. NEXT_PUBLIC_SITE_URL, if it is a valid absolute URL (explicit override);
//   2. otherwise the host the request came in on (Vercel sets these headers),
//      so the public link is always absolute even when the env var is unset.
export async function getPublicSiteUrl(): Promise<string> {
  const configured = validAbsoluteBase(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured;

  const h = await headers();
  const proto = (
    h.get("x-forwarded-proto") ??
    h.get("x-forwarded-scheme") ??
    "https"
  )
    .split(",")[0]
    .trim()
    .toLowerCase();
  const host =
    h.get("x-vercel-forwarded-host") ??
    h.get("x-forwarded-host") ??
    h.get("host");
  return host ? `${proto}://${host}` : "";
}

// Absolute public URL for a tenant: https://<base>/<slug>.
// Returns "" only if no base can be resolved — never a relative "/slug".
export async function getPublicTenantUrl(slug: string): Promise<string> {
  const base = await getPublicSiteUrl();
  const normalizedSlug = (slug || "").replace(/^\/+|\/+$/g, "");
  return base && normalizedSlug ? `${base}/${normalizedSlug}` : "";
}

// Reusable: is this an absolute http(s) URL (safe to share as a web link)?
export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url);
}
