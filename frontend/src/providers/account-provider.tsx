"use client";

import type {
  WalletAccountSnapshot,
} from "@/lib/account/types";
import {
  useWallet,
} from "@/providers/wallet-provider";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

type IndexActivityInput = {
  hash: string;
};

type AccountContextValue = {
  snapshot:
    WalletAccountSnapshot | null;
  policies:
    WalletAccountSnapshot["policies"];
  activity:
    WalletAccountSnapshot["activity"];
  configured: boolean;
  isLoading: boolean;
  indexPolicy:
    (policyId: string) =>
      Promise<void>;
  indexActivity:
    (
      input: IndexActivityInput,
    ) => Promise<void>;
  refresh: () => Promise<void>;
};

const AccountContext =
  createContext<AccountContextValue | null>(
    null,
  );

async function readJson(
  response: Response,
) {
  const payload: unknown =
    await response.json();

  if (!response.ok) {
    const data =
      payload &&
      typeof payload === "object" &&
      !Array.isArray(payload)
        ? payload as Record<
            string,
            unknown
          >
        : {};

    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "PolicyDelta account request failed.",
    );
  }

  return payload;
}

export function AccountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address } = useWallet();

  const queryClient =
    useQueryClient();

  const normalized =
    address?.toLowerCase() ?? "";

  const query =
    useQuery({
      queryKey: [
        "policydelta-account",
        normalized,
      ],
      enabled: Boolean(normalized),
      queryFn: async () => {
        const response =
          await fetch(
            `/api/account?wallet=${encodeURIComponent(
              normalized,
            )}`,
            {
              cache: "no-store",
            },
          );

        return (
          await readJson(
            response,
          )
        ) as WalletAccountSnapshot;
      },
      retry: 1,
      refetchOnWindowFocus: true,
    });

  const refresh =
    useCallback(async () => {
      if (!normalized) return;

      await queryClient.invalidateQueries(
        {
          queryKey: [
            "policydelta-account",
            normalized,
          ],
        },
      );
    }, [
      normalized,
      queryClient,
    ]);

  const indexPolicy =
    useCallback(
      async (
        policyId: string,
      ) => {
        if (!normalized) return;

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
                wallet: normalized,
                policyId,
              }),
            },
          );

        if (!response.ok) {
          return;
        }

        await refresh();
      },
      [
        normalized,
        refresh,
      ],
    );

  const indexActivity =
    useCallback(
      async (
        input: IndexActivityInput,
      ) => {
        if (!normalized) return;

        const response =
          await fetch(
            "/api/account/activity",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                wallet: normalized,
                hash: input.hash,
              }),
            },
          );

        if (!response.ok) {
          return;
        }

        await refresh();
      },
      [
        normalized,
        refresh,
      ],
    );

  const value =
    useMemo<AccountContextValue>(
      () => ({
        snapshot:
          query.data ?? null,
        policies:
          query.data?.policies ?? [],
        activity:
          query.data?.activity ?? [],
        configured:
          query.data?.configured ??
          false,
        isLoading:
          Boolean(normalized) &&
          query.isPending,
        indexPolicy,
        indexActivity,
        refresh,
      }),
      [
        normalized,
        query.data,
        query.isPending,
        indexPolicy,
        indexActivity,
        refresh,
      ],
    );

  return (
    <AccountContext.Provider
      value={value}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context =
    useContext(AccountContext);

  if (!context) {
    throw new Error(
      "useAccount must be used inside AccountProvider.",
    );
  }

  return context;
}
