"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 5000;

export default function LiveCounter({
  initialCount,
  isOpen,
  slug,
}: {
  initialCount: number;
  isOpen: boolean;
  slug: string;
}) {
  const [count, setCount] = useState(initialCount);
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/${slug}/counter`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          value: number | null;
          is_open?: boolean;
        };
        if (!cancelled && typeof data.value === "number") {
          setCount(data.value);
        }
        if (!cancelled && typeof data.is_open === "boolean") {
          setOpen(data.is_open);
        }
      } catch {
        // Ignore transient network failures; keep last known state.
      }
    };

    const id = window.setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [slug]);

  return (
    <>
      <span
        className={`rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-widest ${
          open ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}
      >
        {open ? "Atendiendo" : "Cerrado"}
      </span>

      <span className="text-[clamp(7rem,26vw,20rem)] font-black leading-none tracking-tight text-neutral-950 tabular-nums">
        {count}
      </span>
    </>
  );
}
