"use client";

import {
  changeClassLabel,
  humanizeEnum,
} from "@/lib/contract/presentation";
import {
  truncateMiddle,
} from "@/lib/utils";
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
  Activity,
  ArrowRight,
  Clock3,
  FileText,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export function AccountOverview() {
  const {
    address,
  } = useWallet();

  const {
    activity,
    configured,
    isLoading: accountLoading,
  } = useAccount();

  const {
    policies,
    indexedCount,
    loading: policyLoading,
  } = useWalletPolicySummaries();

  if (!address) {
    return (
      <section className="mt-8 panel px-6 py-16 text-center">
        <ShieldCheck
          size={24}
          className="mx-auto text-[var(--accent)]"
        />

        <h2 className="mt-4 text-xl font-semibold tracking-[-0.035em]">
          Connect your wallet
        </h2>

        <p className="mx-auto mt-2 max-w-[560px] text-sm leading-6 text-[var(--muted)]">
          PolicyDelta will load the policies and verified activity associated with the connected Bradbury wallet.
        </p>
      </section>
    );
  }

  if (
    !configured &&
    !accountLoading
  ) {
    return (
      <section className="mt-8 panel px-6 py-16 text-center">
        <Clock3
          size={24}
          className="mx-auto text-[var(--warning)]"
        />

        <h2 className="mt-4 text-xl font-semibold tracking-[-0.035em]">
          Account index unavailable here
        </h2>

        <p className="mx-auto mt-2 max-w-[600px] text-sm leading-6 text-[var(--muted)]">
          The wallet is connected, but this deployment does not currently expose the PolicyDelta account database. Live Bradbury policy lookup still works normally.
        </p>
      </section>
    );
  }

  const awaitingConsent =
    policies.filter(
      (policy) =>
        policy.openStatus ===
        "AWAITING_CONSENT",
    ).length;

  const openProposals =
    policies.filter(
      (policy) =>
        policy.openVersion > 0,
    ).length;

  const finalizedActivity =
    activity.filter(
      (item) =>
        item.consensusStatus ===
          "FINALIZED" &&
        item.executionStatus ===
          "FINISHED_WITH_RETURN",
    ).length;

  return (
    <>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Your policies"
          value={
            accountLoading
              ? "…"
              : String(
                  indexedCount,
                )
          }
          detail="Verified wallet associations"
          icon={
            <ShieldCheck
              size={18}
            />
          }
        />

        <Metric
          label="Awaiting consent"
          value={
            policyLoading
              ? "…"
              : String(
                  awaitingConsent,
                )
          }
          detail="Material proposals"
          icon={
            <Clock3 size={18} />
          }
        />

        <Metric
          label="Open proposals"
          value={
            policyLoading
              ? "…"
              : String(
                  openProposals,
                )
          }
          detail="Across your indexed policies"
          icon={
            <FileText size={18} />
          }
        />

        <Metric
          label="Finalized activity"
          value={
            accountLoading
              ? "…"
              : String(
                  finalizedActivity,
                )
          }
          detail="Successful verified writes"
          icon={
            <Activity size={18} />
          }
        />
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
                Your policy workspace
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
                Live Bradbury authority
              </h2>
            </div>

            <Link
              href="/app/policies"
              className="button-secondary"
            >
              View policies
              <ArrowRight
                size={15}
              />
            </Link>
          </div>

          {policyLoading && (
            <div className="mt-7 flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
              Loading current Bradbury state…
            </div>
          )}

          {!policyLoading &&
            policies.length ===
              0 && (
              <div className="mt-7 rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface)] px-6 py-12 text-center">
                <FileText
                  size={21}
                  className="mx-auto text-[var(--muted)]"
                />

                <p className="mt-4 font-semibold">
                  No indexed policies yet
                </p>

                <p className="mx-auto mt-2 max-w-[520px] text-sm leading-6 text-[var(--muted)]">
                  New PolicyDelta activity will be indexed automatically. If this wallet already owns an older policy, open Policies and import it once by its Bradbury policy ID.
                </p>
              </div>
            )}

          {!policyLoading &&
            policies.length >
              0 && (
              <div className="mt-7 grid gap-3">
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
                      <div className="flex flex-wrap items-start justify-between gap-3">
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

                        <span className="badge bg-[var(--success-soft)] text-[var(--success)]">
                          V
                          {
                            policy.activeVersion
                          }{" "}
                          {humanizeEnum(
                            policy.activeStatus,
                          )}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                        <span>
                          Next V
                          {
                            policy.nextVersion
                          }
                        </span>

                        <span>·</span>

                        <span>
                          {policy.openVersion >
                          0
                            ? `Open V${policy.openVersion}`
                            : "No open proposal"}
                        </span>

                        {policy.openStatus && (
                          <>
                            <span>
                              ·
                            </span>

                            <span>
                              {changeClassLabel(
                                policy.openStatus,
                                policy.changeClass ??
                                  "",
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}
        </div>

        <div className="panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
            Connected account
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
            Bradbury wallet
          </h2>

          <div className="mt-7 space-y-2">
            <Row
              label="Address"
              value={truncateMiddle(
                address,
                10,
                8,
              )}
              mono
            />

            <Row
              label="Indexed policies"
              value={String(
                indexedCount,
              )}
            />

            <Row
              label="Indexed activity"
              value={String(
                activity.length,
              )}
            />

            <Row
              label="Network"
              value="Chain 4221"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Metric({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[var(--muted)]">
          {label}
        </p>

        <span className="grid size-9 place-items-center rounded-xl bg-[var(--surface-strong)] text-[var(--muted-strong)]">
          {icon}
        </span>
      </div>

      <p className="mt-8 text-3xl font-semibold tracking-[-0.055em]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        {detail}
      </p>
    </article>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--surface)] px-4 py-3 text-sm">
      <span className="text-[var(--muted)]">
        {label}
      </span>

      <span
        className={
          mono
            ? "font-mono text-xs font-semibold"
            : "text-xs font-semibold"
        }
      >
        {value}
      </span>
    </div>
  );
}
