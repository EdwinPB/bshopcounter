import LiveCounter from "./LiveCounter";

export default function Counter({
  name,
  count,
  isOpen,
  slug,
}: {
  name: string;
  count: number;
  isOpen: boolean;
  slug: string;
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span className="text-4xl font-bold uppercase tracking-[0.2em] text-neutral-900 sm:text-5xl">
        {name}
      </span>

      <p className="text-xl text-neutral-500 sm:text-2xl">Clientes esperando</p>

      <LiveCounter initialCount={count} isOpen={isOpen} slug={slug} />
    </div>
  );
}
