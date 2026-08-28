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

type AccountContextValue = {
  snapshot:
    WalletAccountSnapshot | null;
  policies:
    WalletAccountSnapshot["policies"];
  activity:
    WalletAccountSnapshot["activity"];
  principalReviewAlerts:
    WalletAccountSnapshot["principalReviewAlerts"];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const AccountContext =
  createContext<
    AccountContextValue | null
  >(null);

async function readJson(
  response: Response,
) {
  const payload: unknown =
    await response.json();

  if (!response.ok) {
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

    throw new Error(
      typeof data.error ===
        "string"
        ? data.error
        : "Bradbury wallet discovery failed.",
    );
  }

  return payload;
}

export function AccountProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const {
    address,
  } = useWallet();

  const queryClient =
    useQueryClient();

  const normalized =
    address
      ?.toLowerCase() ??
    "";

  const query =
    useQuery({
      queryKey: [
        "policydelta-account",
        normalized,
      ],
      enabled:
        Boolean(
          normalized,
        ),
      queryFn:
        async () => {
          const response =
            await fetch(
              `/api/account?wallet=${encodeURIComponent(
                normalized,
              )}`,
              {
                cache:
                  "no-store",
              },
            );

          return (
            await readJson(
              response,
            )
          ) as WalletAccountSnapshot;
        },
      staleTime:
        10_000,
      refetchInterval:
        30_000,
      refetchOnWindowFocus:
        true,
      refetchOnReconnect:
        true,
      retry: 1,
    });

  const refresh =
    useCallback(
      async () => {
        if (!normalized) {
          return;
        }

        await queryClient
          .invalidateQueries({
            queryKey: [
              "policydelta-account",
              normalized,
            ],
          });

        await queryClient
          .refetchQueries({
            queryKey: [
              "policydelta-account",
              normalized,
            ],
            type:
              "active",
          });
      },
      [
        normalized,
        queryClient,
      ],
    );

  const value =
    useMemo<
      AccountContextValue
    >(
      () => ({
        snapshot:
          query.data ??
          null,
        policies:
          query.data
            ?.policies ??
          [],
        activity:
          query.data
            ?.activity ??
          [],
        principalReviewAlerts:
          query.data
            ?.principalReviewAlerts ??
          [],
        isLoading:
          Boolean(
            normalized,
          ) &&
          query.isPending,
        isRefreshing:
          query.isFetching &&
          !query.isPending,
        error:
          query.error instanceof
          Error
            ? query.error
                .message
            : null,
        refresh,
      }),
      [
        normalized,
        query.data,
        query.error,
        query.isFetching,
        query.isPending,
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
    useContext(
      AccountContext,
    );

  if (!context) {
    throw new Error(
      "useAccount must be used inside AccountProvider.",
    );
  }

  return context;
}
