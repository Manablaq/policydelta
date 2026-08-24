"use client";

import {
  type BrowserWalletProvider,
  createWriteClient,
} from "@/lib/genlayer/client";
import { GENLAYER_CHAIN_ID, GENLAYER_NETWORK } from "@/lib/contract/config";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

type WalletStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "error";

type ProviderWithEvents = BrowserWalletProvider & {
  on?: (
    event: string,
    listener: (value: unknown) => void,
  ) => void;
  removeListener?: (
    event: string,
    listener: (value: unknown) => void,
  ) => void;
};

type WalletContextValue = {
  address: `0x${string}` | null;
  chainId: number | null;
  status: WalletStatus;
  hasProvider: boolean;
  isBradbury: boolean;
  connect: () => Promise<void>;
  ensureBradbury: () => Promise<void>;
  writeClient: ReturnType<typeof createWriteClient> | null;
};

const WalletContext = createContext<WalletContextValue | null>(null);

function parseChainId(value: unknown) {
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 16);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (typeof value === "number") {
    return value;
  }

  return null;
}

function firstAddress(value: unknown): `0x${string}` | null {
  if (!Array.isArray(value)) return null;

  const first = value.find(
    (item): item is string =>
      typeof item === "string" && item.startsWith("0x"),
  );

  return first ? (first as `0x${string}`) : null;
}

export function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [provider, setProvider] =
    useState<BrowserWalletProvider | null>(null);

  const [address, setAddress] =
    useState<`0x${string}` | null>(null);

  const [chainId, setChainId] =
    useState<number | null>(null);

  const [status, setStatus] =
    useState<WalletStatus>("idle");

  const syncWallet = useCallback(
    async (
      activeProvider: BrowserWalletProvider,
      requestAccess = false,
    ) => {
      const accounts = await activeProvider.request({
        method: requestAccess
          ? "eth_requestAccounts"
          : "eth_accounts",
      });

      const nextAddress = firstAddress(accounts);

      const rawChainId = await activeProvider.request({
        method: "eth_chainId",
      });

      const nextChainId = parseChainId(rawChainId);

      setAddress(nextAddress);
      setChainId(nextChainId);
      setStatus(nextAddress ? "connected" : "idle");

      return nextAddress;
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const candidate = (
      window as typeof window & {
        ethereum?: BrowserWalletProvider;
      }
    ).ethereum;

    if (!candidate) return;

    let active = true;

    Promise.resolve().then(async () => {
      if (!active) return;

      setProvider(candidate);

      try {
        await syncWallet(candidate);
      } catch {
        if (active) {
          setStatus("idle");
        }
      }
    });

    const eventProvider = candidate as ProviderWithEvents;

    const handleAccountsChanged = (value: unknown) => {
      setAddress(firstAddress(value));

      if (
        Array.isArray(value) &&
        value.length === 0
      ) {
        setStatus("idle");
      } else {
        setStatus("connected");
      }
    };

    const handleChainChanged = (value: unknown) => {
      setChainId(parseChainId(value));
    };

    eventProvider.on?.(
      "accountsChanged",
      handleAccountsChanged,
    );

    eventProvider.on?.(
      "chainChanged",
      handleChainChanged,
    );

    return () => {
      active = false;

      eventProvider.removeListener?.(
        "accountsChanged",
        handleAccountsChanged,
      );

      eventProvider.removeListener?.(
        "chainChanged",
        handleChainChanged,
      );
    };
  }, [syncWallet]);

  const ensureBradbury = useCallback(async () => {
    if (!provider || !address) {
      throw new Error("Connect a browser wallet first.");
    }

    const client = createWriteClient(
      address,
      provider,
    );

    await client.connect(GENLAYER_NETWORK);

    const rawChainId = await provider.request({
      method: "eth_chainId",
    });

    const nextChainId = parseChainId(rawChainId);

    setChainId(nextChainId);

    if (nextChainId !== GENLAYER_CHAIN_ID) {
      throw new Error(
        `Wallet is on chain ${nextChainId ?? "unknown"}, not Bradbury (${GENLAYER_CHAIN_ID}).`,
      );
    }
  }, [address, provider]);

  const connect = useCallback(async () => {
    if (typeof window === "undefined") return;

    const candidate = (
      window as typeof window & {
        ethereum?: BrowserWalletProvider;
      }
    ).ethereum;

    if (!candidate) {
      toast.error(
        "No compatible browser wallet was detected.",
      );
      setStatus("error");
      return;
    }

    setProvider(candidate);
    setStatus("connecting");

    try {
      const nextAddress = await syncWallet(
        candidate,
        true,
      );

      if (!nextAddress) {
        throw new Error(
          "The wallet did not return an account.",
        );
      }

      const client = createWriteClient(
        nextAddress,
        candidate,
      );

      await client.connect(GENLAYER_NETWORK);

      await syncWallet(candidate);

      toast.success("Wallet connected to Bradbury.");
    } catch (error) {
      setStatus("error");

      const message =
        error instanceof Error
          ? error.message
          : "Wallet connection failed.";

      toast.error(message);
      throw error;
    }
  }, [syncWallet]);

  const writeClient = useMemo(() => {
    if (!provider || !address) return null;

    return createWriteClient(
      address,
      provider,
    );
  }, [address, provider]);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      chainId,
      status,
      hasProvider: Boolean(provider),
      isBradbury:
        chainId === GENLAYER_CHAIN_ID,
      connect,
      ensureBradbury,
      writeClient,
    }),
    [
      address,
      chainId,
      status,
      provider,
      connect,
      ensureBradbury,
      writeClient,
    ],
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error(
      "useWallet must be used inside WalletProvider.",
    );
  }

  return context;
}
