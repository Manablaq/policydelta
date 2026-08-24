"use client";

import { readVersion } from "@/lib/contract/read";
import { policyKeys } from "@/hooks/use-policy";
import { useQueries } from "@tanstack/react-query";

export function usePolicyLineage(
  policyId: string,
  nextVersion: number,
  visibleCount: number,
) {
  const highestVersion =
    Math.max(0, nextVersion - 1);

  const lowestVersion =
    Math.max(
      1,
      highestVersion -
        visibleCount +
        1,
    );

  const versionNumbers =
    highestVersion > 0
      ? Array.from(
          {
            length:
              highestVersion -
              lowestVersion +
              1,
          },
          (_, index) =>
            highestVersion - index,
        )
      : [];

  const queries = useQueries({
    queries: versionNumbers.map(
      (version) => ({
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
        enabled: Boolean(policyId),
        staleTime: 12_000,
      }),
    ),
  });

  return {
    entries: versionNumbers.map(
      (version, index) => ({
        version,
        query: queries[index],
      }),
    ),
    hasEarlier:
      lowestVersion > 1,
    isLoading: queries.some(
      (query) => query.isPending,
    ),
  };
}
