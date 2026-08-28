"use client";

import {
  truncateMiddle,
} from "@/lib/utils";
import {
  useAccount,
} from "@/providers/account-provider";
import {
  useWallet,
} from "@/providers/wallet-provider";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export function WalletActivity() {
  const {
    address,
  } = useWallet();

  const {
    activity,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useAccount();

  if (!address) {
    return (
      <div className="mt-8 panel px-6 py-20 text-center">
        <Activity
          size={22}
          className="mx-auto text-[var(--accent)]"
        />

        <h2 className="mt-4 font-semibold">
          Connect a wallet
        </h2>

        <p className="mx-auto mt-2 max-w-[560px] text-sm leading-6 text-[var(--muted)]">
          PolicyDelta will reconstruct that wallet&apos;s contract activity directly from Bradbury.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-8 panel flex items-center justify-center gap-3 px-6 py-20 text-sm text-[var(--muted)]">
        <LoaderCircle
          size={18}
          className="animate-spin"
        />
        Reconstructing Bradbury wallet activity…
      </div>
    );
  }

  if (
    error &&
    activity.length === 0
  ) {
    return (
      <div className="mt-8 panel px-6 py-16 text-center">
        <Clock3
          size={22}
          className="mx-auto text-[var(--warning)]"
        />

        <h2 className="mt-4 font-semibold">
          Bradbury history unavailable
        </h2>

        <p className="mx-auto mt-2 max-w-[600px] text-sm leading-6 text-[var(--muted)]">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            void refresh()
          }
          className="button-secondary mt-5"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  if (
    activity.length === 0
  ) {
    return (
      <div className="mt-8 panel px-6 py-20 text-center">
        <Activity
          size={22}
          className="mx-auto text-[var(--accent)]"
        />

        <h2 className="mt-4 font-semibold">
          No PolicyDelta activity found
        </h2>

        <p className="mx-auto mt-2 max-w-[580px] text-sm leading-6 text-[var(--muted)]">
          No PolicyDelta contract calls from this wallet were discovered on Bradbury.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 panel overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
            Bradbury wallet history
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
            Verified PolicyDelta activity
          </h2>

          <p className="mt-2 max-w-[620px] text-sm leading-6 text-[var(--muted)]">
            Reconstructed from PolicyDelta&apos;s real NewTransaction events and GenLayer transaction records.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void refresh()
          }
          disabled={
            isRefreshing
          }
          className="button-secondary"
        >
          <RefreshCw
            size={14}
            className={
              isRefreshing
                ? "animate-spin"
                : undefined
            }
          />
          Refresh
        </button>
      </div>

      <div className="divide-y divide-[var(--line)]">
        {activity.map(
          (item) => {
            const successful =
              item.consensusStatus ===
                "FINALIZED" &&
              item.executionStatus ===
                "FINISHED_WITH_RETURN";

            const failed =
              item.executionStatus ===
              "FINISHED_WITH_ERROR";

            return (
              <article
                key={
                  item.hash
                }
                className="p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {successful ? (
                        <CheckCircle2
                          size={16}
                          className="text-[var(--success)]"
                        />
                      ) : failed ? (
                        <XCircle
                          size={16}
                          className="text-[var(--danger)]"
                        />
                      ) : (
                        <Clock3
                          size={16}
                          className="text-[var(--warning)]"
                        />
                      )}

                      <p className="font-semibold">
                        {humanizeAction(
                          item.functionName,
                        )}
                      </p>
                    </div>

                    {item.policyId && (
                      <Link
                        href={`/app/policies/${encodeURIComponent(
                          item.policyId,
                        )}`}
                        className="mt-2 inline-block text-sm font-medium text-[var(--accent-text)] hover:underline"
                      >
                        {
                          item.policyId
                        }
                      </Link>
                    )}

                    <p className="mt-2 font-mono text-xs text-[var(--muted)]">
                      {truncateMiddle(
                        item.hash,
                        12,
                        10,
                      )}
                    </p>

                    {item.relationship ===
                      "affected_principal" && (
                      <p className="mt-2 text-xs font-semibold text-[var(--warning)]">
                        Submitted by another account · affects you as principal
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`badge ${
                        item.consensusStatus ===
                        "FINALIZED"
                          ? "bg-[var(--success-soft)] text-[var(--success)]"
                          : "bg-[var(--warning-soft)] text-[var(--warning)]"
                      }`}
                    >
                      {
                        item.consensusStatus
                      }
                    </span>

                    <span
                      className={`badge ${
                        failed
                          ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                          : "bg-[var(--surface-strong)] text-[var(--muted-strong)]"
                      }`}
                    >
                      {
                        item.executionStatus
                      }
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]">
                  <span>
                    {new Date(
                      item.submittedAt,
                    ).toLocaleString()}
                  </span>

                  <a
                    href={`https://explorer-bradbury.genlayer.com/transactions/${item.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[var(--accent-text)]"
                  >
                    Explorer
                    <ArrowUpRight
                      size={13}
                    />
                  </a>
                </div>
              </article>
            );
          },
        )}
      </div>
    </div>
  );
}

function humanizeAction(
  value: string,
) {
  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}
