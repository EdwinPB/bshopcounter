import { formatWaitTime } from "@/lib/waiting-time";

export default function EstimatedWait({ minutes }: { minutes: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs uppercase tracking-widest text-[var(--pt-muted)]">
        ⏱ Tiempo estimado
      </span>
      <span className="text-xl font-bold text-[var(--pt-text)] sm:text-2xl">
        {formatWaitTime(minutes)}
      </span>
    </div>
  );
}
