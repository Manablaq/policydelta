"use client";

import {
  changeClassLabel,
  reconsentLabel,
} from "@/lib/contract/presentation";

import { AppPageHeader } from "@/components/app-shell/app-shell";
import { PolicyActions } from "@/components/policy/policy-actions";
import {
  useActiveVersion,
  useAuthorization,
  usePolicy,
  usePolicyVersion,
} from "@/hooks/use-policy";
import { usePolicyLineage } from "@/hooks/use-policy-lineage";
import {
  formatUnixTime,
  humanizeEnum,
  statusClasses,
} from "@/lib/contract/presentation";
import { truncateMiddle } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  GitCompare,
  GitCommitHorizontal,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function PolicyDetail({
  policyId,
}: {
  policyId: string;
}) {
  const [visibleCount, setVisibleCount] =
    useState(12);

  const policy =
    usePolicy(policyId);

  const exists =
    policy.data?.exists === true;

  const active =
    useActiveVersion(
      policyId,
      exists,
    );

  const openVersionNumber =
    policy.data?.openVersion ?? 0;

  const openVersion =
    usePolicyVersion(
      policyId,
      openVersionNumber,
      exists &&
        openVersionNumber > 0,
    );

  const authorization =
    useAuthorization(
      policyId,
      policy.data?.activeVersion ?? 0,
      exists &&
        (policy.data?.activeVersion ??
          0) > 0,
    );

  const lineage =
    usePolicyLineage(
      policyId,
      policy.data?.nextVersion ?? 0,
      visibleCount,
    );

  if (policy.isPending) {
    return <LoadingState />;
  }

  if (
    policy.isError ||
    !policy.data ||
    !policy.data.exists
  ) {
    return (
      <MissingState
        policyId={policyId}
        message={
          policy.error instanceof Error
            ? policy.error.message
            : "Bradbury did not return an existing policy for this ID."
        }
      />
    );
  }

  const data = policy.data;

  return (
    <>
      <AppPageHeader
        eyebrow="Policy detail"
        title={data.policyId}
        description="Live authority state, semantic review outcome, version lineage, and permitted PolicyDelta actions from the deployed Bradbury contract."
        action={
          <Link
            href="/app/policies"
            className="button-secondary"
          >
            <ArrowLeft size={15} />
            Policies
          </Link>
        }
      />

      <section className="mt-8 grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <article className="panel p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={18}
              className="text-[var(--accent)]"
            />
            <h2 className="font-semibold">
              Authority configuration
            </h2>
          </div>

          <div className="mt-6 space-y-2">
            <MetadataRow
              label="Principal"
              value={truncateMiddle(
                data.principal,
                12,
                8,
              )}
              copyValue={data.principal}
            />

            <MetadataRow
              label="Publisher"
              value={truncateMiddle(
                data.publisher,
                12,
                8,
              )}
              copyValue={data.publisher}
            />

            <MetadataRow
              label="Active"
              value={`V${data.activeVersion}`}
            />

            <MetadataRow
              label="Open"
              value={
                data.openVersion
                  ? `V${data.openVersion}`
                  : "None"
              }
            />

            <MetadataRow
              label="Next"
              value={`V${data.nextVersion}`}
            />

            <MetadataRow
              label="Review TTL"
              value={`${data.reviewTtlSeconds.toLocaleString()} sec`}
            />

            <MetadataRow
              label="Consent TTL"
              value={`${data.consentTtlSeconds.toLocaleString()} sec`}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-[var(--surface)] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
              Materiality rubric
            </p>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--muted-strong)]">
              {data.materialityRules}
            </p>
          </div>
        </article>

        <div className="space-y-4">
          <AuthorityCard
              label="Finalized authority"
            version={active.data}
            loading={active.isPending}
            authorized={
              authorization.data
            }
          />

          {data.openVersion > 0 ? (
            <AuthorityCard
              label="Open proposal"
              version={openVersion.data}
              loading={
                openVersion.isPending
              }
              authorized={false}
            />
          ) : (
            <article className="panel p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[var(--success-soft)] text-[var(--success)]">
                  <CheckCircle2 size={18} />
                </span>

                <div>
                  <p className="font-semibold">
                    No open proposal
                  </p>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    There is currently no replacement version waiting in the policy lifecycle.
                  </p>
                </div>
              </div>
            </article>
          )}

          {openVersion.data &&
            openVersion.data.parentVersion >
              0 && (
              <Link
                href={`/app/compare?policyId=${encodeURIComponent(
                  data.policyId,
                )}&from=${
                  openVersion.data
                    .parentVersion
                }&to=${
                  openVersion.data.version
                }`}
                className="group flex items-center justify-between rounded-[20px] border border-[var(--accent-line)] bg-[var(--accent-soft)] p-5 transition hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-[var(--surface)] text-[var(--accent)]">
                    <GitCompare size={18} />
                  </span>

                  <div>
                    <p className="text-sm font-semibold">
                      Compare open change
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      V
                      {
                        openVersion.data
                          .parentVersion
                      }{" "}
                      → V
                      {
                        openVersion.data
                          .version
                      }
                    </p>
                  </div>
                </div>

                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </Link>
            )}
        </div>
      </section>

      <section className="mt-4">
        <PolicyActions
          policy={data}
          openVersion={
            openVersion.data
          }
          openVersionLoading={
            openVersion.isPending
          }
        />
      </section>

      <section className="mt-4 panel overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[var(--line)] p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
              Immutable lineage
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              Version history
            </h2>

            <p className="mt-2 max-w-[680px] text-sm leading-6 text-[var(--muted)]">
              Versions and authorization are read from Bradbury&apos;s finalized state. Accepted review results are surfaced separately during the protocol appeal window.
            </p>
          </div>

          <span className="code-pill">
            {Math.max(
              0,
              data.nextVersion - 1,
            )}{" "}
            version
            {data.nextVersion - 1 ===
            1
              ? ""
              : "s"}
          </span>
        </div>

        <div className="p-4 sm:p-6">
          {lineage.entries.length ===
          0 ? (
            <p className="text-sm text-[var(--muted)]">
              No versions returned.
            </p>
          ) : (
            <div className="space-y-3">
              {lineage.entries.map(
                ({
                  version,
                  query,
                }) => (
                  <LineageEntry
                    key={version}
                    policyId={
                      data.policyId
                    }
                    expectedVersion={
                      version
                    }
                    version={
                      query.data
                    }
                    loading={
                      query.isPending
                    }
                    failed={
                      query.isError
                    }
                  />
                ),
              )}
            </div>
          )}

          {lineage.hasEarlier && (
            <button
              type="button"
              onClick={() =>
                setVisibleCount(
                  (count) =>
                    count + 12,
                )
              }
              className="button-secondary mt-5 w-full"
            >
              Load earlier versions
            </button>
          )}
        </div>
      </section>
    </>
  );
}

