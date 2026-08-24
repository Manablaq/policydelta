"use client";

import {
  truncateMiddle,
} from "@/lib/utils";
import {
  useWallet,
} from "@/providers/wallet-provider";
import {
  Check,
  LoaderCircle,
  Wallet,
  X,
} from "lucide-react";
import {
  useState,
} from "react";
import { toast } from "sonner";

export function WalletButton() {
  const {
    address,
    status,
    isBradbury,
    walletOptions,
    selectedProviderId,
    selectedProviderName,
    connect,
    selectProvider,
    ensureBradbury,
  } = useWallet();

  const [
    chooserOpen,
    setChooserOpen,
  ] =
    useState(false);

  function beginConnect() {
    if (
      walletOptions.length > 1
    ) {
      setChooserOpen(true);
      return;
    }

    void connect().catch(
      () => undefined,
    );
  }

  function chooseWallet(
    providerId: string,
  ) {
    selectProvider(
      providerId,
    );

    setChooserOpen(false);

    void connect(
      providerId,
    ).catch(
      () => undefined,
    );
  }

  async function copyAddress() {
    if (!address) {
      return;
    }

    await navigator.clipboard.writeText(
      address,
    );

    toast.success(
      "Wallet address copied.",
    );
  }

  return (
    <>
      {status ===
      "connecting" ? (
        <button
          type="button"
          disabled
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--ink)] px-4 text-sm font-semibold text-white opacity-80 dark:bg-white dark:text-[var(--ink)]"
        >
          <LoaderCircle
            size={15}
            className="animate-spin"
          />
          Connecting
        </button>
      ) : !address ? (
        <button
          type="button"
          onClick={
            beginConnect
          }
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--ink)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-[var(--ink)]"
        >
          <Wallet size={15} />
          Connect wallet
        </button>
      ) : !isBradbury ? (
        <button
          type="button"
          onClick={() =>
            void ensureBradbury().catch(
              () => undefined,
            )
          }
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--warning-soft)] px-4 text-sm font-semibold text-[var(--warning)]"
        >
          Switch to Bradbury
        </button>
      ) : (
        <button
          type="button"
          onClick={() =>
            void copyAddress()
          }
          title="Copy connected wallet address"
          data-wallet-provider={
            selectedProviderName ??
            undefined
          }
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-semibold transition hover:border-[var(--line-strong)] hover:bg-[var(--surface-strong)]"
        >
          <span className="grid size-5 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
            <Check size={12} />
          </span>

          <span className="font-mono text-xs">
            {truncateMiddle(
              address,
              6,
              4,
            )}
          </span>
        </button>
      )}

      {chooserOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setChooserOpen(
                false,
              );
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-choice-title"
            className="w-full max-w-[430px] rounded-3xl border border-[var(--line)] bg-[var(--background)] p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--accent)]">
                  Wallet provider
                </p>

                <h2
                  id="wallet-choice-title"
                  className="mt-2 text-xl font-semibold tracking-[-0.035em]"
                >
                  Choose a wallet
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  More than one injected wallet was detected. PolicyDelta will use only the provider you select.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setChooserOpen(
                    false,
                  )
                }
                aria-label="Close wallet chooser"
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--muted)] transition hover:bg-[var(--surface)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 grid gap-2">
              {walletOptions.map(
                (option) => (
                  <button
                    key={
                      option.id
                    }
                    type="button"
                    onClick={() =>
                      chooseWallet(
                        option.id,
                      )
                    }
                    className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-left transition hover:border-[var(--line-strong)] hover:bg-[var(--surface-strong)]"
                  >
                    <span>
                      <span className="block text-sm font-semibold">
                        {
                          option.name
                        }
                      </span>

                      <span className="mt-1 block text-xs text-[var(--muted)]">
                        {
                          option.rdns
                        }
                      </span>
                    </span>

                    {selectedProviderId ===
                      option.id && (
                      <span className="badge bg-[var(--accent-soft)] text-[var(--accent-text)]">
                        Selected
                      </span>
                    )}
                  </button>
                ),
              )}
            </div>

            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
              Selecting a wallet requests account access only. PolicyDelta never submits a transaction merely by connecting.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
