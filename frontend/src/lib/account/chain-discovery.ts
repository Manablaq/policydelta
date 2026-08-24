import type {
  WalletAccountSnapshot,
  WalletActivityRecord,
  WalletPolicyRecord,
  WalletPolicyRole,
} from "@/lib/account/types";
import {
  extractPolicyDeltaCallFromTransaction,
} from "@/lib/account/server-verification";
import {
  POLICY_DELTA_ADDRESS,
} from "@/lib/contract/config";
import {
  readPolicy,
} from "@/lib/contract/read";
import {
  type GenLayerTransactionHash,
  readClient,
} from "@/lib/genlayer/client";

const BRADBURY_RPC =
  "https://rpc-bradbury.genlayer.com";

const CONSENSUS_MAIN =
  "0x0112Bf6e83497965A5fdD6Dad1E447a6E004271D";

const NEW_TRANSACTION_TOPIC =
  "0xdab9102861c7483a187584d6371d88316f005af507982ccf95c110879f3ed5a5";

/**
 * Exact L2 block containing the PolicyDelta deployment
 * NewTransaction event.
 */
export const POLICY_DELTA_DEPLOYMENT_BLOCK =
  18_847_788;

const POLICY_DELTA_TOPIC =
  `0x${"0".repeat(24)}${POLICY_DELTA_ADDRESS
    .slice(2)
    .toLowerCase()}`;

const LOG_CHUNK_SIZE = 3_000;
const RPC_CONCURRENCY = 8;

type RpcLog = {
  blockNumber: string;
  transactionHash: string;
  topics: string[];
};

type RpcTransaction = {
  from?: string | null;
};

type EventReference = {
  txId: string;
  evmHash: string;
  origin: string;
  blockNumber: number;
};

type DecodedHistoryItem = {
  hash: string;
  origin: string;
  sender: string;
  recipient: string;
  functionName: string | null;
  policyId: string | null;
  version: number | null;
  consensusStatus: string;
  executionStatus: string;
  timestampMs: number;
};

let eventCache:
  | {
      throughBlock: number;
      refs: EventReference[];
    }
  | null = null;

async function rpc<T>(
  method: string,
  params: unknown[],
): Promise<T> {
  const response =
    await fetch(
      BRADBURY_RPC,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method,
          params,
        }),
        cache: "no-store",
      },
    );

  if (!response.ok) {
    throw new Error(
      `Bradbury RPC ${method} returned HTTP ${response.status}.`,
    );
  }

  const payload:
    | {
        result?: T;
        error?: {
          code?: number;
          message?: string;
        };
      }
    = await response.json();

  if (payload.error) {
    throw new Error(
      `Bradbury RPC ${method} failed: ${payload.error.code ?? "unknown"} ${payload.error.message ?? ""}`.trim(),
    );
  }

  if (
    !Object.prototype.hasOwnProperty.call(
      payload,
      "result",
    )
  ) {
    throw new Error(
      `Bradbury RPC ${method} returned no result.`,
    );
  }

  return payload.result as T;
}

function blockHex(
  value: number,
) {
  return `0x${Math.trunc(
    value,
  ).toString(16)}`;
}

function blockNumber(
  value: string,
) {
  const parsed =
    Number.parseInt(
      value,
      16,
    );

  if (
    !Number.isSafeInteger(
      parsed,
    ) ||
    parsed < 0
  ) {
    throw new Error(
      `Invalid Bradbury block number: ${value}`,
    );
  }

  return parsed;
}

function validHash(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    /^0x[a-fA-F0-9]{64}$/.test(
      value,
    )
  );
}

function normalizedAddress(
  value: unknown,
) {
  return typeof value === "string"
    ? value.toLowerCase()
    : "";
}

function timestampMilliseconds(
  value: unknown,
) {
  let seconds:
    | number
    | null = null;

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    seconds = value;
  } else if (
    typeof value === "bigint"
  ) {
    seconds = Number(value);
  } else if (
    typeof value === "string"
  ) {
    const parsed =
      Number(value);

    if (
      Number.isFinite(parsed)
    ) {
      seconds = parsed;
    }
  }

  if (
    seconds === null ||
    seconds <= 0
  ) {
    return 0;
  }

  return Math.trunc(
    seconds * 1000,
  );
}

function isoTimestamp(
  milliseconds: number,
) {
  if (
    !Number.isFinite(
      milliseconds,
    ) ||
    milliseconds <= 0
  ) {
    return new Date(0)
      .toISOString();
  }

  return new Date(
    milliseconds,
  ).toISOString();
}

async function mapConcurrent<
  T,
  R
>(
  input: T[],
  limit: number,
  task:
    (
      value: T,
      index: number,
    ) => Promise<R>,
) {
  const results =
    new Array<R>(
      input.length,
    );

  let cursor = 0;

  async function worker() {
    while (
      cursor <
      input.length
    ) {
      const index =
        cursor++;

      results[index] =
        await task(
          input[index],
          index,
        );
    }
  }

  await Promise.all(
    Array.from(
      {
        length:
          Math.min(
            Math.max(
              1,
              limit,
            ),
            Math.max(
              1,
              input.length,
            ),
          ),
      },
      () => worker(),
    ),
  );

  return results;
}

