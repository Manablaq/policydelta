"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type {
  PolicyRecord,
  PolicyVersionRecord,
} from "@/lib/contract/types";
import { usePolicyWrite } from "@/hooks/use-policy-write";
import {
  CheckCircle2,
  GitBranch,
  RefreshCcw,
  SearchCheck,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import {
  useState,
} from "react";
import { toast } from "sonner";

type PendingAction =
  | "review"
  | "consent"
  | "reject"
  | "recover"
  | null;

export function PolicyActions({
  policy,
  openVersion,
  openVersionLoading,
}: {
  policy: PolicyRecord;
  openVersion:
    | PolicyVersionRecord
    | undefined;
  openVersionLoading: boolean;
}) {
  const {
    address,
    canWrite,
    submitWrite,
  } = usePolicyWrite();

  const [proposalOpen, setProposalOpen] =
    useState(false);

  const [proposalText, setProposalText] =
    useState("");

  const [
    proposalConfirmOpen,
    setProposalConfirmOpen,
  ] = useState(false);

  const [
    pendingAction,
    setPendingAction,
  ] = useState<PendingAction>(null);

  const wallet =
    address?.toLowerCase() ?? null;

  const publisher =
    policy.publisher.toLowerCase();

  const principal =
    policy.principal.toLowerCase();

  const isPublisher =
    wallet !== null &&
    wallet === publisher;

  const isPrincipal =
    wallet !== null &&
    wallet === principal;

  async function submitProposal() {
    const next =
      proposalText.trim();

    if (!next) {
      toast.error(
        "Enter the proposed policy text.",
      );
      return;
    }

    if (next.length > 16_000) {
      toast.error(
        "Policy text must not exceed 16,000 characters.",
      );
      return;
    }

    await submitWrite({
      functionName:
        "propose_version",
      args: [
        policy.policyId,
        next,
      ],
      title: `Propose ${policy.policyId} V${policy.nextVersion}`,
      policyId: policy.policyId,
      version: policy.nextVersion,
    });

    setProposalText("");
    setProposalOpen(false);
  }

  async function runAction(
    action: Exclude<
      PendingAction,
      null
    >,
  ) {
    if (!openVersion) {
      throw new Error(
        "No open version is loaded.",
      );
    }

    const common = {
      args: [
        policy.policyId,
        openVersion.version,
      ],
      policyId: policy.policyId,
      version: openVersion.version,
    };

    if (action === "review") {
      await submitWrite({
        ...common,
        functionName:
          "review_version",
        title: `Review ${policy.policyId} V${openVersion.version}`,
      });

      return;
    }

    if (action === "consent") {
      await submitWrite({
        ...common,
        functionName:
          "consent_to_version",
        title: `Consent to ${policy.policyId} V${openVersion.version}`,
      });

      return;
    }

    if (action === "reject") {
      await submitWrite({
        ...common,
        functionName:
          "reject_version",
        title: `Reject ${policy.policyId} V${openVersion.version}`,
      });

      return;
    }

    const deadline =
      openVersion.status ===
      "PROPOSED"
        ? openVersion.reviewDeadline
        : openVersion.status ===
            "AWAITING_CONSENT"
          ? openVersion.consentDeadline
          : 0;

    if (
      deadline <= 0 ||
      Math.floor(Date.now() / 1000) <=
        deadline
    ) {
      toast.warning(
        "This version has not reached its on-chain recovery deadline yet.",
      );

      return;
    }

    await submitWrite({
      ...common,
      functionName:
        "recover_expired_version",
      title: `Recover expired ${policy.policyId} V${openVersion.version}`,
    });
  }

  const status =
    openVersion?.status ?? null;

  const canReview =
    status === "PROPOSED";

  const canPrincipalDecide =
    status ===
      "AWAITING_CONSENT" &&
    isPrincipal;

  const canRecover =
    status === "PROPOSED" ||
    status ===
      "AWAITING_CONSENT";

  return (
    <section className="panel p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
          Actions
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
          Manage this policy
        </h2>

        <p className="mt-2 max-w-[680px] text-sm leading-6 text-[var(--muted)]">
          PolicyDelta checks authority on-chain. The interface additionally hides or disables actions that the connected wallet cannot legitimately perform.
        </p>
      </div>

      {!canWrite && (
        <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
          Connect a wallet to submit policy transactions.
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <ActionCard
          icon={<GitBranch size={18} />}
          title="Propose a version"
          description={
            isPublisher
              ? "Submit replacement policy text for semantic review."
              : "Only the configured publisher can propose a new version."
          }
          disabled={
            !canWrite ||
            !isPublisher
          }
          onClick={() =>
            setProposalOpen(
              (value) => !value,
            )
          }
          label={
            proposalOpen
              ? "Close proposal"
              : "Propose version"
          }
        />

        <ActionCard
          icon={<SearchCheck size={18} />}
          title="Run semantic review"
          description={
            status === "PROPOSED"
              ? "Permissionless. Validators determine materiality."
              : "Available only while the open version is PROPOSED."
          }
          disabled={
            !canWrite ||
            !canReview ||
            openVersionLoading
          }
          onClick={() =>
            setPendingAction(
              "review",
            )
          }
          label="Review version"
        />

        <ActionCard
          icon={<CheckCircle2 size={18} />}
          title="Grant re-consent"
          description={
            status ===
              "AWAITING_CONSENT"
              ? isPrincipal
                ? "Activate the material replacement explicitly."
                : "Only the principal can grant re-consent."
              : "Available after a material review requires consent."
          }
          disabled={
            !canWrite ||
            !canPrincipalDecide
          }
          onClick={() =>
            setPendingAction(
              "consent",
            )
          }
          label="Consent"
        />

        <ActionCard
          icon={<XCircle size={18} />}
          title="Reject replacement"
          description={
            status ===
              "AWAITING_CONSENT"
              ? isPrincipal
                ? "Reject the open material version and preserve existing authority."
                : "Only the principal can reject this version."
              : "Available while a material version awaits consent."
          }
          disabled={
            !canWrite ||
            !canPrincipalDecide
          }
          onClick={() =>
            setPendingAction(
              "reject",
            )
          }
          label="Reject"
          danger
        />

        <ActionCard
          icon={<RefreshCcw size={18} />}
          title="Recover expiry"
          description={
            canRecover
              ? "Permissionless after the relevant review or consent deadline has passed."
              : "No recoverable open state is currently loaded."
          }
          disabled={
            !canWrite ||
            !canRecover
          }
          onClick={() =>
            setPendingAction(
              "recover",
            )
          }
          label="Recover if expired"
        />
      </div>

      {proposalOpen && (
        <div className="mt-5 rounded-[20px] border border-[var(--accent-line)] bg-[var(--accent-soft)] p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert
              size={18}
              className="mt-0.5 shrink-0 text-[var(--accent)]"
            />

            <div>
              <p className="text-sm font-semibold">
                Propose version V
                {policy.nextVersion}
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                The current active version remains authoritative unless this replacement legitimately activates.
              </p>
            </div>
          </div>

          <textarea
            value={proposalText}
            onChange={(event) =>
              setProposalText(
                event.target.value,
              )
            }
            rows={8}
            maxLength={16_000}
            placeholder="Enter the complete replacement policy text…"
            className="form-textarea mt-5 bg-[var(--background)]"
          />

          <div className="mt-2 flex items-center justify-between gap-4">
            <span className="text-[11px] text-[var(--muted)]">
              {proposalText.length.toLocaleString()} / 16,000
            </span>

            <button
              type="button"
              disabled={
                !proposalText.trim()
              }
              onClick={() =>
                setProposalConfirmOpen(
                  true,
                )
              }
              className="button-primary disabled:cursor-not-allowed disabled:opacity-45"
            >
              Review proposal
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={proposalConfirmOpen}
        onClose={() =>
          setProposalConfirmOpen(
            false,
          )
        }
        title={`Propose version V${policy.nextVersion}?`}
        description={
          policy.openVersion > 0
            ? `Policy ${policy.policyId} already has open version V${policy.openVersion}. A successful new proposal will supersede that open version according to the contract's rules.`
            : `This submits new policy text as V${policy.nextVersion}. It will not become authorized merely because it was proposed.`
        }
        confirmLabel="Submit proposal"
        onConfirm={submitProposal}
      />

      <ConfirmDialog
        open={pendingAction !== null}
        onClose={() =>
          setPendingAction(null)
        }
        title={confirmationTitle(
          pendingAction,
          openVersion?.version,
        )}
        description={confirmationDescription(
          pendingAction,
        )}
        confirmLabel={confirmationLabel(
          pendingAction,
        )}
        tone={
          pendingAction === "reject"
            ? "danger"
            : "default"
        }
        onConfirm={async () => {
          if (!pendingAction) {
            return;
          }

          await runAction(
            pendingAction,
          );
        }}
      />
    </section>
  );
}

function ActionCard({
  icon,
  title,
  description,
  disabled,
  onClick,
  label,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled: boolean;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <span
        className={`grid size-10 place-items-center rounded-xl ${
          danger
            ? "bg-red-500/10 text-red-500"
            : "bg-[var(--surface-strong)] text-[var(--muted-strong)]"
        }`}
      >
        {icon}
      </span>

      <h3 className="mt-5 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-2 min-h-12 text-xs leading-5 text-[var(--muted)]">
        {description}
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-xl px-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
          danger
            ? "border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10"
            : "border border-[var(--line)] bg-[var(--background)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-strong)]"
        }`}
      >
        {label}
      </button>
    </article>
  );
}

function confirmationTitle(
  action: PendingAction,
  version?: number,
) {
  const suffix = version
    ? ` V${version}`
    : "";

  if (action === "review") {
    return `Review${suffix}?`;
  }

  if (action === "consent") {
    return `Consent to${suffix}?`;
  }

  if (action === "reject") {
    return `Reject${suffix}?`;
  }

  if (action === "recover") {
    return `Recover${suffix}?`;
  }

  return "Confirm action";
}

function confirmationDescription(
  action: PendingAction,
) {
  if (action === "review") {
    return "This starts GenLayer semantic consensus for the open proposal. The resulting materiality verdict determines whether re-consent is required.";
  }

  if (action === "consent") {
    return "This is a consequential principal action. If the contract accepts it successfully, the material replacement becomes the active authorized version.";
  }

  if (action === "reject") {
    return "This rejects the open material replacement. The existing active policy remains authoritative.";
  }

  if (action === "recover") {
    return "PolicyDelta will submit recovery only if the relevant on-chain deadline has already passed. Recovery never authorizes the expired version.";
  }

  return "";
}

function confirmationLabel(
  action: PendingAction,
) {
  if (action === "review") {
    return "Start review";
  }

  if (action === "consent") {
    return "Grant consent";
  }

  if (action === "reject") {
    return "Reject version";
  }

  if (action === "recover") {
    return "Recover expiry";
  }

  return "Confirm";
}
