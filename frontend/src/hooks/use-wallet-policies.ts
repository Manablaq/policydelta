"use client";

import {
  readActiveVersion,
  readPolicy,
  readVersion,
} from "@/lib/contract/read";
import {
  useAccount,
} from "@/providers/account-provider";
import {
  useQueries,
} from "@tanstack/react-query";
import {
  useMemo,
} from "react";

const LIVE_REFETCH_MS = 12_000;

export type WalletPolicySummary = {
  policyId: string;
  role: string;
  exists: boolean;
  activeVersion: number;
  nextVersion: number;
  openVersion: number;
  activeStatus: string;
  openStatus: string | null;
  requiresReconsent: boolean;
  changeClass: string | null;
  loading: boolean;
};

export function useWalletPolicySummaries() {
  const {
    policies: walletPolicies,
    isLoading: accountLoading,
  } = useAccount();

  const policyQueries =
    useQueries({
      queries:
        walletPolicies.map(
          (entry) => ({
            queryKey: [
              "policydelta",
              "wallet-policy",
              entry.policyId,
            ] as const,
            queryFn: () =>
              readPolicy(
                entry.policyId,
              ),
            refetchInterval:
              LIVE_REFETCH_MS,
          }),
        ),
    });

  const activeQueries =
    useQueries({
      queries:
        walletPolicies.map(
          (entry, index) => {
            const policy =
              policyQueries[
                index
              ]?.data;

            return {
              queryKey: [
                "policydelta",
                "wallet-active",
                entry.policyId,
                policy?.activeVersion ??
                  0,
              ] as const,
              queryFn: () =>
                readActiveVersion(
                  entry.policyId,
                ),
              enabled:
                policy?.exists ===
                  true &&
                (
                  policy?.activeVersion ??
                  0
                ) > 0,
              refetchInterval:
                LIVE_REFETCH_MS,
            };
          },
        ),
    });

  const openQueries =
    useQueries({
      queries:
        walletPolicies.map(
          (entry, index) => {
            const policy =
              policyQueries[
                index
              ]?.data;

            const openVersion =
              policy?.openVersion ??
              0;

            return {
              queryKey: [
                "policydelta",
                "wallet-open",
                entry.policyId,
                openVersion,
              ] as const,
              queryFn: () =>
                readVersion(
                  entry.policyId,
                  openVersion,
                ),
              enabled:
                policy?.exists ===
                  true &&
                openVersion > 0,
              refetchInterval:
                LIVE_REFETCH_MS,
            };
          },
        ),
    });

  const summaries =
    useMemo<
      WalletPolicySummary[]
    >(
      () =>
        walletPolicies.map(
          (entry, index) => {
            const policyQuery =
              policyQueries[index];

            const activeQuery =
              activeQueries[index];

            const openQuery =
              openQueries[index];

            const policy =
              policyQuery?.data;

            const active =
              activeQuery?.data;

            const open =
              openQuery?.data;

            const openVersion =
              policy?.openVersion ??
              0;

            return {
              policyId:
                entry.policyId,
              role: entry.role,
              exists:
                policy?.exists ===
                true,
              activeVersion:
                policy?.activeVersion ??
                0,
              nextVersion:
                policy?.nextVersion ??
                0,
              openVersion,
              activeStatus:
                active?.status ??
                "UNKNOWN",
              openStatus:
                openVersion > 0
                  ? open?.status ??
                    null
                  : null,
              requiresReconsent:
                open
                  ?.requiresReconsent ??
                false,
              changeClass:
                open?.changeClass ??
                null,
              loading:
                policyQuery
                  ?.isPending ===
                  true ||
                (
                  policy?.exists ===
                    true &&
                  activeQuery
                    ?.isPending ===
                    true
                ) ||
                (
                  openVersion >
                    0 &&
                  openQuery
                    ?.isPending ===
                    true
                ),
            };
          },
        ),
      [
        walletPolicies,
        policyQueries,
        activeQueries,
        openQueries,
      ],
    );

  return {
    policies: summaries,
    policyCount:
      walletPolicies.length,
    loading:
      accountLoading ||
      summaries.some(
        (item) =>
          item.loading,
      ),
  };
}