async function fetchLogs(
  fromBlock: number,
  toBlock: number,
) {
  if (
    fromBlock >
    toBlock
  ) {
    return [] as RpcLog[];
  }

  const filter = {
    address:
      CONSENSUS_MAIN,
    topics: [
      NEW_TRANSACTION_TOPIC,
      null,
      POLICY_DELTA_TOPIC,
    ],
  };

  /**
   * Prefer one filtered request. If the RPC enforces a
   * block-range limit, fall back to deterministic chunks.
   */
  try {
    return await rpc<
      RpcLog[]
    >(
      "eth_getLogs",
      [
        {
          ...filter,
          fromBlock:
            blockHex(
              fromBlock,
            ),
          toBlock:
            blockHex(
              toBlock,
            ),
        },
      ],
    );
  } catch {
    const logs:
      RpcLog[] = [];

    for (
      let cursor =
        fromBlock;
      cursor <=
      toBlock;
      cursor +=
        LOG_CHUNK_SIZE
    ) {
      const end =
        Math.min(
          toBlock,
          cursor +
            LOG_CHUNK_SIZE -
            1,
        );

      const batch =
        await rpc<
          RpcLog[]
        >(
          "eth_getLogs",
          [
            {
              ...filter,
              fromBlock:
                blockHex(
                  cursor,
                ),
              toBlock:
                blockHex(
                  end,
                ),
            },
          ],
        );

      logs.push(
        ...batch,
      );
    }

    return logs;
  }
}

async function eventReferences() {
  const latestHex =
    await rpc<string>(
      "eth_blockNumber",
      [],
    );

  const latest =
    blockNumber(
      latestHex,
    );

  const fromBlock =
    eventCache
      ? eventCache
          .throughBlock +
        1
      : POLICY_DELTA_DEPLOYMENT_BLOCK;

  if (
    eventCache &&
    fromBlock >
      latest
  ) {
    return {
      latest,
      refs:
        eventCache.refs,
    };
  }

  const newLogs =
    await fetchLogs(
      fromBlock,
      latest,
    );

  const newRefs =
    (
      await mapConcurrent(
        newLogs,
        RPC_CONCURRENCY,
        async (
          log,
        ): Promise<
          EventReference | null
        > => {
          const txId =
            log.topics?.[1];

          if (
            !validHash(
              txId,
            ) ||
            !validHash(
              log.transactionHash,
            )
          ) {
            return null;
          }

          const evmTx =
            await rpc<
              RpcTransaction | null
            >(
              "eth_getTransactionByHash",
              [
                log.transactionHash,
              ],
            );

          const origin =
            normalizedAddress(
              evmTx?.from,
            );

          if (!origin) {
            return null;
          }

          return {
            txId:
              txId.toLowerCase(),
            evmHash:
              log.transactionHash
                .toLowerCase(),
            origin,
            blockNumber:
              blockNumber(
                log.blockNumber,
              ),
          };
        },
      )
    ).filter(
      (
        item,
      ): item is EventReference =>
        item !== null,
    );

  const merged =
    new Map<
      string,
      EventReference
    >();

  for (
    const ref of
    eventCache?.refs ??
    []
  ) {
    merged.set(
      ref.txId,
      ref,
    );
  }

  for (
    const ref of
    newRefs
  ) {
    merged.set(
      ref.txId,
      ref,
    );
  }

  const refs =
    [...merged.values()]
      .sort(
        (
          left,
          right,
        ) =>
          left.blockNumber -
          right.blockNumber,
      );

  eventCache = {
    throughBlock:
      latest,
    refs,
  };

  return {
    latest,
    refs,
  };
}

async function decodedHistory(
  refs:
    EventReference[],
) {
  const decoded =
    await mapConcurrent(
      refs,
      RPC_CONCURRENCY,
      async (
        ref,
      ): Promise<
        DecodedHistoryItem | null
      > => {
        try {
          const raw =
            await readClient
              .getTransaction({
                hash:
                  ref.txId as GenLayerTransactionHash,
              });

          const call =
            extractPolicyDeltaCallFromTransaction(
              raw,
            );

          const timestampMs =
            timestampMilliseconds(
              (
                raw as {
                  createdTimestamp?: unknown;
                }
              )
                .createdTimestamp,
            );

          return {
            hash:
              ref.txId,
            origin:
              ref.origin,
            sender:
              normalizedAddress(
                (
                  raw as {
                    sender?: unknown;
                  }
                ).sender,
              ),
            recipient:
              normalizedAddress(
                (
                  raw as {
                    recipient?: unknown;
                  }
                ).recipient,
              ),
            functionName:
              call.functionName,
            policyId:
              call.policyId,
            version:
              call.version,
            consensusStatus:
              typeof (
                raw as {
                  statusName?: unknown;
                }
              ).statusName ===
                "string"
                ? String(
                    (
                      raw as {
                        statusName:
                          string;
                      }
                    )
                      .statusName,
                  ).toUpperCase()
                : "UNKNOWN",
            executionStatus:
              typeof (
                raw as {
                  txExecutionResultName?: unknown;
                }
              )
                .txExecutionResultName ===
                "string"
                ? String(
                    (
                      raw as {
                        txExecutionResultName:
                          string;
                      }
                    )
                      .txExecutionResultName,
                  ).toUpperCase()
                : "UNKNOWN",
            timestampMs,
          };
        } catch {
          return null;
        }
      },
    );

  return decoded.filter(
    (
      item,
    ): item is DecodedHistoryItem =>
      item !== null &&
      item.recipient ===
        POLICY_DELTA_ADDRESS.toLowerCase(),
  );
}

