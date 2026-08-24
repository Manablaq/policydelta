"use client";

import {
  changeClassLabel,
  reconsentLabel,
} from "@/lib/contract/presentation";

import { PolicyActions } from "@/components/policy/policy-actions";
import {
  useActiveVersion,
  useAuthorization,
  usePolicy,
  usePolicyVersion,
} from "@/hooks/use-policy";
import {
  humanizeEnum,
  statusClasses,
} from "@/lib/contract/presentation";
import { truncateMiddle } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";

export function PolicyLookup() {
  const [input, setInput] =
    useState("");

  const [policyId, setPolicyId] =
    useState("");

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

  function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const next = input.trim();

    if (!next) return;

    setPolicyId(next);
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={submit}
        className="panel p-4"
      >
        <label
          htmlFor="policy-search"
          className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]"
        >
          Policy ID
        </label>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="flex h-12 flex-1 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 focus-within:border-[var(--accent)]">
            <Search
              size={16}
              className="shrink-0 text-[var(--muted)]"
            />

            <input
              id="policy-search"
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value,
                )
              }
              placeholder="Enter an exact PolicyDelta policy ID"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            className="button-primary disabled:cursor-not-allowed disabled:opacity-45"
          >
            Load policy
          </button>
        </div>

        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
          PolicyDelta does not invent a registry that the contract does not expose. Lookups read the exact policy ID directly from Bradbury.
        </p>
      </form>

      {!policyId && (
        <EmptyLookup />
      )}

      {policyId &&
        policy.isPending && (
          <LoadingLookup />
        )}

      {policyId &&
        policy.isError && (
          <ErrorLookup
            message={
              policy.error instanceof
              Error
                ? policy.error.message
                : "Bradbury could not return this policy."
            }
          />
        )}

      {policy.data &&
        !policy.data.exists && (
          <ErrorLookup message="The contract returned no existing policy for that ID." />
        )}

      {policy.data &&
        policy.data.exists && (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
              <PolicyMetadata
                policy={policy.data}
              />

              <div className="space-y-4">
                <VersionCard
                  title="Active authority"
                  version={
                    active.data
                  }
                  loading={
                    active.isPending
                  }
                  authorized={
                    authorization.data
                  }
                />

                {openVersionNumber >
                0 ? (
                  <VersionCard
                    title="Open proposal"
                    version={
                      openVersion.data
                    }
                    loading={
                      openVersion.isPending
                    }
                    authorized={false}
                  />
                ) : (
                  <div className="panel p-6">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle2
                        size={17}
                        className="text-[var(--success)]"
                      />
                      No open proposal
                    </div>

                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      The policy currently has no pending replacement version.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <PolicyActions
              policy={policy.data}
              openVersion={
                openVersion.data
              }
              openVersionLoading={
                openVersion.isPending
              }
            />

            <div className="flex justify-end">
              <Link
                href={`/app/policies/${encodeURIComponent(
                  policy.data.policyId,
                )}`}
                className="button-secondary group"
              >
                Open full policy detail
                <ArrowRight
                  size={15}
                  className="transition group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        )}
    </div>
  );
}

function EmptyLookup() {
  return (
    <div className="panel px-6 py-20 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--surface-strong)] text-[var(--muted)]">
        <FileText size={20} />
      </div>

      <h2 className="mt-4 font-semibold">
        Inspect live policy state
      </h2>

      <p className="mx-auto mt-2 max-w-[500px] text-sm leading-6 text-[var(--muted)]">
        Enter a PolicyDelta policy ID to load its authority, lineage pointer, TTL configuration, active version, and open proposal directly from the deployed Bradbury contract.
      </p>
    </div>
  );
}

function LoadingLookup() {
  return (
    <div className="panel flex items-center justify-center gap-3 px-6 py-20 text-sm text-[var(--muted)]">
      <LoaderCircle
        size={18}
        className="animate-spin"
      />
      Reading Bradbury contract state…
    </div>
  );
}

function ErrorLookup({
  message,
}: {
  message: string;
}) {
  return (
    <div className="panel border-red-500/20 p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-500">
          <AlertCircle size={17} />
        </span>

        <div>
          <p className="text-sm font-semibold">
            Policy lookup failed
          </p>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

function PolicyMetadata({
  policy,
}: {
  policy: {
    policyId: string;
    principal: string;
    publisher: string;
    activeVersion: number;
    nextVersion: number;
    openVersion: number;
    reviewTtlSeconds: number;
    consentTtlSeconds: number;
    materialityRules: string;
  };
}) {
  return (
    <article className="panel p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck
          size={17}
          className="text-[var(--accent)]"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
          Live policy
        </p>
      </div>

      <h2 className="mt-4 break-all text-xl font-semibold tracking-[-0.035em]">
        {policy.policyId}
      </h2>

      <div className="mt-7 grid gap-2">
        <MetadataRow
          label="Principal"
          value={truncateMiddle(
            policy.principal,
            10,
            8,
          )}
          mono
        />

        <MetadataRow
          label="Publisher"
          value={truncateMiddle(
            policy.publisher,
            10,
            8,
          )}
          mono
        />

        <MetadataRow
          label="Active version"
          value={`V${policy.activeVersion}`}
        />

        <MetadataRow
          label="Open version"
          value={
            policy.openVersion > 0
              ? `V${policy.openVersion}`
              : "None"
          }
        />

        <MetadataRow
          label="Next version"
          value={`V${policy.nextVersion}`}
        />

        <MetadataRow
          label="Review TTL"
          value={formatDuration(
            policy.reviewTtlSeconds,
          )}
        />

        <MetadataRow
          label="Consent TTL"
          value={formatDuration(
            policy.consentTtlSeconds,
          )}
        />
      </div>

      <div className="mt-6 rounded-2xl bg-[var(--surface)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
          Materiality rules
        </p>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--muted-strong)]">
          {policy.materialityRules}
        </p>
      </div>
    </article>
  );
}

function VersionCard({
  title,
  version,
  loading,
  authorized,
}: {
  title: string;
  version:
    | {
        version: number;
        parentVersion: number;
        policyText: string;
        status: string;
        changeClass: string;
        requiresReconsent: boolean;
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
      <div className="panel flex items-center gap-3 p-6 text-sm text-[var(--muted)]">
        <LoaderCircle
          size={17}
          className="animate-spin"
        />
        Loading version…
      </div>
    );
  }

  return (
    <article className="panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Version {version.version}
          </h3>
        </div>

        <span
          className={`badge ${
            authorized
              ? "bg-[var(--success-soft)] text-[var(--success)]"
              : statusClasses(
                  version.status,
                )
          }`}
        >
          {authorized
            ? "Authorized"
            : humanizeEnum(
                version.status,
              )}
        </span>
      </div>

      <div className="mt-6 rounded-2xl bg-[var(--surface)] p-5">
        <p className="whitespace-pre-wrap text-sm leading-7">
          {version.policyText}
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <MetadataRow
          label="Parent"
          value={
            version.parentVersion > 0
              ? `V${version.parentVersion}`
              : "Genesis"
          }
        />

        <MetadataRow
          label="Change class"
          value={changeClassLabel(version.status, version.changeClass)}
        />

        <MetadataRow
          label="Re-consent"
          value={
            reconsentLabel(version.status, version.requiresReconsent)
          }
        />

        <MetadataRow
          label="Status"
          value={humanizeEnum(
            version.status,
          )}
        />
      </div>

      {(version.reviewDeadline > 0 ||
        version.consentDeadline > 0) && (
        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]">
          <Clock3 size={14} />
          Deadlines are enforced on-chain; expired versions are never treated as authorized.
        </div>
      )}
    </article>
  );
}

function MetadataRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 rounded-xl bg-[var(--surface-strong)] px-3 py-2.5 text-sm">
      <span className="text-[var(--muted)]">
        {label}
      </span>

      <span
        className={
          mono
            ? "break-all font-mono text-[11px] font-semibold"
            : "text-right text-xs font-semibold"
        }
      >
        {value}
      </span>
    </div>
  );
}

function formatDuration(
  seconds: number,
) {
  if (seconds <= 0) return "—";

  if (seconds % 3600 === 0) {
    const hours = seconds / 3600;

    return `${hours} hour${
      hours === 1 ? "" : "s"
    }`;
  }

  if (seconds % 60 === 0) {
    const minutes = seconds / 60;

    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    }`;
  }

  return `${seconds} seconds`;
}
