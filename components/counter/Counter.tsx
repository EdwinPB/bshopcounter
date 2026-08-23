export default function Counter({
  name,
  count,
}: {
  name: string;
  count: number;
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span className="text-4xl font-bold uppercase tracking-[0.2em] text-neutral-900 sm:text-5xl">
        {name}
      </span>
      <p className="text-xl text-neutral-500 sm:text-2xl">
        Clientes esperando
      </p>
      <span className="text-[clamp(7rem,26vw,20rem)] font-black leading-none tracking-tight text-neutral-950 tabular-nums">
        {count}
      </span>
    </div>
  );
}
