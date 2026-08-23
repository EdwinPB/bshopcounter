export default function BarberPoleBackground({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative flex flex-1 flex-col ${className}`}>
      <div
        aria-hidden
        className="fixed inset-0 z-0 bg-cover bg-center bg-[url('/barber-pole-bg.svg')]"
      />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
