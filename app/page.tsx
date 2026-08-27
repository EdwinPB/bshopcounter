import BarberPoleBackground from "@/components/ui/BarberPoleBackground";
import PreferredAdminRedirect from "@/components/pwa/PreferredAdminRedirect";
import BarbershopFinder from "@/components/BarbershopFinder";

export default function Home() {
  return (
    <BarberPoleBackground>
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
        <PreferredAdminRedirect />
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold tracking-[0.05em] text-neutral-900 sm:text-4xl">
            BARBERSHOP COUNTER
          </h1>
          <p className="text-lg text-neutral-500">Busca tu barbería</p>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <BarbershopFinder />
        </div>

        <p className="max-w-md text-base text-neutral-500">
          Consulta cuántas personas están esperando o entra al panel de
          administración.
        </p>
      </main>
    </BarberPoleBackground>
  );
}
