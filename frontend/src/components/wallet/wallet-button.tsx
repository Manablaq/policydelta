"use client";

import { truncateMiddle } from "@/lib/utils";
import { useWallet } from "@/providers/wallet-provider";
import {
  Check,
  LoaderCircle,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

export function WalletButton() {
  const {
    address,
    status,
    isBradbury,
    connect,
    ensureBradbury,
  } = useWallet();

  if (status === "connecting") {
    return (
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
    );
  }

  if (!address) {
    return (
      <button
        type="button"
        onClick={() => void connect()}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--ink)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-[var(--ink)]"
      >
        <Wallet size={15} />
        Connect wallet
      </button>
    );
  }

  if (!isBradbury) {
    return (
      <button
        type="button"
        onClick={() =>
          void ensureBradbury().catch(() => undefined)
        }
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--warning-soft)] px-4 text-sm font-semibold text-[var(--warning)]"
      >
        Switch to Bradbury
      </button>
    );
  }

  async function copyAddress() {
    if (!address) return;

    await navigator.clipboard.writeText(address);
    toast.success("Wallet address copied.");
  }

  return (
    <button
      type="button"
      onClick={() => void copyAddress()}
      title="Copy connected wallet address"
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-semibold transition hover:border-[var(--line-strong)] hover:bg-[var(--surface-strong)]"
    >
      <span className="grid size-5 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
        <Check size={12} />
      </span>

      <span className="font-mono text-xs">
        {truncateMiddle(address, 6, 4)}
      </span>
    </button>
  );
}
