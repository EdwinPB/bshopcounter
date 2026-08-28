import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Projects whose tenant data must never be written by automated tests.
// `E2E_PROTECTED_SUPABASE_REFS` (comma-separated) adds more; defaults to the
// known production project so it is protected out of the box.
const DEFAULT_PROTECTED_REFS = ["lpbenouejgymmjccakpj"];

type EnvMap = Record<string, string>;

function parseEnvFile(path: string): EnvMap {
  const out: EnvMap = {};
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      out[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // Ignore missing file.
  }
  return out;
}

function protectedRefs(): string[] {
  const fromEnv = (process.env.E2E_PROTECTED_SUPABASE_REFS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...DEFAULT_PROTECTED_REFS, ...fromEnv])];
}

// The Supabase URL the locally-running app is configured with (same source the
// Next.js server reads), falling back to the process env if provided.
export function configuredSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    parseEnvFile(resolve(process.cwd(), ".env.local")).NEXT_PUBLIC_SUPABASE_URL ||
    ""
  );
}

// ==== Read-only tests (no DB writes): always allowed ====

// ==== DB-mutating tests (counter updates, jornada start/finish, RPCs): gated ====
//
// Mutating tests must never run against a protected (production) project.
// They only run when:
//   1. E2E_ALLOW_DB_MUTATIONS=true  (explicit opt-in)
//   2. the configured Supabase URL is NOT a protected/production ref
// Otherwise they fail-fast / skip BEFORE any write — no fix-up, no cleanup.
export function mutationsAllowed(): boolean {
  if (process.env.E2E_ALLOW_DB_MUTATIONS !== "true") return false;
  const url = configuredSupabaseUrl();
  if (!url) return false;
  return !protectedRefs().some((ref) => ref && url.includes(ref));
}

export function mutationGuardReason(): string {
  if (mutationsAllowed()) return "";
  const url = configuredSupabaseUrl();
  return (
    "DB-mutating E2E test is disabled against the protected Supabase project. " +
    "A dedicated non-production test DB is required (configured URL: " +
    (url || "<unset>") +
    "). To allow intentionally, run with E2E_ALLOW_DB_MUTATIONS=true and point " +
    "the app / NEXT_PUBLIC_SUPABASE_URL at a test project NOT listed in " +
    "E2E_PROTECTED_SUPABASE_REFS."
  );
}
