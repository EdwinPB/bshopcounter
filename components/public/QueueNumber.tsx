// The queue number is the strongest visual element on the page. High contrast,
// crisp, tabular numerals. No glow, no heavy effects.
export default function QueueNumber({ value }: { value: number }) {
  return (
    <span className="text-[clamp(6.5rem,30vw,18rem)] font-black leading-none tracking-tight text-[var(--pt-number)] tabular-nums">
      {value}
    </span>
  );
}
