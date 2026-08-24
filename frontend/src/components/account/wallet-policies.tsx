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
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";
import {
  toast,
} from "sonner";

export function WalletPolicies() {
  const {
    address,
  } = useWallet();

  const {
    configured,
    refresh,
  } = useAccount();

  const {
    policies,
    indexedCount,
    loading,
  } = useWalletPolicySummaries();

  const [
    importId,
    setImportId,
  ] = useState("");

  const [
    importing,
    setImporting,
  ] = useState(false);

  async function importExisting(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const policyId =
      importId.trim();

    if (!policyId) {
      return;
    }

    setImporting(true);

    try {
      const response =
        await fetch(
          "/api/account/policy",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              wallet: address,
              policyId,
            }),
          },
        );

      const payload: unknown =
        await response.json();

      const data =
        payload &&
        typeof payload ===
          "object" &&
        !Array.isArray(payload)
          ? payload as Record<
              string,
              unknown
            >
          : {};

      if (!response.ok) {
        throw new Error(
          typeof data.error ===
            "string"
            ? data.error
            : "Policy import failed.",
        );
      }

      await refresh();

      setImportId("");

      toast.success(
        `Imported ${policyId}.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Policy import failed.",
      );
    } finally {
      setImporting(false);
    }
  }

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
              Connect a wallet to load its PolicyDelta workspace.
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

          <p className="mt-2 max-w-[680px] text-sm leading-6 text-[var(--muted)]">
            Policies indexed for this wallet are refreshed from the deployed Bradbury contract before presentation.
          </p>
        </div>

        <span className="badge bg-[var(--accent-soft)] text-[var(--accent-text)]">
          {indexedCount} indexed
        </span>
      </div>

      {!configured && (
        <div className="mt-5 rounded-2xl bg-[var(--warning-soft)] p-4 text-sm leading-6 text-[var(--warning)]">
          Persistent account indexing is not configured in this deployment. Exact Bradbury policy lookup remains available below.
        </div>
      )}

      {configured && (
        <form
          onSubmit={
            importExisting
          }
          className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"
        >
          <p className="text-sm font-semibold">
            Import an older policy
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            Use this only for policies created before persistent wallet indexing was enabled. The server verifies that this wallet is actually the Bradbury principal or publisher.
          </p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3">
              <Search
                size={15}
                className="text-[var(--muted)]"
              />

              <input
                value={importId}
                onChange={(
                  event,
                ) =>
                  setImportId(
                    event.target.value,
                  )
                }
                placeholder="Existing PolicyDelta policy ID"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={
                importing ||
                !importId.trim()
              }
              className="button-secondary disabled:cursor-not-allowed disabled:opacity-45"
            >
              {importing
                ? "Verifying…"
                : "Import"}
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
          <LoaderCircle
            size={17}
            className="animate-spin"
          />
          Loading live policy state…
        </div>
      )}

      {!loading &&
        policies.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-12 text-center">
            <FileText
              size={21}
              className="mx-auto text-[var(--muted)]"
            />

            <h3 className="mt-4 font-semibold">
              No policies indexed yet
            </h3>

            <p className="mx-auto mt-2 max-w-[520px] text-sm leading-6 text-[var(--muted)]">
              Create a new policy below, or import a policy this wallet already owns.
            </p>
          </div>
        )}

      {!loading &&
        policies.length > 0 && (
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
                        {policy.role}
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
