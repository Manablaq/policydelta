"use client";

import { useAccount } from "@/providers/account-provider";
import type { PolicyWriteFunction } from "@/lib/account/validation";

import {
  readClient,
  type GenLayerTransactionHash,
} from "@/lib/genlayer/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

export type TrackedTransaction = {
  hash: GenLayerTransactionHash;
  title: string;
  functionName?: PolicyWriteFunction;
  policyId?: string;
  version?: number;
  consensusStatus: string;
  executionStatus: string;
  submittedAt: number;
  updatedAt: number;
  refreshedForStatus?: string;
  pollingPaused?: boolean;
};

type TrackInput = {
  hash: GenLayerTransactionHash;
  title: string;
  functionName?: PolicyWriteFunction;
  policyId?: string;
  version?: number;
};

type TransactionContextValue = {
  transactions: TrackedTransaction[];
  trackTransaction: (
    input: TrackInput,
  ) => void;
  refreshTransaction: (
    hash: GenLayerTransactionHash,
  ) => Promise<void>;
  clearCompleted: () => void;
};

const TransactionContext =
  createContext<TransactionContextValue | null>(
    null,
  );

const STORAGE_KEY =
  "policydelta:transactions:v1";

const MAX_STORED_TRANSACTIONS = 50;

// Automatic polling is intentionally bounded.
// A user can still manually refresh afterward.
const MAX_AUTO_POLL_MS =
  6 * 60 * 60 * 1000;

const POLL_INTERVAL_MS = 3_500;

const STATUS_BY_NUMBER: Record<
  number,
  string
> = {
  0: "UNINITIALIZED",
  1: "PENDING",
  2: "PROPOSING",
  3: "COMMITTING",
  4: "REVEALING",
  5: "ACCEPTED",
  6: "UNDETERMINED",
  7: "FINALIZED",
  8: "CANCELED",
  9: "APPEAL_REVEALING",
  10: "APPEAL_COMMITTING",
  11: "READY_TO_FINALIZE",
  12: "VALIDATORS_TIMEOUT",
  13: "LEADER_TIMEOUT",
};

const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000";

function asRecord(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      unknown
    >;
  }

  return {};
}

function statusName(
  value: unknown,
) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }

  if (typeof value === "number") {
    return (
      STATUS_BY_NUMBER[value] ??
      `STATUS_${value}`
    );
  }

  if (typeof value === "bigint") {
    const numeric = Number(value);

    return (
      STATUS_BY_NUMBER[numeric] ??
      `STATUS_${numeric}`
    );
  }

  return "UNKNOWN";
}

function isUnavailableTransaction(
  value: unknown,
) {
  const data = asRecord(value);

  const consensusStatus =
    typeof data.statusName === "string"
      ? data.statusName.toUpperCase()
      : statusName(data.status);

  const executionStatus =
    typeof data.txExecutionResultName ===
    "string"
      ? data.txExecutionResultName.toUpperCase()
      : "UNKNOWN";

  const sender =
    typeof data.sender === "string"
      ? data.sender.toLowerCase()
      : "";

  const recipient =
    typeof data.recipient === "string"
      ? data.recipient.toLowerCase()
      : "";

  return (
    consensusStatus ===
      "UNINITIALIZED" &&
    executionStatus === "NOT_VOTED" &&
    sender === ZERO_ADDRESS &&
    recipient === ZERO_ADDRESS
  );
}

function extractTransactionState(
  value: unknown,
) {
  const data = asRecord(value);

  const consensusStatus =
    typeof data.statusName === "string"
      ? data.statusName.toUpperCase()
      : statusName(data.status);

  const executionStatus =
    typeof data.txExecutionResultName ===
    "string"
      ? data.txExecutionResultName.toUpperCase()
      : typeof data.executionResultName ===
          "string"
        ? data.executionResultName.toUpperCase()
        : "UNKNOWN";

  return {
    consensusStatus,
    executionStatus,
  };
}

function pollingComplete(
  status: string,
) {
  return (
    status === "FINALIZED" ||
    status === "CANCELED"
  );
}

function timeoutStatus(
  status: string,
) {
  return (
    status === "LEADER_TIMEOUT" ||
    status ===
      "VALIDATORS_TIMEOUT"
  );
}

function validHash(
  value: unknown,
): value is GenLayerTransactionHash {
  return (
    typeof value === "string" &&
    /^0x[0-9a-fA-F]{64}$/.test(
      value,
    )
  );
}

