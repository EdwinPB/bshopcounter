export default function Loading() {
  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center gap-6 bg-[#141414] px-6 text-center">
      <div
        aria-hidden
        className="flex size-14 items-center justify-center rounded-full border border-neutral-700 text-neutral-500 animate-pulse"
      >
        <span className="text-2xl font-black">B</span>
      </div>

      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="h-4 w-40 rounded-full bg-neutral-800" />
        <div className="h-10 w-24 rounded-2xl bg-neutral-800" />
      </div>

      <p className="text-sm tracking-widest text-neutral-400">
        Consultando disponibilidad…
      </p>
    </div>
  );
}
