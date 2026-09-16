// Container for a single-open accordion group. Each item is rendered as its own
// rounded settings tile (spaced with gap); single-open is controlled by the
// caller via each item's `open`/`onToggle`, so only one section is expanded.
export default function AdminAccordion({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col gap-2">{children}</div>;
}
