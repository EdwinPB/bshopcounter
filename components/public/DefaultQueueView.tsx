import Counter from "@/components/counter/Counter";
import BarberPoleBackground from "@/components/ui/BarberPoleBackground";

// The product default theme. Renders the exact pre-theme public UI unchanged, so
// every existing tenant keeps its original appearance until an admin explicitly
// opts into a custom theme. `data-theme="default"` is present for verification
// and does not alter the original markup or styles.
export default function DefaultQueueView({
  name,
  initialCount,
  isOpen,
  slug,
}: {
  name: string;
  initialCount: number;
  isOpen: boolean;
  slug: string;
}) {
  return (
    <BarberPoleBackground>
      <main
        data-theme="default"
        className="flex flex-1 items-center justify-center p-8"
      >
        <Counter name={name} count={initialCount} isOpen={isOpen} slug={slug} />
      </main>
    </BarberPoleBackground>
  );
}
