"use client";

import { GENLAYER_EXPLORER_URL } from "@/lib/contract/config";
import { truncateMiddle } from "@/lib/utils";
import {
  type TrackedTransaction,
  useTransactions,
} from "@/providers/transaction-provider";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  RefreshCcw,
  X,
  XCircle,
} from "lucide-react";
import {
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

function terminal(
  status: string,
) {
  return (
    status === "FINALIZED" ||
    status === "CANCELED"
  );
}

const subscribeBrowser = () => () => {};
const browserSnapshot = () => true;
const serverSnapshot = () => false;

function timeoutStatus(
  status: string,
) {
  return (
    status === "LEADER_TIMEOUT" ||
    status ===
      "VALIDATORS_TIMEOUT"
  );
}

export function TransactionCenter() {
  const {
    transactions,
    clearCompleted,
    refreshTransaction,
  } = useTransactions();

  const [open, setOpen] =
    useState(false);

  const canPortal =
    useSyncExternalStore(
      subscribeBrowser,
      browserSnapshot,
      serverSnapshot,
    );

  const active =
    transactions.filter(
      (item) =>
        !terminal(
          item.consensusStatus,
        ),
    ).length;

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        aria-label="Open transaction activity"
        className="relative grid size-10 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] transition hover:bg-[var(--surface-strong)]"
      >
        <Activity size={17} />

        {active > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold leading-5 text-white">
            {active}
          </span>
        )}
      </button>

      {open &&
        canPortal &&
        createPortal(
          <div
            data-testid="transaction-overlay"
            className="fixed inset-0 z-[100]"
          >
          <button
            type="button"
            aria-label="Close transaction activity"
            onClick={() =>
              setOpen(false)
            }
            className="absolute inset-0 bg-black/35 backdrop-blur-sm"
          />

          <aside
            data-testid="transaction-drawer"
            className="absolute inset-y-0 right-0 flex w-[min(94vw,430px)] flex-col border-l border-[var(--line)] bg-[var(--background)] shadow-2xl"
          >
            <div className="flex h-[76px] items-center justify-between border-b border-[var(--line)] px-5">
              <div>
                <p className="text-sm font-semibold">
                  Transaction activity
                </p>

                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Consensus, execution, and finality are tracked separately.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="grid size-10 place-items-center rounded-xl border border-[var(--line)]"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {transactions.length ===
              0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-16 text-center">
                  <Activity
                    size={22}
                    className="mx-auto text-[var(--muted)]"
                  />

                  <p className="mt-4 text-sm font-semibold">
                    No transactions yet
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                    Submitted PolicyDelta writes will remain visible here across reloads while consensus and finality progress.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map(
                    (item) => (
                      <TransactionCard
                        key={item.hash}
                        transaction={
                          item
                        }
                        onRefresh={() =>
                          refreshTransaction(
                            item.hash,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              )}
            </div>

            {transactions.length >
              0 && (
              <div className="border-t border-[var(--line)] p-4">
                <button
                  type="button"
                  onClick={
                    clearCompleted
                  }
                  className="button-secondary w-full"
                >
                  Clear finalized activity
                </button>
              </div>
            )}
          </aside>
          </div>,
          document.body,
        )}
    </>
  );
}

function TransactionCard({
  transaction,
  onRefresh,
}: {
  transaction:
    TrackedTransaction;
  onRefresh: () => Promise<void>;
}) {
  const failed =
    transaction.executionStatus ===
    "FINISHED_WITH_ERROR";

  const finalized =
    transaction.consensusStatus ===
    "FINALIZED";

  const timedOut =
    timeoutStatus(
      transaction.consensusStatus,
    );

  const Icon = failed
    ? XCircle
    : timedOut
      ? AlertTriangle
      : finalized
        ? CheckCircle2
        : Clock3;

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${
            failed
              ? "bg-red-500/10 text-red-500"
              : timedOut
                ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                : finalized
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : "bg-[var(--accent-soft)] text-[var(--accent)]"
          }`}
        >
          <Icon size={17} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {transaction.title}
          </p>

          <p className="mt-1 font-mono text-[11px] text-[var(--muted)]">
            {truncateMiddle(
              transaction.hash,
              10,
              8,
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <State
          label="Consensus"
          value={
            transaction.consensusStatus
          }
        />

        <State
          label="Execution"
          value={
            transaction.executionStatus
          }
        />
      </div>

      {timedOut && (
        <p className="mt-3 rounded-xl bg-[var(--warning-soft)] px-3 py-2.5 text-[11px] leading-5 text-[var(--warning)]">
          Timeout is not success or finalization. PolicyDelta preserves this state and continues bounded tracking.
        </p>
      )}

      {transaction.pollingPaused &&
        !terminal(
          transaction.consensusStatus,
        ) && (
          <p className="mt-3 rounded-xl bg-[var(--surface-strong)] px-3 py-2.5 text-[11px] leading-5 text-[var(--muted)]">
            Automatic tracking window ended. The last trustworthy status is preserved; use Refresh to query Bradbury again.
          </p>
        )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <a
          href={`${GENLAYER_EXPLORER_URL}/tx/${transaction.hash}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-text)]"
        >
          View transaction
          <ArrowUpRight
            size={13}
          />
        </a>

        {!finalized && (
          <button
            type="button"
            onClick={() =>
              void onRefresh()
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-[11px] font-semibold transition hover:bg-[var(--surface-strong)]"
          >
            <RefreshCcw
              size={12}
            />
            Refresh
          </button>
        )}
      </div>
    </article>
  );
}

function State({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--surface-strong)] px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 break-all text-[10px] font-semibold">
        {value}
      </p>
    </div>
  );
}
