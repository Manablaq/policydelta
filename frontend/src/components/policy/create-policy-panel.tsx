"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { usePolicyWrite } from "@/hooks/use-policy-write";
import {
  ChevronDown,
  FilePlus2,
  Info,
} from "lucide-react";
import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

const DEFAULT_RULES =
  "Re-consent is required for any material change to permissions, spending limits, permitted recipients or actions, obligations, or safety constraints. Any increase or decrease in economic authority is material. Any expansion or reduction of permission is material. Any addition or removal of an obligation is material. Any weakening or strengthening of a safety-critical constraint is material. Pure wording, formatting, paragraph reordering, or semantic-preserving clarification is NON_MATERIAL.";

const ADDRESS_RE =
  /^0x[a-fA-F0-9]{40}$/;

export function CreatePolicyPanel() {
  const {
    address,
    submitWrite,
  } = usePolicyWrite();

  const [expanded, setExpanded] =
    useState(false);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [policyId, setPolicyId] =
    useState("");

  const [publisher, setPublisher] =
    useState("");

  const [
    initialPolicyText,
    setInitialPolicyText,
  ] = useState("");

  const [
    materialityRules,
    setMaterialityRules,
  ] = useState(DEFAULT_RULES);

  const [reviewTtl, setReviewTtl] =
    useState("7200");

  const [consentTtl, setConsentTtl] =
    useState("7200");

  const validation =
    useMemo(() => {
      const review =
        Number(reviewTtl);

      const consent =
        Number(consentTtl);

      if (!policyId.trim()) {
        return "Policy ID is required.";
      }

      if (
        !ADDRESS_RE.test(
          publisher.trim(),
        )
      ) {
        return "Publisher must be a valid 0x address.";
      }

      if (!initialPolicyText.trim()) {
        return "Initial policy text is required.";
      }

      if (
        initialPolicyText.length >
        16_000
      ) {
        return "Policy text must not exceed 16,000 characters.";
      }

      if (!materialityRules.trim()) {
        return "Materiality rules are required.";
      }

      if (
        materialityRules.length >
        8_000
      ) {
        return "Materiality rules must not exceed 8,000 characters.";
      }

      if (
        !Number.isInteger(review) ||
        review < 60 ||
        review > 2_592_000
      ) {
        return "Review TTL must be between 60 and 2,592,000 seconds.";
      }

      if (
        !Number.isInteger(consent) ||
        consent < 60 ||
        consent > 2_592_000
      ) {
        return "Consent TTL must be between 60 and 2,592,000 seconds.";
      }

      return null;
    }, [
      consentTtl,
      initialPolicyText,
      materialityRules,
      policyId,
      publisher,
      reviewTtl,
    ]);

  function openCreateConfirmation(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (validation) {
      toast.error(validation);
      return;
    }

    setConfirmOpen(true);
  }

  async function createPolicy() {
    const review =
      Number(reviewTtl);

    const consent =
      Number(consentTtl);

    await submitWrite({
      functionName: "create_policy",
      args: [
        policyId.trim(),
        publisher.trim(),
        initialPolicyText.trim(),
        materialityRules.trim(),
        review,
        consent,
      ],
      title: `Create policy ${policyId.trim()}`,
      policyId:
        policyId.trim(),
      version: 1,
    });

    setPolicyId("");
    setInitialPolicyText("");
    setExpanded(false);
  }

  function useConnectedWallet() {
    if (!address) {
      toast.error(
        "Connect a wallet first.",
      );
      return;
    }

    setPublisher(address);
  }

  return (
    <>
      <section className="panel overflow-hidden">
        <button
          type="button"
          onClick={() =>
            setExpanded((value) => !value)
          }
          className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-[var(--surface)]"
          aria-expanded={expanded}
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <FilePlus2 size={19} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">
              Create a PolicyDelta policy
            </span>

            <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
              Register the initial authorized version and its semantic materiality rules.
            </span>
          </span>

          <ChevronDown
            size={18}
            className={`shrink-0 text-[var(--muted)] transition ${
              expanded
                ? "rotate-180"
                : ""
            }`}
          />
        </button>

        {expanded && (
          <form
            onSubmit={
              openCreateConfirmation
            }
            className="border-t border-[var(--line)] p-5"
          >
            <div className="grid gap-5">
              <Field
                label="Policy ID"
                hint="Choose a durable unique identifier. PolicyDelta does not provide a global enumeration."
              >
                <input
                  value={policyId}
                  onChange={(event) =>
                    setPolicyId(
                      event.target.value,
                    )
                  }
                  placeholder="example-policy-001"
                  className="form-input"
                  autoComplete="off"
                  spellCheck={false}
                />
              </Field>

              <Field
                label="Publisher"
                hint="Only this address can propose future versions."
              >
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={publisher}
                    onChange={(event) =>
                      setPublisher(
                        event.target.value,
                      )
                    }
                    placeholder="0x…"
                    className="form-input flex-1 font-mono text-xs"
                    autoComplete="off"
                    spellCheck={false}
                  />

                  <button
                    type="button"
                    onClick={
                      useConnectedWallet
                    }
                    className="button-secondary shrink-0"
                  >
                    Use my wallet
                  </button>
                </div>
              </Field>

              <Field
                label="Initial policy"
                hint={`${initialPolicyText.length.toLocaleString()} / 16,000 characters`}
              >
                <textarea
                  value={
                    initialPolicyText
                  }
                  onChange={(event) =>
                    setInitialPolicyText(
                      event.target.value,
                    )
                  }
                  placeholder="Describe the exact authority granted by version 1…"
                  rows={7}
                  className="form-textarea"
                />
              </Field>

              <Field
                label="Materiality rules"
                hint={`${materialityRules.length.toLocaleString()} / 8,000 characters`}
              >
                <textarea
                  value={
                    materialityRules
                  }
                  onChange={(event) =>
                    setMaterialityRules(
                      event.target.value,
                    )
                  }
                  rows={8}
                  className="form-textarea"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Review TTL"
                  hint="Seconds. Min 60."
                >
                  <input
                    type="number"
                    min={60}
                    max={2_592_000}
                    step={1}
                    value={reviewTtl}
                    onChange={(event) =>
                      setReviewTtl(
                        event.target
                          .value,
                      )
                    }
                    className="form-input"
                  />
                </Field>

                <Field
                  label="Consent TTL"
                  hint="Seconds. Min 60."
                >
                  <input
                    type="number"
                    min={60}
                    max={2_592_000}
                    step={1}
                    value={consentTtl}
                    onChange={(event) =>
                      setConsentTtl(
                        event.target
                          .value,
                      )
                    }
                    className="form-input"
                  />
                </Field>
              </div>

              <div className="flex items-start gap-2 rounded-2xl bg-[var(--accent-soft)] p-4 text-xs leading-5 text-[var(--accent-text)]">
                <Info
                  size={15}
                  className="mt-0.5 shrink-0"
                />

                The connected wallet becomes the principal because PolicyDelta binds the principal to the transaction sender. The publisher may be the same address or a different address.
              </div>

              {validation && (
                <p className="text-xs font-medium text-[var(--warning)]">
                  {validation}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    Boolean(validation)
                  }
                  className="button-primary disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Review creation
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() =>
          setConfirmOpen(false)
        }
        title="Create this policy?"
        description={`Policy "${policyId.trim()}" will be registered on Bradbury. The wallet submitting the transaction becomes the principal, and ${publisher.trim() || "the supplied address"} becomes the publisher.`}
        confirmLabel="Create policy"
        onConfirm={createPolicy}
      />
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-end justify-between gap-3">
        <span className="text-sm font-semibold">
          {label}
        </span>

        {hint && (
          <span className="text-right text-[11px] text-[var(--muted)]">
            {hint}
          </span>
        )}
      </span>

      <span className="mt-2 block">
        {children}
      </span>
    </label>
  );
}