function LoadingState() {
  return (
    <div className="panel flex min-h-[360px] items-center justify-center gap-3 text-sm text-[var(--muted)]">
      <LoaderCircle
        size={18}
        className="animate-spin"
      />
      Loading live policy…
    </div>
  );
}

function MissingState({
  policyId,
  message,
}: {
  policyId: string;
  message: string;
}) {
  return (
    <>
      <AppPageHeader
        eyebrow="Policy detail"
        title="Policy unavailable"
        description={`Policy ID: ${policyId}`}
      />

      <div className="mt-8 panel p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-red-500/10 text-red-500">
            <AlertCircle size={18} />
          </span>

          <div>
            <p className="font-semibold">
              Bradbury lookup failed
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {message}
            </p>

            <Link
              href="/app/policies"
              className="button-secondary mt-5"
            >
              <ArrowLeft size={15} />
              Back to policies
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function AuthorityCard({
  label,
  version,
  loading,
  authorized,
}: {
  label: string;
  version:
    | {
        version: number;
        parentVersion: number;
        policyText: string;
        status: string;
        changeClass: string;
        requiresReconsent: boolean;
        createdAt: number;
        reviewDeadline: number;
        consentDeadline: number;
      }
    | undefined;
  loading: boolean;
  authorized:
    | boolean
    | undefined;
}) {
  if (loading || !version) {
    return (
      <article className="panel flex items-center gap-3 p-6 text-sm text-[var(--muted)]">
        <LoaderCircle
          size={17}
          className="animate-spin"
        />
        Loading version…
      </article>
    );
  }

  return (
    <article className="panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
            {label}
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Version {version.version}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`badge ${statusClasses(
              version.status,
            )}`}
          >
            {humanizeEnum(
              version.status,
            )}
          </span>

          {authorized !== undefined && (
            <span
              className={`badge ${
                authorized
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : "bg-[var(--surface-strong)] text-[var(--muted)]"
              }`}
            >
              {authorized
                ? "Authorized"
                : "Not authorized"}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-[var(--surface)] p-5">
        <p className="whitespace-pre-wrap text-sm leading-7">
          {version.policyText}
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <SmallFact
          label="Parent"
          value={
            version.parentVersion
              ? `V${version.parentVersion}`
              : "Genesis"
          }
        />

        <SmallFact
          label="Verdict"
          value={changeClassLabel(version.status, version.changeClass)}
        />

        <SmallFact
          label="Re-consent"
          value={reconsentLabel(
            version.status,
            version.requiresReconsent,
          )}
        />

        <SmallFact
          label="Created"
          value={formatUnixTime(
            version.createdAt,
          )}
        />
      </div>

      {(version.reviewDeadline > 0 ||
        version.consentDeadline >
          0) && (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--muted)]">
          {version.reviewDeadline >
            0 && (
            <span className="flex items-center gap-1.5">
              <Clock3 size={13} />
              Review deadline:{" "}
              {formatUnixTime(
                version.reviewDeadline,
              )}
            </span>
          )}

          {version.consentDeadline >
            0 && (
            <span className="flex items-center gap-1.5">
              <Clock3 size={13} />
              Consent deadline:{" "}
              {formatUnixTime(
                version.consentDeadline,
              )}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function LineageEntry({
  policyId,
  expectedVersion,
  version,
  loading,
  failed,
}: {
  policyId: string;
  expectedVersion: number;
  version:
    | {
        version: number;
        parentVersion: number;
        status: string;
        changeClass: string;
        requiresReconsent: boolean;
        createdAt: number;
      }
    | undefined;
  loading: boolean;
  failed: boolean;
}) {
  if (loading) {
    return (
      <div className="flex min-h-20 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4">
        <LoaderCircle
          size={15}
          className="animate-spin text-[var(--muted)]"
        />
        <span className="text-sm text-[var(--muted)]">
          Loading V
          {expectedVersion}…
        </span>
      </div>
    );
  }

  if (failed || !version) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-4 text-sm text-red-500">
        Version V
        {expectedVersion} could not be read.
      </div>
    );
  }

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:border-[var(--line-strong)] sm:flex-row sm:items-center">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--surface-strong)] font-mono text-xs font-bold">
        V{version.version}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`badge ${statusClasses(
              version.status,
            )}`}
          >
            {humanizeEnum(
              version.status,
            )}
          </span>

          <span className="text-xs font-medium text-[var(--muted)]">
            {changeClassLabel(version.status, version.changeClass)}
          </span>

          {version.requiresReconsent && (
            <span className="text-xs font-semibold text-[var(--warning)]">
              Re-consent
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-[var(--muted)]">
          Parent:{" "}
          {version.parentVersion
            ? `V${version.parentVersion}`
            : "Genesis"}{" "}
          · Created{" "}
          {formatUnixTime(
            version.createdAt,
          )}
        </p>
      </div>

      {version.parentVersion > 0 && (
        <Link
          href={`/app/compare?policyId=${encodeURIComponent(
            policyId,
          )}&from=${
            version.parentVersion
          }&to=${version.version}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold transition hover:bg-[var(--surface-strong)]"
        >
          <GitCommitHorizontal
            size={14}
          />
          Compare
        </Link>
      )}
    </div>
  );
}

function SmallFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--surface-strong)] p-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold">
        {value}
      </p>
    </div>
  );
}

function MetadataRow({
  label,
  value,
  copyValue,
}: {
  label: string;
  value: string;
  copyValue?: string;
}) {
  async function copy() {
    if (!copyValue) return;

    await navigator.clipboard.writeText(
      copyValue,
    );

    toast.success(`${label} copied.`);
  }

  return (
    <div className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-[var(--surface)] px-3 py-2">
      <span className="text-xs text-[var(--muted)]">
        {label}
      </span>

      <div className="flex min-w-0 items-center gap-2">
        <span className="text-right font-mono text-[11px] font-semibold">
          {value}
        </span>

        {copyValue && (
          <button
            type="button"
            onClick={() => void copy()}
            aria-label={`Copy ${label}`}
            className="grid size-7 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--text)]"
          >
            <Copy size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
