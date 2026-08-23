"use client";

import { useState } from "react";
import { BARBERSHOP_NAME, WAITING_CLIENTS } from "@/lib/mock";

export default function CounterForm() {
  const [value, setValue] = useState(WAITING_CLIENTS);

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900">
          {BARBERSHOP_NAME}
        </h1>
        <p className="mt-1 text-neutral-500">
          Clientes actualmente esperando
        </p>
        <div className="mt-3 text-6xl font-black text-neutral-950 tabular-nums">
          {WAITING_CLIENTS}
        </div>
      </div>

      <label className="flex flex-col gap-2 text-left text-sm font-medium text-neutral-700">
        Nuevo número
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-lg text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
        />
      </label>

      <button
        type="submit"
        className="rounded-lg bg-neutral-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99]"
      >
        Actualizar
      </button>
    </form>
  );
}
