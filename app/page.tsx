import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <h1 className="text-4xl font-bold text-neutral-900">Barbershop Counter</h1>
      <p className="max-w-md text-lg text-neutral-600">
        Selecciona una barbería para ver cuántos clientes esperan. Prueba la
        página pública y el panel de administración.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/barberia-central"
          className="rounded-lg bg-neutral-900 px-6 py-3 font-semibold text-white transition hover:bg-neutral-800"
        >
          /barberia-central
        </Link>
        <Link
          href="/barberia-central/admin"
          className="rounded-lg border border-neutral-300 px-6 py-3 font-semibold text-neutral-900 transition hover:border-neutral-900"
        >
          /barberia-central/admin
        </Link>
      </div>
    </main>
  );
}
