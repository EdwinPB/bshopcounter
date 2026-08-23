import { notFound } from "next/navigation";
import Counter from "@/components/counter/Counter";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function BarbershopPage({
  params,
}: PageProps<"/[barbershopSlug]">) {
  const { barbershopSlug } = await params;
  const supabase = createServerSupabaseClient();

  const { data: barbershop, error: shopError } = await supabase
    .from("barbershops")
    .select("id, name")
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

  const { data: counter, error: counterError } = await supabase
    .from("counters")
    .select("value")
    .eq("barbershop_id", barbershop.id)
    .maybeSingle();

  if (counterError) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-neutral-600 text-lg">
          No se pudo cargar el contador.
        </p>
      </main>
    );
  }

  return <Counter name={barbershop.name} count={counter?.value ?? 0} />;
}
