export const PREFERRED_ADMIN_PATH_KEY = "preferredAdminPath";

// Matches a safe internal tenant admin route: "/<slug>/admin".
// slug: lowercase letters, digits, hyphens (>=1 char). No leading slash,
// no query, no hash, no protocol, no trailing segments.
const SAFE_ADMIN_PATH_RE = /^\/([a-z0-9-]+)\/admin$/;

export function isSafeAdminPath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value.length === 0 || value.length > 200) return false;
  // Reject absolute, protocol-relative, and any URL with scheme/host.
  if (value.includes("://") || value.startsWith("//")) return false;
  if (value.includes("?") || value.includes("#")) return false;
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  return SAFE_ADMIN_PATH_RE.test(value);
}

export function readPreferredAdminPath(storage: Storage): string | null {
  const value = storage.getItem(PREFERRED_ADMIN_PATH_KEY);
  if (isSafeAdminPath(value)) {
    return value;
  }
  return null;
}

export function savePreferredAdminPath(storage: Storage, path: string): void {
  if (isSafeAdminPath(path)) {
    storage.setItem(PREFERRED_ADMIN_PATH_KEY, path);
  }
}
