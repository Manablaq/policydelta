"use client";

import type {
  PrincipalReviewAlert,
} from "@/lib/account/types";
import type {
  GenLayerTransactionHash,
} from "@/lib/genlayer/client";
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
  AlertTriangle,
  ArrowUpRight,
  LoaderCircle,
  RefreshCw,
  Scale,
} from "lucide-react";
import Link from "next/link";
import {
  useState,
} from "react";
import {
  toast,
} from "sonner";

export function PrincipalAppealCenter() {
  const {
    principalReviewAlerts,
    refresh,
    isRefreshing,
  } = useAccount();

  if (
    principalReviewAlerts.length ===
    0
  ) {
    return null;
  }

  return (
    <section
      className="mb-8 space-y-4"
      aria-label="Principal appeal alerts"
    >
      {principalReviewAlerts.map(
        (alert) => (
          <PrincipalAppealAlert
            key={alert.hash}
            alert={alert}
            refresh={refresh}
            refreshing={isRefreshing}
          />
        ),
      )}
    </section>
  );
}

function PrincipalAppealAlert({
  alert,
  refresh,
  refreshing,
}: {
  alert: PrincipalReviewAlert;
  refresh: () => Promise<void>;
  refreshing: boolean;
}) {
  const {
    address,
    isBradbury,
    ensureBradbury,
    prepareWriteClient,
  } = useWallet();

  const [appealing, setAppealing] =
    useState(false);

  async function submitAppeal() {
    if (!address) {
      toast.error(
        "Connect the principal wallet before appealing.",
      );
      return;
    }

    setAppealing(true);

    try {
      if (!isBradbury) {
        await ensureBradbury();
      }

      const client =
        await prepareWriteClient();

      const txId =
        alert.hash as GenLayerTransactionHash;

      if (
        !(await client.canAppeal({
          txId,
        }))
      ) {
        toast.warning(
          "This transaction is no longer appealable. Refreshing its finality state.",
        );
        await refresh();
        return;
      }

      const value =
        alert.minAppealBond === null
          ? await client
              .getMinAppealBond({
                txId,
              })
          : BigInt(
              alert.minAppealBond,
            );

      await client.appealTransaction({
        txId,
        value,
      });

      toast.success(
        `Appeal submitted for ${alert.policyId} V${alert.version}.`,
      );

      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The appeal could not be submitted.",
      );
    } finally {
      setAppealing(false);
    }
  }

  const bond = formatBond(
    alert.minAppealBond,
  );

  return (
    <article
      role="alert"
      className="rounded-[22px] border border-[var(--warning)] bg-[var(--warning-soft)] p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--warning)]">
            <AlertTriangle
              size={20}
            />
          </span>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--warning)]">
              Principal action · automatic authority change
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
              NON_MATERIAL review accepted — appeal before finality
            </h2>

            <p className="mt-2 max-w-[820px] text-sm leading-6 text-[var(--muted-strong)]">
              Validators provisionally activated {alert.policyId} V{alert.version} without re-consent. V{alert.previousFinalizedVersion} remains the authority shown by PolicyDelta&apos;s finalized read path until this review reaches finality.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <span className="badge bg-[var(--surface)] text-[var(--warning)]">
            {alert.consensusStatus.replaceAll(
              "_",
              " ",
            )}
          </span>

          <span className="badge bg-[var(--surface)] text-[var(--muted-strong)]">
            {alert.canAppeal
              ? "Appeal open"
              : alert.appealCheckAvailable
                ? "Appeal unavailable"
                : "Appeal check retrying"}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <PolicyText
          label={`Finalized authority · V${alert.previousFinalizedVersion}`}
          text={
            alert.previousFinalizedPolicyText
          }
        />

        <PolicyText
          label={`Provisional review result · V${alert.version}`}
          text={
            alert.provisionalPolicyText
          }
          warning
        />
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-[var(--line-strong)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs leading-5 text-[var(--muted-strong)]">
          <p>
            Transaction {truncateMiddle(
              alert.hash,
              12,
              10,
            )} · {new Date(
              alert.submittedAt,
            ).toLocaleString()}
          </p>

          <p className="mt-1 font-semibold">
            {alert.canAppeal
              ? `Live appeal eligibility confirmed${bond ? ` · minimum bond ${bond}` : ""}`
              : "Eligibility is checked live on every account refresh."}{" "}
            · checked {new Date(
              alert.appealCheckedAt,
            ).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/app/policies/${encodeURIComponent(
              alert.policyId,
            )}`}
            className="button-secondary"
          >
            Inspect policy
          </Link>

          <a
            href={`https://explorer-bradbury.genlayer.com/transactions/${alert.hash}`}
            target="_blank"
            rel="noreferrer"
            className="button-secondary"
          >
            Explorer
            <ArrowUpRight
              size={14}
            />
          </a>

          {!alert.canAppeal && (
            <button
              type="button"
              onClick={() =>
                void refresh()
              }
              disabled={refreshing}
              className="button-secondary"
            >
              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? "animate-spin"
                    : undefined
                }
              />
              Recheck
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              void submitAppeal()
            }
            disabled={
              !alert.canAppeal ||
              appealing
            }
            className="button-primary"
          >
            {appealing ? (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            ) : (
              <Scale size={15} />
            )}
            Appeal verdict
          </button>
        </div>
      </div>
    </article>
  );
}

function formatBond(
  value: string | null,
) {
  if (value === null) {
    return null;
  }

  try {
    return `${BigInt(
      value,
    ).toLocaleString()} wei`;
  } catch {
    return null;
  }
}

function PolicyText({
  label,
  text,
  warning = false,
}: {
  label: string;
  text: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        warning
          ? "border-[var(--warning)] bg-[var(--surface)]"
          : "border-[var(--line)] bg-[var(--surface)]"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap text-sm leading-6 text-[var(--muted-strong)]">
        {text}
      </p>
    </div>
  );
}
