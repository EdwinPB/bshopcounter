"use client";

import { useEffect, useState } from "react";
import { estimateWaitingMinutes } from "@/lib/waiting-time";
import QueueStatus from "./QueueStatus";
import QueueNumber from "./QueueNumber";
import EstimatedWait from "./EstimatedWait";

const POLL_INTERVAL_MS = 5000;

export default function LiveQueue({
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

  const label = count === 1 ? "cliente esperando" : "clientes esperando";

  return (
    <>
      <QueueStatus open={open} />

      <QueueNumber value={count} />

      <p className="text-lg font-medium text-[var(--pt-muted)] sm:text-xl">
        {label}
      </p>

      {open && (
        <EstimatedWait minutes={estimateWaitingMinutes(count)} />
      )}
    </>
  );
}
