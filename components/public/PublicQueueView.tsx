import type { CSSProperties } from "react";
import {
  DEFAULT_PUBLIC_THEME_KEY,
  resolvePublicTheme,
  themeToCssVars,
} from "@/lib/public-themes";
import TenantHeader from "./TenantHeader";
import LiveQueue from "./LiveQueue";
import ThemeDecor from "./ThemeDecor";
import DefaultQueueView from "./DefaultQueueView";

// Single reusable public page. The `default` theme renders the untouched
// pre-theme UI (product default); every other theme is driven entirely by the
// data-theme attribute + CSS custom properties set here in the server-rendered
// HTML, so the first paint already shows the correct theme (no hydration flash)
// and no theme needs any image asset.
export default function PublicQueueView({
  name,
  tagline,
  themeKey,
  initialCount,
  isOpen,
  slug,
}: {
  name: string;
  tagline?: string | null;
  themeKey: string;
  initialCount: number;
  isOpen: boolean;
  slug: string;
}) {
  const theme = resolvePublicTheme(themeKey);

  // Product default: the original public UI, byte-for-byte compatible with the
  // pre-theme design (no themed wrapper, no tagline, no decor).
  if (theme.key === DEFAULT_PUBLIC_THEME_KEY) {
    return (
      <DefaultQueueView
        name={name}
        initialCount={initialCount}
        isOpen={isOpen}
        slug={slug}
      />
    );
  }

  const vars = themeToCssVars(theme.tokens);

  return (
    <div
      data-theme={theme.key}
      className="relative flex min-h-dvh w-full flex-col overflow-hidden"
      style={
        {
          ...vars,
          backgroundColor: "var(--pt-bg-color)",
          backgroundImage: "var(--pt-bg-image)",
          backgroundSize: "cover",
          color: "var(--pt-text)",
        } as CSSProperties
      }
    >
      <ThemeDecor decor={theme.tokens.decorStyle} tokens={theme.tokens} />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <TenantHeader name={name} tagline={tagline} />

        <LiveQueue
          initialCount={initialCount}
          isOpen={isOpen}
          slug={slug}
        />
      </main>
    </div>
  );
}
