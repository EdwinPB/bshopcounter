"use client";

import { useActionState, useRef, useState } from "react";
import WhatsAppShareButton from "@/components/admin/WhatsAppShareButton";
import { decrementCounter, incrementCounter } from "@/lib/actions";
import { MAX_SHARE_MESSAGE, normalizedShareMessage } from "@/lib/share";
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

function ArrowGlyph({ direction }: { direction: "up" | "down" }) {
  const path = direction === "up" ? "M12 5l7 8H5z" : "M12 19l-7-8h14z";
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="currentColor"
      aria-hidden="true"
      className="pointer-events-none"
    >
      <path d={path} />
    </svg>
  );
}

export default function CounterForm({
  name,
  slug,
  publicUrl,
  shareMessage,
  updateShareMessageAction,
  count,
  isOpen,
  updateAction,
  startJornadaAction,
  finishJornadaAction,
  logoutAction,
}: {
  name: string;
  slug: string;
  publicUrl: string;
  shareMessage: string | null;
  updateShareMessageAction: (
    state: { error?: string },
    formData: FormData,
  ) => Promise<{ error?: string; message?: string | null }>;
  count: number;
  isOpen: boolean;
  updateAction: (
    state: { error?: string },
    formData: FormData,
  ) => Promise<{ error?: string; estimatedMinutes?: number; value?: number }>;
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
  const [currentCount, setCurrentCount] = useState(() => count);
  const [value, setValue] = useState(() => String(count));

  const [quickPending, setQuickPending] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);
  const quickPendingRef = useRef(false);

  const [manualPending, setManualPending] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const [savedMessage, setSavedMessage] = useState<string | null>(shareMessage);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorValue, setEditorValue] = useState(() =>
    normalizedShareMessage(shareMessage),
  );
  const [msgPending, setMsgPending] = useState(false);
  const [msgFeedback, setMsgFeedback] = useState<{
    ok?: boolean;
    error?: string;
  } | null>(null);

  const estimatedMinutes = estimateWaitingMinutes(currentCount);

  async function applyQuick(delta: 1 | -1) {
    // Guard against accidental repeated taps before the async write resolves.
    if (quickPendingRef.current) return;
    quickPendingRef.current = true;
    setQuickPending(true);
    setQuickError(null);

    try {
      const result =
        delta === 1
          ? await incrementCounter(slug)
          : await decrementCounter(slug);

      if (!result.ok) {
        setQuickError(result.error);
        return;
      }

      setCurrentCount(result.value);
      setValue(String(result.value));
    } catch {
      setQuickError("No se pudo actualizar el contador.");
    } finally {
      quickPendingRef.current = false;
      setQuickPending(false);
    }
  }

  async function handleManualSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (manualPending) return;
    setManualPending(true);
    setManualError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await updateAction({}, formData);

      if (result.error) {
        setManualError(result.error);
        return;
      }
      // updateCounter always returns the confirmed persisted value on success.
      const next = result.value;
      if (typeof next === "number") {
        setCurrentCount(next);
        setValue(String(next));
      }
    } catch {
      setManualError("No se pudo actualizar el contador.");
    } finally {
      setManualPending(false);
    }
  }

  async function handleMessageSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (msgPending) return;
    setMsgPending(true);
    setMsgFeedback(null);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await updateShareMessageAction({}, formData);

      if (result.error) {
        setMsgFeedback({ error: result.error });
        return;
      }
      const next = result.message ?? null;
      setSavedMessage(next);
      setEditorValue(normalizedShareMessage(next));
      setMsgFeedback({ ok: true });
    } catch {
      setMsgFeedback({ error: "No se pudo guardar el mensaje." });
    } finally {
      setMsgPending(false);
    }
  }

  const buttonBase =
    "flex size-12 items-center justify-center rounded-2xl border bg-white text-neutral-700 shadow-sm transition select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2 active:scale-[0.92] disabled:opacity-50 sm:size-14";

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
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

        <div className="mt-4 flex items-center justify-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Disminuir clientes"
            title="Disminuir clientes"
            disabled={quickPending}
            onClick={() => applyQuick(-1)}
            className={`${buttonBase} border-neutral-300 hover:border-neutral-400 hover:text-neutral-900`}
          >
            <ArrowGlyph direction="down" />
          </button>

          <div
            aria-live="polite"
            aria-atomic="true"
            className="min-w-0 whitespace-nowrap text-5xl font-black leading-none text-neutral-950 tabular-nums sm:text-6xl"
          >
            {currentCount}
          </div>

          <button
            type="button"
            aria-label="Aumentar clientes"
            title="Aumentar clientes"
            disabled={quickPending}
            onClick={() => applyQuick(1)}
            className={`${buttonBase} border-neutral-300 hover:border-neutral-400 hover:text-neutral-900`}
          >
            <ArrowGlyph direction="up" />
          </button>
        </div>

        {quickError && (
          <p className="mt-2 text-sm text-red-600">{quickError}</p>
        )}

        <div className="mt-3 flex flex-col items-center gap-1">
          <p className="text-sm text-neutral-400">Tiempo estimado</p>
          <p className="text-xl font-bold text-neutral-800">
            {formatWaitTime(estimatedMinutes)}
          </p>
        </div>
      </div>

      <div className="mt-1 border-t border-neutral-100 pt-4">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-neutral-400">
          Compartir estado
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <WhatsAppShareButton publicUrl={publicUrl} shareMessage={savedMessage} />
          <button
            type="button"
            aria-expanded={editorOpen}
            onClick={() => {
              setEditorOpen((o) => !o);
              setMsgFeedback(null);
            }}
            className="rounded-md px-2 py-1 text-xs font-medium text-neutral-500 underline-offset-2 transition hover:text-neutral-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
          >
            Personalizar mensaje
          </button>
        </div>

        {editorOpen && (
          <form onSubmit={handleMessageSubmit} className="mt-3 flex flex-col gap-2 text-left">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-neutral-600">
              Mensaje para WhatsApp
              <textarea
                name="message"
                rows={3}
                maxLength={MAX_SHARE_MESSAGE}
                value={editorValue}
                onChange={(e) => setEditorValue(e.target.value)}
                aria-label="Mensaje para WhatsApp"
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
              />
            </label>
            <p className="text-xs text-neutral-400">
              El enlace público se añadirá automáticamente.
            </p>
            {msgFeedback?.error && (
              <p className="text-sm text-red-600">{msgFeedback.error}</p>
            )}
            {msgFeedback?.ok && (
              <p className="text-sm text-emerald-600">Mensaje guardado.</p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <button
                type="submit"
                disabled={msgPending}
                className="rounded-md bg-neutral-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 disabled:opacity-50"
              >
                Guardar mensaje
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditorOpen(false);
                  setMsgFeedback(null);
                }}
                className="rounded-md px-3 py-2 text-xs font-medium text-neutral-500 transition hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <form onSubmit={handleManualSubmit} className="flex flex-col gap-6">
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

        {manualError && (
          <p className="text-sm text-red-600">{manualError}</p>
        )}

        <button
          type="submit"
          disabled={manualPending}
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
