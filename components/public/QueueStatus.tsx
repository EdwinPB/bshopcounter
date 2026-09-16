// Status pill. The label ("Atendiendo" / "Cerrado") always carries the meaning,
// so the color is a supporting cue, never the only signal.
export default function QueueStatus({ open }: { open: boolean }) {
  return (
    <span
      className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest sm:text-sm"
      style={{
        backgroundColor: open ? "var(--pt-status-open-bg)" : "var(--pt-status-closed-bg)",
        color: open ? "var(--pt-status-open-text)" : "var(--pt-status-closed-text)",
      }}
    >
      {open ? "Atendiendo" : "Cerrado"}
    </span>
  );
}
