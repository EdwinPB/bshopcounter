"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveBarbershop } from "@/lib/actions";
import type { ResolveBarbershopResult } from "@/lib/actions";

export default function BarbershopFinder() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<"view" | "admin">("view");
  const [state, formAction, pending] = useActionState<
    ResolveBarbershopResult | null,
    FormData
  >(resolveBarbershop, null);

  useEffect(() => {
    if (state && state.slug && !state.error) {
      router.push(
        state.mode === "admin" ? `/${state.slug}/admin` : `/${state.slug}`,
      );
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-md flex-col gap-5"
    >
      <input type="hidden" name="mode" value={mode} />

      <label className="flex flex-col gap-2 text-left">
        <span className="text-sm font-medium text-neutral-500">
          Nombre de la barbería
        </span>
        <input
          type="text"
          name="name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ej. Yepes"
          autoComplete="off"
          className="h-14 rounded-xl border border-neutral-300 bg-white px-4 text-lg text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
        />
      </label>

      {state?.error && (
        <p className="text-left text-sm font-medium text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          onClick={() => setMode("view")}
          disabled={pending}
          className="flex-1 cursor-pointer rounded-xl bg-neutral-900 px-4 py-4 text-base font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-50"
        >
          {pending ? "Buscando…" : "Ver estado"}
        </button>
        <button
          type="submit"
          onClick={() => setMode("admin")}
          disabled={pending}
          className="flex-1 cursor-pointer rounded-xl border border-neutral-300 bg-white px-4 py-4 text-base font-semibold text-neutral-800 transition hover:border-neutral-900 active:scale-[0.99] disabled:opacity-50"
        >
          Administrar
        </button>
      </div>
    </form>
  );
}