function restoreTransaction(
  value: unknown,
): TrackedTransaction | null {
  const data = asRecord(value);

  if (
    !validHash(data.hash) ||
    typeof data.title !== "string" ||
    typeof data.consensusStatus !==
      "string" ||
    typeof data.executionStatus !==
      "string" ||
    typeof data.submittedAt !==
      "number" ||
    !Number.isFinite(
      data.submittedAt,
    ) ||
    typeof data.updatedAt !==
      "number" ||
    !Number.isFinite(data.updatedAt)
  ) {
    return null;
  }

  const item: TrackedTransaction = {
    hash: data.hash,
    title: data.title,
    consensusStatus:
      data.consensusStatus,
    executionStatus:
      data.executionStatus,
    submittedAt: data.submittedAt,
    updatedAt: data.updatedAt,
  };

  if (
    typeof data.policyId === "string"
  ) {
    item.policyId = data.policyId;
  }

  if (
    typeof data.functionName ===
      "string" &&
    [
      "create_policy",
      "propose_version",
      "review_version",
      "consent_to_version",
      "reject_version",
      "recover_expired_version",
    ].includes(data.functionName)
  ) {
    item.functionName =
      data.functionName as PolicyWriteFunction;
  }

  if (
    typeof data.version === "number" &&
    Number.isFinite(data.version)
  ) {
    item.version = data.version;
  }

  if (
    typeof data.refreshedForStatus ===
    "string"
  ) {
    item.refreshedForStatus =
      data.refreshedForStatus;
  }

  if (
    typeof data.pollingPaused ===
    "boolean"
  ) {
    item.pollingPaused =
      data.pollingPaused;
  }

  if (
    !pollingComplete(
      item.consensusStatus,
    ) &&
    Date.now() - item.submittedAt >
      MAX_AUTO_POLL_MS
  ) {
    item.pollingPaused = true;
  }

  return item;
}

