"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 5000;

export default function LiveCounter({
  initialCount,
  slug,
}: {
  initialCount: number;
  slug: string;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/${slug}/counter`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { value: number | null };
        if (!cancelled && typeof data.value === "number") {
          setCount(data.value);
        }
      } catch {
        // Ignore transient network failures; keep the last known value.
      }
    };

    const id = window.setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [slug]);

  return (
    <span className="text-[clamp(7rem,26vw,20rem)] font-black leading-none tracking-tight text-neutral-950 tabular-nums">
      {count}
    </span>
  );
}
