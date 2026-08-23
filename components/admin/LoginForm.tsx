"use client";

import { useActionState } from "react";

type LoginState = { error?: string };

export default function LoginForm({
  name,
  action,
}: {
  name: string;
  action: (state: LoginState, formData: FormData) => Promise<LoginState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900">{name}</h1>
        <p className="mt-1 text-neutral-500">Acceso administrativo</p>
      </div>

      <label className="flex flex-col gap-2 text-left text-sm font-medium text-neutral-700">
        Clave de acceso
        <input
          name="accessKey"
          type="password"
          autoComplete="off"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-lg text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
        />
      </label>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-50"
      >
        Ingresar
      </button>
    </form>
  );
}
