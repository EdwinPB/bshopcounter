import { notFound } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import CounterForm from "@/components/admin/CounterForm";
import RememberAdminPath from "@/components/pwa/RememberAdminPath";
import BarberPoleBackground from "@/components/ui/BarberPoleBackground";
import { getSession } from "@/lib/session";
import {
  finishJornada,
  login,
  logout,
  startJornada,
  updateCounter,
} from "@/lib/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminPage({
  params,
}: PageProps<"/[barbershopSlug]/admin">) {
  const { barbershopSlug } = await params;
  const supabase = createServerSupabaseClient();

  const { data: barbershop, error: shopError } = await supabase
    .from("public_barbershops")
    .select("id, name, is_open")
    .eq("slug", barbershopSlug)
    .maybeSingle();

  if (shopError) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-neutral-600 text-lg">
          No se pudo cargar la barbería.
        </p>
      </main>
    );
  }

  if (!barbershop) {
    notFound();
  }

  const session = await getSession();
  const authorized = session?.barbershopSlug === barbershopSlug;

  if (!authorized) {
    return (
      <BarberPoleBackground>
        <main className="flex flex-1 items-center justify-center p-8">
          <LoginForm
            name={barbershop.name}
            action={login.bind(null, barbershopSlug)}
          />
        </main>
      </BarberPoleBackground>
    );
  }

  const { data: counter } = await supabase
    .from("counters")
    .select("value")
    .eq("barbershop_id", barbershop.id)
    .maybeSingle();

  return (
    <BarberPoleBackground>
      <main className="flex flex-1 items-center justify-center p-8">
        <RememberAdminPath slug={barbershopSlug} />
        <CounterForm
          name={barbershop.name}
          slug={barbershopSlug}
          count={counter?.value ?? 0}
          isOpen={barbershop.is_open}
          updateAction={updateCounter.bind(null, barbershopSlug)}
          startJornadaAction={startJornada.bind(null, barbershopSlug)}
          finishJornadaAction={finishJornada.bind(null, barbershopSlug)}
          logoutAction={logout}
        />
      </main>
    </BarberPoleBackground>
  );
}
