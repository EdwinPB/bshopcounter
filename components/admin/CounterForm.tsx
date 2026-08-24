"use client";

import { useActionState, useState } from "react";
import { estimateWaitingMinutes, formatWaitTime } from "@/lib/waiting-time";

function JornadaButton({
  action,
  children,
  style,
}: {
  action: (
    state: { error?: string },
    formData: FormData,
  ) => Promise<{ error?: string }>;
  children: React.ReactNode;
  style: "open" | "close";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const className =
    style === "open"
      ? "bg-emerald-600 hover:bg-emerald-500"
      : "bg-red-600 hover:bg-red-500";

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <button
        type="submit"
        disabled={pending}
        className={`rounded-lg px-4 py-3 text-base font-semibold text-white transition active:scale-[0.99] disabled:opacity-50 ${className}`}
      >
        {children}
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

export default function CounterForm({
  name,
  count,
  isOpen,
  updateAction,
  startJornadaAction,
  finishJornadaAction,
  logoutAction,
}: {
  name: string;
  count: number;
  isOpen: boolean;
  updateAction: (
    state: { error?: string; estimatedMinutes?: number },
    formData: FormData,
  ) => Promise<{ error?: string; estimatedMinutes?: number }>;
  startJornadaAction: (
    state: { error?: string },
    formData: FormData,
  ) => Promise<{ error?: string }>;
  finishJornadaAction: (
    state: { error?: string },
    formData: FormData,
  ) => Promise<{ error?: string }>;
  logoutAction: () => Promise<void>;
}) {
  const [value, setValue] = useState(String(count));
  const [state, formAction, pending] = useActionState(updateAction, {});

  const parsed = parseInt(value, 10);
  const currentEstimate = estimateWaitingMinutes(
    Number.isNaN(parsed) ? 0 : parsed,
  );
  const estimatedMinutes = state?.estimatedMinutes ?? currentEstimate;

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900">{name}</h1>
      </div>

      <div className="rounded-xl bg-neutral-50 p-4 text-center">
        <p className="text-sm font-medium text-neutral-500">Estado</p>
        <p
          className={`mt-1 text-3xl font-black ${
            isOpen ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {isOpen ? "🟢 Atendiendo" : "🔴 Cerrado"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {isOpen ? (
          <JornadaButton action={finishJornadaAction} style="close">
            🔴 Finalizar jornada
          </JornadaButton>
        ) : (
          <JornadaButton action={startJornadaAction} style="open">
            🟢 Iniciar jornada
          </JornadaButton>
        )}
      </div>

      <div className="text-center">
        <p className="mt-1 text-neutral-500">Clientes actualmente esperando</p>
        <div className="mt-3 text-6xl font-black text-neutral-950 tabular-nums">
          {count}
        </div>
        <div className="mt-3 flex flex-col items-center gap-1">
          <p className="text-sm text-neutral-400">Tiempo estimado</p>
          <p className="text-xl font-bold text-neutral-800">
            {formatWaitTime(estimatedMinutes)}
          </p>
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
