"use client";

import { useActionState, useState } from "react";

export default function CounterForm({
  name,
  count,
  updateAction,
  logoutAction,
}: {
  name: string;
  count: number;
  updateAction: (
    state: { error?: string },
    formData: FormData,
  ) => Promise<{ error?: string }>;
  logoutAction: () => Promise<void>;
}) {
  const [value, setValue] = useState(String(count));
  const [state, formAction, pending] = useActionState(updateAction, {});

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900">{name}</h1>
        <p className="mt-1 text-neutral-500">
          Clientes actualmente esperando
        </p>
        <div className="mt-3 text-6xl font-black text-neutral-950 tabular-nums">
          {count}
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        <label className="flex flex-col gap-2 text-left text-sm font-medium text-neutral-700">
          Nuevo número
          <input
            type="number"
            name="value"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-lg text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
          />
        </label>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-50"
        >
          Actualizar
        </button>
      </form>

      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
