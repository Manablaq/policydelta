"use client";

import {
  useWalletPolicySummaries,
} from "@/hooks/use-wallet-policies";
import {
  useAccount,
} from "@/providers/account-provider";
import {
  useWallet,
} from "@/providers/wallet-provider";
import {
  ArrowRight,
  FileText,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export function WalletPolicies() {
  const {
    address,
  } = useWallet();

  const {
    error,
    refresh,
    isRefreshing,
  } = useAccount();

  const {
    policies,
    policyCount,
    loading,
  } =
    useWalletPolicySummaries();

  if (!address) {
    return (
      <section className="panel p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={18}
            className="mt-0.5 text-[var(--accent)]"
          />

          <div>
            <h2 className="font-semibold">
              Your policies
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Connect a wallet to reconstruct its PolicyDelta policies directly from Bradbury.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
            Connected wallet
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
            Your policies
          </h2>

          <p className="mt-2 max-w-[720px] text-sm leading-6 text-[var(--muted)]">
            PolicyDelta reconstructs this wallet&apos;s real transaction history from Bradbury, discovers its policies automatically, then reads their current authority directly from the deployed contract.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge bg-[var(--accent-soft)] text-[var(--accent-text)]">
            {policyCount} discovered
          </span>

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
            Refresh chain
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl bg-[var(--warning-soft)] p-4 text-sm leading-6 text-[var(--warning)]">
          Bradbury discovery could not refresh: {error}
        </div>
      )}

      {loading && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
          <LoaderCircle
            size={17}
            className="animate-spin"
          />
          Reconstructing wallet history and loading live policy state…
        </div>
      )}

      {!loading &&
        policies.length ===
          0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-12 text-center">
            <FileText
              size={21}
              className="mx-auto text-[var(--muted)]"
            />

            <h3 className="mt-4 font-semibold">
              No PolicyDelta policies found
            </h3>

            <p className="mx-auto mt-2 max-w-[560px] text-sm leading-6 text-[var(--muted)]">
              Bradbury does not currently show a PolicyDelta policy owned or published by this wallet.
            </p>
          </div>
        )}

      {!loading &&
        policies.length >
          0 && (
          <div className="mt-6 grid gap-3">
            {policies.map(
              (policy) => (
                <Link
                  key={
                    policy.policyId
                  }
                  href={`/app/policies/${encodeURIComponent(
                    policy.policyId,
                  )}`}
                  className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:border-[var(--line-strong)] hover:bg-[var(--surface-strong)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {
                          policy.policyId
                        }
                      </p>

                      <p className="mt-1 text-xs capitalize text-[var(--muted)]">
                        {
                          policy.role
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="badge bg-[var(--success-soft)] text-[var(--success)]">
                        Active V
                        {
                          policy.activeVersion
                        }
                      </span>

                      <ArrowRight
                        size={15}
                        className="text-[var(--muted)] transition group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </Link>
              ),
            )}
          </div>
        )}
    </section>
  );
}
