"use client";

import {
  AlertTriangle,
  LoaderCircle,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "default",
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "default" | "danger";
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !submitting
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
  }, [onClose, open, submitting]);

  if (!open) return null;

  async function confirm() {
    setSubmitting(true);

    try {
      await onConfirm();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close confirmation"
        onClick={() => {
          if (!submitting) {
            onClose();
          }
        }}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative z-10 w-full max-w-[480px] rounded-[26px] border border-[var(--line-strong)] bg-[var(--background)] p-6 shadow-[var(--shadow-xl)]"
      >
        <div className="flex items-start justify-between gap-4">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
              tone === "danger"
                ? "bg-red-500/10 text-red-500"
                : "bg-[var(--accent-soft)] text-[var(--accent)]"
            }`}
          >
            <AlertTriangle size={19} />
          </span>

          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-xl border border-[var(--line)] text-[var(--muted)] disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        <h2
          id="confirm-dialog-title"
          className="mt-6 text-2xl font-semibold tracking-[-0.04em]"
        >
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>

        <div className="mt-7 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="button-secondary"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() =>
              void confirm()
            }
            className={
              tone === "danger"
                ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-55"
                : "button-primary"
            }
          >
            {submitting && (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            )}

            {submitting
              ? "Submitting…"
              : confirmLabel}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] leading-5 text-[var(--muted)]">
          Your wallet will ask you to approve the transaction before anything is submitted.
        </p>
      </section>
    </div>
  );
}
