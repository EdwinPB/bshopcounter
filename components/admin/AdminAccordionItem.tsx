"use client";

import { useId } from "react";

// One settings row in an AdminAccordion group. Controlled: `open`/`onToggle`
// come from the caller so at most one item is expanded.
//
// Each row is a compact, clearly-interactive settings tile. The panel is ALWAYS
// rendered (stable server/client DOM, no conditional mount, avoids hydration
// mismatch); collapse is driven by the `hidden` attribute (display:none) so
// collapsed content is not visible / tappable / focusable. `inert`/`aria-hidden`
// are kept as hardening.
export default function AdminAccordionItem({
  open,
  onToggle,
  title,
  summary,
  icon,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  summary?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const buttonId = useId();
  const panelId = useId();

  return (
    <div
      className={`rounded-xl border transition-colors ${
        open
          ? "border-neutral-300 bg-white shadow-sm"
          : "border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100"
      }`}
    >
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex min-h-[52px] w-full items-center gap-3 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-900/30"
      >
        {icon && (
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500"
          >
            {icon}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-neutral-900">
            {title}
          </span>
        </span>

        {summary && (
          <span className="max-w-[9rem] truncate text-xs text-neutral-500">
            {summary}
          </span>
        )}

        <span
          aria-hidden
          className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors ${
            open ? "bg-neutral-200" : "bg-neutral-100"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        inert={!open ? true : undefined}
        className="px-4 pb-4 pt-3"
      >
        {children}
      </div>
    </div>
  );
}
