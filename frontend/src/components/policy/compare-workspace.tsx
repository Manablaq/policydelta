"use client";

import {
  changeClassLabel,
} from "@/lib/contract/presentation";

import {
  usePolicyVersion,
} from "@/hooks/use-policy";
import {
  useWalletPolicySummaries,
} from "@/hooks/use-wallet-policies";
import {
  humanizeEnum,
  statusClasses,
} from "@/lib/contract/presentation";
import { diffWords } from "diff";
import {
  AlertTriangle,
  ArrowRight,
  GitCompare,
  LoaderCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useState,
} from "react";

export function CompareWorkspace({
  initialPolicyId,
  initialFrom,
  initialTo,
}: {
  initialPolicyId: string;
  initialFrom: number;
  initialTo: number;
}) {
  const router = useRouter();

  const {
    policies: walletPolicies,
    loading: walletPoliciesLoading,
  } = useWalletPolicySummaries();

  const [policyId, setPolicyId] =
    useState(initialPolicyId);

  const [fromVersion, setFromVersion] =
    useState(
      initialFrom > 0
        ? String(initialFrom)
        : "",
    );

  const [toVersion, setToVersion] =
    useState(
      initialTo > 0
        ? String(initialTo)
        : "",
    );

  const selectedIndexedPolicy =
    walletPolicies.find(
      (item) =>
        item.policyId === policyId,
    ) ?? null;

  const availableVersions =
    selectedIndexedPolicy
      ? Array.from(
          {
            length: Math.max(
              0,
              selectedIndexedPolicy.nextVersion -
                1,
            ),
          },
          (_, index) => index + 1,
        )
      : [];

  function chooseIndexedPolicy(
    nextPolicyId: string,
  ) {
    setPolicyId(nextPolicyId);

    const selected =
      walletPolicies.find(
        (item) =>
          item.policyId ===
          nextPolicyId,
      );

    if (!selected) {
      return;
    }

    if (
      selected.openVersion > 0
    ) {
      setFromVersion(
        String(
          selected.activeVersion,
        ),
      );

      setToVersion(
        String(
          selected.openVersion,
        ),
      );

      return;
    }

    const latest =
      Math.max(
        1,
        selected.nextVersion - 1,
      );

    const previous =
      Math.max(
        1,
        latest - 1,
      );

    setFromVersion(
      String(previous),
    );

    setToVersion(
      String(latest),
    );
  }

  const hasSelection =
    Boolean(initialPolicyId) &&
    initialFrom > 0 &&
    initialTo > 0;

  const from =
    usePolicyVersion(
      initialPolicyId,
      initialFrom,
      hasSelection,
    );

  const to =
    usePolicyVersion(
      initialPolicyId,
      initialTo,
      hasSelection,
    );

  function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const fromNumber =
      Number(fromVersion);

    const toNumber =
      Number(toVersion);

    if (
      !policyId.trim() ||
      !Number.isInteger(fromNumber) ||
      fromNumber < 1 ||
      !Number.isInteger(toNumber) ||
      toNumber < 1
    ) {
      return;
    }

    router.push(
      `/app/compare?policyId=${encodeURIComponent(
        policyId.trim(),
      )}&from=${fromNumber}&to=${toNumber}`,
    );
  }

  return (
    <div className="space-y-4">
      {(walletPoliciesLoading ||
        walletPolicies.length > 0) && (
        <section className="panel p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[650px]">
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--accent)]">
                Connected wallet
              </p>

              <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em]">
                Compare one of your policies
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Choose an indexed policy and PolicyDelta will populate its real recorded version range from Bradbury. You can still enter any exact policy ID manually below.
              </p>
            </div>

            <label className="block w-full lg:max-w-[360px]">
              <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">
                Your indexed policy
              </span>

              <select
                aria-label="Your indexed policy"
                value={
                  selectedIndexedPolicy
                    ?.policyId ?? ""
                }
                onChange={(event) =>
                  chooseIndexedPolicy(
                    event.target.value,
                  )
                }
                disabled={
                  walletPoliciesLoading
                }
                className="form-input"
              >
                <option value="">
                  {walletPoliciesLoading
                    ? "Loading wallet policies…"
                    : "Choose a policy"}
                </option>

                {walletPolicies.map(
                  (item) => (
                    <option
                      key={
                        item.policyId
                      }
                      value={
                        item.policyId
                      }
                    >
                      {item.policyId}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>
        </section>
      )}

      <form
        onSubmit={submit}
        className="panel p-5"
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_150px_32px_150px_auto] lg:items-end">
          <Field label="Policy ID">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />

              <input
                value={policyId}
                onChange={(event) =>
                  setPolicyId(
                    event.target.value,
                  )
                }
                placeholder="Policy ID"
                className="form-input"
                style={{
                  paddingLeft: "2.35rem",
                }}
              />
            </div>
          </Field>

          <Field label="From">
            {selectedIndexedPolicy ? (
              <select
                aria-label="From version"
                value={fromVersion}
                onChange={(event) =>
                  setFromVersion(
                    event.target.value,
                  )
                }
                className="form-input"
              >
                {availableVersions.map(
                  (version) => (
                    <option
                      key={version}
                      value={version}
                    >
                      V{version}
                    </option>
                  ),
                )}
              </select>
            ) : (
              <input
                aria-label="From version"
                type="number"
                min={1}
                step={1}
                value={fromVersion}
                onChange={(event) =>
                  setFromVersion(
                    event.target.value,
                  )
                }
                placeholder="Version"
                className="form-input"
              />
            )}
          </Field>

          <ArrowRight
            size={17}
            className="hidden self-center justify-self-center text-[var(--muted)] lg:block"
          />

          <Field label="To">
            {selectedIndexedPolicy ? (
              <select
                aria-label="To version"
                value={toVersion}
                onChange={(event) =>
                  setToVersion(
                    event.target.value,
                  )
                }
                className="form-input"
              >
                {availableVersions.map(
                  (version) => (
                    <option
                      key={version}
                      value={version}
                    >
                      V{version}
                    </option>
                  ),
                )}
              </select>
            ) : (
              <input
                aria-label="To version"
                type="number"
                min={1}
                step={1}
                value={toVersion}
                onChange={(event) =>
                  setToVersion(
                    event.target.value,
                  )
                }
                placeholder="Version"
                className="form-input"
              />
            )}
          </Field>

          <button
            type="submit"
            className="button-primary"
          >
            Compare
          </button>
        </div>
      </form>

      {!hasSelection && (
        <div className="panel px-6 py-20 text-center">
          <GitCompare
            size={24}
            className="mx-auto text-[var(--muted)]"
          />

          <h2 className="mt-4 font-semibold">
            Select two versions
          </h2>

          <p className="mx-auto mt-2 max-w-[520px] text-sm leading-6 text-[var(--muted)]">
            Enter an exact policy ID and two version numbers, or open comparison directly from a policy&apos;s lineage.
          </p>
        </div>
      )}

      {hasSelection &&
        (from.isPending ||
          to.isPending) && (
          <div className="panel flex min-h-[280px] items-center justify-center gap-3 text-sm text-[var(--muted)]">
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
            Reading both versions from Bradbury…
          </div>
        )}

      {hasSelection &&
        (from.isError ||
          to.isError) && (
          <div className="panel border-red-500/20 p-6 text-sm text-red-500">
            One or both requested versions could not be read from Bradbury.
          </div>
        )}

      {from.data && to.data && (
        <>
          {to.data.parentVersion !==
            from.data.version && (
            <div className="flex items-start gap-3 rounded-2xl border border-[var(--warning)]/20 bg-[var(--warning-soft)] p-4 text-sm">
              <AlertTriangle
                size={17}
                className="mt-0.5 shrink-0 text-[var(--warning)]"
              />

              <p className="leading-6">
                V{to.data.version}&apos;s direct parent is V
                {to.data.parentVersion}, not V
                {from.data.version}. This comparison is still valid for inspection, but the on-chain verdict on V
                {to.data.version} was produced against its recorded parent.
              </p>
            </div>
          )}

          <section className="grid gap-4 xl:grid-cols-2">
            <VersionDiffCard
              side="before"
              version={from.data}
              otherText={
                to.data.policyText
              }
            />

            <VersionDiffCard
              side="after"
              version={to.data}
              otherText={
                from.data.policyText
              }
            />
          </section>

          <section className="panel p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--accent)]">
                  <ShieldCheck size={14} />
                  On-chain semantic verdict
                </div>

                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                  {changeClassLabel(to.data.status, to.data.changeClass)}
                </h2>

                <p className="mt-2 max-w-[650px] text-sm leading-6 text-[var(--muted)]">
                  The colored text above is a local textual-diff aid only. This materiality result comes from PolicyDelta&apos;s stored GenLayer review outcome.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`badge ${statusClasses(
                    to.data.status,
                  )}`}
                >
                  {humanizeEnum(
                    to.data.status,
                  )}
                </span>

                <span
                  className={`badge ${
                    to.data
                      .requiresReconsent
                      ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                      : "bg-[var(--success-soft)] text-[var(--success)]"
                  }`}
                >
                  {to.data
                    .requiresReconsent
                    ? "Re-consent required"
                    : "No re-consent required"}
                </span>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function VersionDiffCard({
  side,
  version,
  otherText,
}: {
  side: "before" | "after";
  version: {
    version: number;
    policyText: string;
    status: string;
    changeClass: string;
  };
  otherText: string;
}) {
  const parts =
    side === "before"
      ? diffWords(
          version.policyText,
          otherText,
        )
      : diffWords(
          otherText,
          version.policyText,
        );

  return (
    <article className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] p-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
            {side === "before"
              ? "Earlier version"
              : "Later version"}
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-[-0.035em]">
            Version {version.version}
          </h2>
        </div>

        <span
          className={`badge ${statusClasses(
            version.status,
          )}`}
        >
          {humanizeEnum(
            version.status,
          )}
        </span>
      </div>

      <div className="min-h-[330px] bg-[var(--surface)] p-6">
        <p className="whitespace-pre-wrap text-[15px] leading-8">
          {parts.map(
            (part, index) => {
              if (
                side === "before" &&
                part.added
              ) {
                return null;
              }

              if (
                side === "after" &&
                part.removed
              ) {
                return null;
              }

              const changed =
                side === "before"
                  ? part.removed
                  : part.added;

              return (
                <span
                  key={`${index}-${part.value.slice(
                    0,
                    12,
                  )}`}
                  className={
                    changed
                      ? side ===
                        "before"
                        ? "rounded bg-red-500/12 px-0.5 text-red-600 dark:text-red-400"
                        : "rounded bg-[var(--success-soft)] px-0.5 text-[var(--success)]"
                      : undefined
                  }
                >
                  {part.value}
                </span>
              );
            },
          )}
        </p>
      </div>

      <div className="border-t border-[var(--line)] px-5 py-4">
        <p className="text-[11px] leading-5 text-[var(--muted)]">
          Highlighting represents literal text additions/removals, not an independent semantic judgment.
        </p>
      </div>
    </article>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
