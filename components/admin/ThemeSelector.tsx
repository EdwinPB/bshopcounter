"use client";

import { useTransition, useState } from "react";
import { listPublicThemes } from "@/lib/public-themes";
import { updateTenantTheme } from "@/lib/actions";

// Theme picker for the admin "Apariencia" section. Single-column compact list,
// each option with a real visual preview built from the theme tokens (no
// duplicate definitions). Shows only preview + name + active checkmark.
export default function ThemeSelector({
  slug,
  currentThemeKey,
  onThemeChange,
}: {
  slug: string;
  currentThemeKey: string;
  onThemeChange?: (key: string) => void;
}) {
  const themes = listPublicThemes();
  const [selected, setSelected] = useState(currentThemeKey);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    ok?: boolean;
    error?: string;
  } | null>(null);

  function choose(key: string) {
    if (key === selected) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await updateTenantTheme(slug, key);
      if (result.ok) {
        setSelected(key);
        setFeedback({ ok: true });
        onThemeChange?.(key);
      } else {
        setFeedback({ error: result.error });
      }
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        {themes.map((theme) => {
          const active = theme.key === selected;
          return (
            <button
              key={theme.key}
              type="button"
              aria-pressed={active}
              disabled={isPending}
              onClick={() => choose(theme.key)}
              className={`flex min-h-[52px] items-center gap-3 rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 active:scale-[0.99] disabled:opacity-60 ${
                active
                  ? "border-neutral-800 bg-neutral-50"
                  : "border-neutral-200 bg-white hover:border-neutral-400"
              }`}
            >
              <span
                aria-hidden
                className="relative block h-9 w-11 shrink-0 overflow-hidden rounded-md border"
                style={{
                  backgroundColor: theme.tokens.bgColor,
                  backgroundImage: theme.tokens.bgImage,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderColor: theme.tokens.border,
                }}
              >
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 h-3 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-[1px]"
                  style={{
                    background: theme.tokens.numberColor,
                    opacity: 0.85,
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1.5"
                  style={{ background: theme.tokens.accent }}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-neutral-900">
                  {theme.label}
                </span>
              </span>

              {active && (
                <span
                  aria-hidden
                  className="shrink-0 text-sm font-semibold text-emerald-600"
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {feedback?.error && (
        <p className="mt-2 text-center text-sm text-red-600" role="alert">
          {feedback.error}
        </p>
      )}
      {feedback?.ok && (
        <p className="mt-2 text-center text-sm text-emerald-600" role="status">
          Tema actualizado.
        </p>
      )}
    </div>
  );
}
