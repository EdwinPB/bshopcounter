import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/[barbershopSlug]/counter">,
) {
  const { barbershopSlug } = await ctx.params;

  const supabase = createServerSupabaseClient();

  const { data: barbershop } = await supabase
    .from("public_barbershops")
    .select("id, is_open")
    .eq("slug", barbershopSlug)
    .maybeSingle();

  if (!barbershop) {
    return NextResponse.json({ value: null }, { status: 404 });
  }

  const { data: counter } = await supabase
    .from("counters")
    .select("value")
    .eq("barbershop_id", barbershop.id)
    .maybeSingle();

  return NextResponse.json({
    value: counter?.value ?? 0,
    is_open: barbershop.is_open ?? false,
  });
}
