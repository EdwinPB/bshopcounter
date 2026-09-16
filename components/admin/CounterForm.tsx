"use client";

import { useActionState, useRef, useState } from "react";
import AdminAccordion from "@/components/admin/AdminAccordion";
import AdminAccordionItem from "@/components/admin/AdminAccordionItem";
import ThemeSelector from "@/components/admin/ThemeSelector";
import { decrementCounter, incrementCounter } from "@/lib/actions";
import {
  buildWhatsAppShareHref,
  MAX_SHARE_MESSAGE,
  normalizedShareMessage,
} from "@/lib/share";
import { resolvePublicTheme } from "@/lib/public-themes";
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

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const rowIcons = {
  number: (
    <svg viewBox="0 0 24 24" width="17" height="17" {...iconProps} aria-hidden="true">
      <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
  share: (
    <svg viewBox="0 0 24 24" width="17" height="17" {...iconProps} aria-hidden="true">
      <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
      <path d="M12 3v13" />
      <path d="M16 7l-4-4-4 4" />
    </svg>
  ),
  theme: (
    <svg viewBox="0 0 24 24" width="17" height="17" {...iconProps} aria-hidden="true">
      <path d="M12 2a10 10 0 0 0 0 20 2 2 0 0 0 1.8-1l.3-1a1.5 1.5 0 0 1 1.5-1.1h1.4A4.2 4.2 0 0 0 21 12.7 10 10 0 0 0 12 2z" />
      <path d="M7.5 11.5h.01" />
      <path d="M11 7.5h.01" />
      <path d="M15.5 8.5h.01" />
    </svg>
  ),
  message: (
    <svg viewBox="0 0 24 24" width="17" height="17" {...iconProps} aria-hidden="true">
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.6-.8L3 20l1-4.9A8.5 8.5 0 1 1 21 11.5z" />
    </svg>
  ),
} as const;

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
  currentThemeKey,
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
  currentThemeKey: string;
}) {
  const [currentCount, setCurrentCount] = useState(() => count);
  const [value, setValue] = useState(() => String(count));

  const [quickPending, setQuickPending] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);
  const quickPendingRef = useRef(false);

  const [manualPending, setManualPending] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const [savedMessage, setSavedMessage] = useState<string | null>(shareMessage);
  const [editorValue, setEditorValue] = useState(() =>
    normalizedShareMessage(shareMessage),
  );
  const [msgPending, setMsgPending] = useState(false);
  const [msgFeedback, setMsgFeedback] = useState<{
    ok?: boolean;
    error?: string;
  } | null>(null);

  // Single-open accordion: only one section expanded at a time.
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [activeThemeKey, setActiveThemeKey] = useState(currentThemeKey);

  function toggleSection(key: string) {
    setOpenSection((cur) => (cur === key ? null : key));
  }

  const estimatedMinutes = estimateWaitingMinutes(currentCount);
  const currentThemeLabel = resolvePublicTheme(activeThemeKey).label;
  const messageSummary = savedMessage ? savedMessage : "Predeterminado";

  // WhatsApp message body is ONLY the canonical public URL. The configured
  // share message is no longer message text — it becomes the link preview
  // content (og:description + generated OG card).
  const waUrl = buildWhatsAppShareHref(publicUrl);

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
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
      <h1 className="text-center text-2xl font-bold text-neutral-900">
        {name}
      </h1>

      {/* Status / jornada */}
      <section className="flex flex-col gap-3" aria-label="Estado y jornada">
        <div className="rounded-xl bg-neutral-50 p-3 text-center">
          <p className="text-sm font-medium text-neutral-500">Estado</p>
          <p
            className={`mt-1 text-3xl font-black ${
              isOpen ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {isOpen ? "🟢 Atendiendo" : "🔴 Cerrado"}
          </p>
        </div>

        {isOpen ? (
          <JornadaButton action={finishJornadaAction} style="close">
            🔴 Finalizar jornada
          </JornadaButton>
        ) : (
          <JornadaButton action={startJornadaAction} style="open">
            🟢 Iniciar jornada
          </JornadaButton>
        )}
      </section>

      {/* Queue control */}
      <section className="text-center" aria-label="Control de clientes">
        <p className="text-sm font-medium text-neutral-500">
          Clientes actualmente esperando
        </p>

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
      </section>

      {/* Single-open accordion group */}
      <AdminAccordion>
        <AdminAccordionItem
          title="Actualizar número"
          summary="Manual"
          icon={rowIcons.number}
          open={openSection === "number"}
          onToggle={() => toggleSection("number")}
        >
          <form
            onSubmit={handleManualSubmit}
            className="flex flex-col gap-3 text-left"
          >
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
              Cambiar manualmente
              <input
                type="number"
                name="value"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="rounded-lg border border-neutral-300 px-4 py-2.5 text-lg text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
              />
            </label>

            {manualError && (
              <p className="text-sm text-red-600">{manualError}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setManualError(null);
                  setOpenSection(null);
                }}
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={manualPending}
                className="flex-1 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
              >
                Actualizar
              </button>
            </div>
          </form>
        </AdminAccordionItem>

        <AdminAccordionItem
          title="Compartir"
          summary="WhatsApp"
          icon={rowIcons.share}
          open={openSection === "compartir"}
          onToggle={() => toggleSection("compartir")}
        >
          <div className="flex flex-col gap-2 text-left">
            <a
              href={waUrl || undefined}
              target={waUrl ? "_blank" : undefined}
              rel={waUrl ? "noopener noreferrer" : undefined}
              aria-label="Compartir por WhatsApp"
              aria-disabled={!waUrl}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-green-200 bg-green-50/70 px-3.5 py-2.5 text-sm font-medium text-green-800 transition hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40 disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="currentColor"
                aria-hidden="true"
                className="pointer-events-none shrink-0"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Compartir por WhatsApp
            </a>
            <p className="text-xs text-neutral-400">
              Se envía únicamente el enlace público. El texto aparece en la
              vista previa del enlace.
            </p>
          </div>
        </AdminAccordionItem>

        <AdminAccordionItem
          title="Apariencia"
          summary={currentThemeLabel}
          icon={rowIcons.theme}
          open={openSection === "theme"}
          onToggle={() => toggleSection("theme")}
        >
          <div className="flex flex-col gap-2 text-left">
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
              Tema visual
            </p>
            <ThemeSelector
              slug={slug}
              currentThemeKey={activeThemeKey}
              onThemeChange={setActiveThemeKey}
            />
          </div>
        </AdminAccordionItem>

        <AdminAccordionItem
          title="Mensaje"
          summary={messageSummary}
          icon={rowIcons.message}
          open={openSection === "message"}
          onToggle={() => toggleSection("message")}
        >
          <form
            onSubmit={handleMessageSubmit}
            className="flex flex-col gap-2 text-left"
          >
            <label className="flex flex-col gap-1.5 text-xs font-medium text-neutral-600">
              Mensaje de vista previa
              <textarea
                name="message"
                rows={3}
                maxLength={MAX_SHARE_MESSAGE}
                value={editorValue}
                onChange={(e) => setEditorValue(e.target.value)}
                aria-label="Mensaje de vista previa"
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
              />
            </label>

            <p className="text-xs text-neutral-400">
              Este mensaje aparecerá dentro de la vista previa del enlace al
              compartirlo.
            </p>

            {msgFeedback?.error && (
              <p className="text-sm text-red-600">{msgFeedback.error}</p>
            )}
            {msgFeedback?.ok && (
              <p className="text-sm text-emerald-600">Mensaje guardado.</p>
            )}

            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMsgFeedback(null);
                  setOpenSection(null);
                }}
                className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={msgPending}
                className="flex-1 rounded-md bg-neutral-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </form>
        </AdminAccordionItem>
      </AdminAccordion>

      {/* Logout */}
      <form action={logoutAction} className="mt-1 border-t border-neutral-100 pt-4">
        <button
          type="submit"
          className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-800"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
