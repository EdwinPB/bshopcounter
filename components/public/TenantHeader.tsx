export default function TenantHeader({
  name,
  tagline,
}: {
  name: string;
  tagline?: string | null;
}) {
  return (
    <header className="flex flex-col items-center gap-2 text-center">
      <h1
        className="text-2xl font-semibold uppercase tracking-[0.18em] text-[var(--pt-text)] sm:text-3xl"
        style={{ fontFamily: "var(--pt-font-display)" }}
      >
        {name}
      </h1>
      {tagline ? (
        <p className="text-xs tracking-[0.28em] uppercase text-[var(--pt-muted)]">
          {tagline}
        </p>
      ) : null}
    </header>
  );
}
