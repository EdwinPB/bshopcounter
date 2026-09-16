import { BARBER_POLE_BG_COLOR, BARBER_POLE_BG_IMAGE } from "@/lib/public-themes";

// Shared light barber-pole backdrop, generated entirely with CSS (layered
// gradients). No image/SVG asset is loaded. Used by the default public theme and
// the admin pages.
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
        className="fixed inset-0 z-0"
        style={{
          backgroundColor: BARBER_POLE_BG_COLOR,
          backgroundImage: BARBER_POLE_BG_IMAGE,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
