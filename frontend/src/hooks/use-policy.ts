"use client";

import {
  readActiveVersion,
  readAuthorization,
  readPolicy,
  readVersion,
} from "@/lib/contract/read";
import { useQuery } from "@tanstack/react-query";

export const policyKeys = {
  all: ["policydelta"] as const,

  policy: (policyId: string) =>
    [
      ...policyKeys.all,
      "policy",
      policyId,
    ] as const,

  activeVersion: (policyId: string) =>
    [
      ...policyKeys.all,
      "active-version",
      policyId,
    ] as const,

  version: (
    policyId: string,
    version: number,
  ) =>
    [
      ...policyKeys.all,
      "version",
      policyId,
      version,
    ] as const,

  authorization: (
    policyId: string,
    version: number,
  ) =>
    [
      ...policyKeys.all,
      "authorization",
      policyId,
      version,
    ] as const,
};

const LIVE_REFETCH_MS = 12_000;

export function usePolicy(
  policyId: string,
) {
  return useQuery({
    queryKey: policyKeys.policy(policyId),
    queryFn: () => readPolicy(policyId),
    enabled: Boolean(policyId),
    refetchInterval: LIVE_REFETCH_MS,
  });
}

export function useActiveVersion(
  policyId: string,
  enabled = true,
) {
  return useQuery({
    queryKey:
      policyKeys.activeVersion(policyId),
    queryFn: () =>
      readActiveVersion(policyId),
    enabled:
      Boolean(policyId) && enabled,
    refetchInterval: LIVE_REFETCH_MS,
  });
}

export function usePolicyVersion(
  policyId: string,
  version: number,
  enabled = true,
) {
  return useQuery({
    queryKey:
      policyKeys.version(
        policyId,
        version,
      ),
    queryFn: () =>
      readVersion(
        policyId,
        version,
      ),
    enabled:
      Boolean(policyId) &&
      version > 0 &&
      enabled,
    refetchInterval: LIVE_REFETCH_MS,
  });
}

export function useAuthorization(
  policyId: string,
  version: number,
  enabled = true,
) {
  return useQuery({
    queryKey:
      policyKeys.authorization(
        policyId,
        version,
      ),
    queryFn: () =>
      readAuthorization(
        policyId,
        version,
      ),
    enabled:
      Boolean(policyId) &&
      version > 0 &&
      enabled,
    refetchInterval: LIVE_REFETCH_MS,
  });
}