function persistTransactions(
  transactions: TrackedTransaction[],
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        transactions.slice(
          0,
          MAX_STORED_TRANSACTIONS,
        ),
      ),
    );
  } catch {
    // Storage may be unavailable in a
    // privacy-restricted browser.
  }
}

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient =
    useQueryClient();

  const { indexActivity } =
    useAccount();

  const [transactions, setTransactions] =
    useState<TrackedTransaction[]>([]);

  const transactionsRef =
    useRef<TrackedTransaction[]>([]);

  const commit = useCallback(
    (next: TrackedTransaction[]) => {
      const bounded = next.slice(
        0,
        MAX_STORED_TRANSACTIONS,
      );

      transactionsRef.current =
        bounded;

      setTransactions(bounded);

      persistTransactions(bounded);
    },
    [],
  );

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    let active = true;

    try {
      const raw =
        window.localStorage.getItem(
          STORAGE_KEY,
        );

      if (!raw) return;

      const parsed: unknown =
        JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return;
      }

      const restored = parsed
        .map(restoreTransaction)
        .filter(
          (
            item,
          ): item is TrackedTransaction =>
            item !== null,
        )
        .slice(
          0,
          MAX_STORED_TRANSACTIONS,
        );

      window.queueMicrotask(() => {
        if (!active) return;

        transactionsRef.current =
          restored;

        setTransactions(restored);
      });
    } catch {
      // Malformed storage is ignored.
    }

    return () => {
      active = false;
    };
  }, []);

  const pauseTransaction =
    useCallback(
      (
        hash:
          GenLayerTransactionHash,
      ) => {
        const next =
          transactionsRef.current.map(
            (item) =>
              item.hash === hash
                ? {
                    ...item,
                    pollingPaused:
                      true,
                  }
                : item,
          );

        commit(next);
      },
      [commit],
    );

  const refreshTransaction =
    useCallback(
      async (
        hash:
          GenLayerTransactionHash,
      ) => {
        const current =
          transactionsRef.current.find(
            (item) =>
              item.hash === hash,
          );

        if (!current) return;

        try {
          const raw =
            await readClient.getTransaction({
              hash,
            });

          // Bradbury can return a zero/default
          // structure for an unavailable lookup.
          // Never regress a meaningful tracked
          // state back to UNINITIALIZED.
          if (
            isUnavailableTransaction(
              raw,
            )
          ) {
            return;
          }

          const state =
            extractTransactionState(
              raw,
            );

          const successfulExecution =
            state.executionStatus ===
            "FINISHED_WITH_RETURN";

          const refreshableConsensus =
            state.consensusStatus ===
              "ACCEPTED" ||
            state.consensusStatus ===
              "FINALIZED";

          const shouldRefreshState =
            successfulExecution &&
            refreshableConsensus &&
            current.refreshedForStatus !==
              state.consensusStatus;

          const nextItem: TrackedTransaction =
            {
              ...current,
              ...state,
              updatedAt: Date.now(),
              pollingPaused:
                pollingComplete(
                  state.consensusStatus,
                )
                  ? false
                  : current.pollingPaused,
              refreshedForStatus:
                shouldRefreshState
                  ? state.consensusStatus
                  : current.refreshedForStatus,
            };

          const next =
            transactionsRef.current.map(
              (item) =>
                item.hash === hash
                  ? nextItem
                  : item,
            );

          commit(next);

          const indexableChange =
            current.consensusStatus !==
              state.consensusStatus ||
            current.executionStatus !==
              state.executionStatus;

          if (
            indexableChange &&
            current.functionName
          ) {
            await indexActivity({
              hash: current.hash,
            }).catch(() => undefined);
          }

          if (shouldRefreshState) {
            await queryClient.invalidateQueries(
              {
                queryKey: [
                  "policydelta",
                ],
              },
            );
          }

          if (
            current.executionStatus !==
              "FINISHED_WITH_ERROR" &&
            state.executionStatus ===
              "FINISHED_WITH_ERROR"
          ) {
            toast.error(
              `${current.title}: contract execution failed.`,
            );
          }

          if (
            current.consensusStatus !==
              state.consensusStatus &&
            timeoutStatus(
              state.consensusStatus,
            )
          ) {
            toast.warning(
              `${current.title}: ${state.consensusStatus.replaceAll(
                "_",
                " ",
              )}. This is not a successful execution or finalization.`,
            );
          }

          if (
            current.consensusStatus !==
              "FINALIZED" &&
            state.consensusStatus ===
              "FINALIZED"
          ) {
            if (
              successfulExecution
            ) {
              toast.success(
                `${current.title}: finalized.`,
              );
            } else {
              toast.warning(
                `${current.title}: finalized without a successful execution result.`,
              );
            }
          }
        } catch {
          // A newly submitted transaction may
          // not be queryable immediately.
          // Preserve the last trustworthy state.
        }
      },
      [
        commit,
        indexActivity,
        queryClient,
      ],
    );

  const trackTransaction =
    useCallback(
      (input: TrackInput) => {
        const now = Date.now();

        const transaction:
          TrackedTransaction = {
          ...input,
          consensusStatus:
            "SUBMITTED",
          executionStatus:
            "UNKNOWN",
          submittedAt: now,
          updatedAt: now,
          pollingPaused: false,
        };

        const next = [
          transaction,
          ...transactionsRef.current.filter(
            (item) =>
              item.hash !==
              input.hash,
          ),
        ];

        commit(next);

        toast.message(
          `${input.title}: transaction submitted.`,
        );

        window.setTimeout(() => {
          void refreshTransaction(
            input.hash,
          );
        }, 1_500);
      },
      [
        commit,
        refreshTransaction,
      ],
    );

  const clearCompleted =
    useCallback(() => {
      commit(
        transactionsRef.current.filter(
          (item) =>
            !pollingComplete(
              item.consensusStatus,
            ),
        ),
      );
    }, [commit]);

  useEffect(() => {
    const candidates =
      transactions.filter(
        (item) =>
          !pollingComplete(
            item.consensusStatus,
          ) &&
          !item.pollingPaused,
      );

    if (
      candidates.length === 0
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        const now = Date.now();

        for (
          const item of candidates
        ) {
          if (
            now - item.submittedAt >
            MAX_AUTO_POLL_MS
          ) {
            pauseTransaction(
              item.hash,
            );

            continue;
          }

          void refreshTransaction(
            item.hash,
          );
        }
      }, POLL_INTERVAL_MS);

    return () =>
      window.clearInterval(timer);
  }, [
    transactions,
    pauseTransaction,
    refreshTransaction,
  ]);

  const value =
    useMemo<TransactionContextValue>(
      () => ({
        transactions,
        trackTransaction,
        refreshTransaction,
        clearCompleted,
      }),
      [
        transactions,
        trackTransaction,
        refreshTransaction,
        clearCompleted,
      ],
    );

  return (
    <TransactionContext.Provider
      value={value}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context =
    useContext(TransactionContext);

  if (!context) {
    throw new Error(
      "useTransactions must be used inside TransactionProvider.",
    );
  }

  return context;
}
