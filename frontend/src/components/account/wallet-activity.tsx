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
} from "lucide-react";
import Link from "next/link";

export function WalletActivity() {
  const {
    address,
  } = useWallet();

  const {
    activity,
    configured,
    isLoading,
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

        <p className="mx-auto mt-2 max-w-[540px] text-sm leading-6 text-[var(--muted)]">
          Persistent PolicyDelta transaction history is organized by the connected Bradbury wallet.
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
        Loading wallet activity…
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="mt-8 panel px-6 py-16 text-center">
        <Clock3
          size={22}
          className="mx-auto text-[var(--warning)]"
        />

        <h2 className="mt-4 font-semibold">
          Persistent activity unavailable
        </h2>

        <p className="mx-auto mt-2 max-w-[560px] text-sm leading-6 text-[var(--muted)]">
          This deployment has no account database configured. Browser-local transaction tracking remains available from the activity button in the top bar.
        </p>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="mt-8 panel px-6 py-20 text-center">
        <Activity
          size={22}
          className="mx-auto text-[var(--accent)]"
        />

        <h2 className="mt-4 font-semibold">
          No indexed activity yet
        </h2>

        <p className="mx-auto mt-2 max-w-[560px] text-sm leading-6 text-[var(--muted)]">
          Future PolicyDelta writes from this wallet will appear here across browsers and deployments after Bradbury verification.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 panel overflow-hidden">
      <div className="border-b border-[var(--line)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
          Persistent wallet history
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
          Verified PolicyDelta activity
        </h2>
      </div>

      <div className="divide-y divide-[var(--line)]">
        {activity.map(
          (item) => {
            const successful =
              item.consensusStatus ===
                "FINALIZED" &&
              item.executionStatus ===
                "FINISHED_WITH_RETURN";

            return (
              <article
                key={item.hash}
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
                      ) : (
                        <Clock3
                          size={16}
                          className="text-[var(--warning)]"
                        />
                      )}

                      <p className="font-semibold">
                        {item.methodVerified
                          ? humanizeAction(
                              item.functionName,
                            )
                          : "PolicyDelta contract write"}
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

                    <span className="badge bg-[var(--surface-strong)] text-[var(--muted-strong)]">
                      {
                        item.executionStatus
                      }
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]">
                  <span>
                    {new Date(
                      item.updatedAt,
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
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}