function policyRole(
  wallet: string,
  principal: string,
  publisher: string,
): WalletPolicyRole | null {
  const normalized =
    wallet.toLowerCase();

  const principalMatch =
    principal.toLowerCase() ===
    normalized;

  const publisherMatch =
    publisher.toLowerCase() ===
    normalized;

  if (
    principalMatch &&
    publisherMatch
  ) {
    return "both";
  }

  if (principalMatch) {
    return "principal";
  }

  if (publisherMatch) {
    return "publisher";
  }

  return null;
}

export async function discoverWalletAccount(
  wallet: string,
): Promise<WalletAccountSnapshot> {
  const normalizedWallet =
    wallet.toLowerCase();

  const {
    latest,
    refs,
  } =
    await eventReferences();

  const history =
    await decodedHistory(
      refs,
    );

  const candidatePolicyIds =
    [
      ...new Set(
        history
          .map(
            (item) =>
              item.policyId,
          )
          .filter(
            (
              policyId,
            ): policyId is string =>
              typeof policyId ===
                "string" &&
              policyId.length > 0,
          ),
      ),
    ];

  const policies =
    (
      await mapConcurrent(
        candidatePolicyIds,
        RPC_CONCURRENCY,
        async (
          policyId,
        ): Promise<
          WalletPolicyRecord | null
        > => {
          try {
            const policy =
              await readPolicy(
                policyId,
              );

            if (
              !policy.exists
            ) {
              return null;
            }

            const role =
              policyRole(
                normalizedWallet,
                policy.principal,
                policy.publisher,
              );

            if (!role) {
              return null;
            }

            const matching =
              history.filter(
                (item) =>
                  item.policyId ===
                  policyId,
              );

            const timestamps =
              matching
                .map(
                  (item) =>
                    item.timestampMs,
                )
                .filter(
                  (value) =>
                    value > 0,
                );

            const first =
              timestamps.length
                ? Math.min(
                    ...timestamps,
                  )
                : 0;

            const last =
              timestamps.length
                ? Math.max(
                    ...timestamps,
                  )
                : first;

            return {
              wallet:
                normalizedWallet,
              policyId,
              role,
              firstSeenAt:
                isoTimestamp(
                  first,
                ),
              updatedAt:
                isoTimestamp(
                  last,
                ),
            };
          } catch {
            return null;
          }
        },
      )
    )
      .filter(
        (
          policy,
        ): policy is WalletPolicyRecord =>
          policy !== null,
      )
      .sort(
        (
          left,
          right,
        ) =>
          Date.parse(
            right.updatedAt,
          ) -
          Date.parse(
            left.updatedAt,
          ),
      );

  const ownedPolicyIds =
    new Set(
      policies.map(
        (policy) =>
          policy.policyId,
      ),
    );

  const activity:
    WalletActivityRecord[] =
    history
      .filter(
        (item) =>
          item.origin ===
            normalizedWallet &&
          item.sender ===
            normalizedWallet &&
          typeof item.functionName ===
            "string" &&
          typeof item.policyId ===
            "string" &&
          ownedPolicyIds.has(
            item.policyId,
          ),
      )
      .map(
        (item) => {
          const timestamp =
            isoTimestamp(
              item.timestampMs,
            );

          return {
            hash:
              item.hash,
            wallet:
              normalizedWallet,
            functionName:
              item.functionName as string,
            policyId:
              item.policyId,
            version:
              item.version,
            consensusStatus:
              item.consensusStatus,
            executionStatus:
              item.executionStatus,
            methodVerified: true,
            submittedAt:
              timestamp,
            updatedAt:
              timestamp,
          };
        },
      )
      .sort(
        (
          left,
          right,
        ) =>
          Date.parse(
            right.submittedAt,
          ) -
          Date.parse(
            left.submittedAt,
          ),
      );

  return {
    source:
      "bradbury",
    wallet:
      normalizedWallet,
    scannedFromBlock:
      POLICY_DELTA_DEPLOYMENT_BLOCK,
    scannedToBlock:
      latest,
    policies,
    activity,
  };
}
