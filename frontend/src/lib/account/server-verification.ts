import {
  POLICY_DELTA_ADDRESS,
} from "@/lib/contract/config";
import {
  isPolicyWriteFunction,
  POLICY_WRITE_FUNCTIONS,
  type PolicyWriteFunction,
} from "@/lib/account/validation";
import {
  readPolicy,
} from "@/lib/contract/read";
import {
  readClient,
  type GenLayerTransactionHash,
} from "@/lib/genlayer/client";
import type {
  WalletPolicyRole,
} from "@/lib/account/types";

const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000";

const STATUS_BY_NUMBER:
  Record<number, string> = {
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

  if (
    typeof value === "number" ||
    typeof value === "bigint"
  ) {
    const numeric =
      Number(value);

    return (
      STATUS_BY_NUMBER[numeric] ??
      `STATUS_${numeric}`
    );
  }

  return "UNKNOWN";
}

function firstString(
  ...values: unknown[]
) {
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.length > 0
    ) {
      return value;
    }
  }

  return null;
}

function callDataField(
  value: unknown,
  key: string,
) {
  if (value instanceof Map) {
    return value.get(key);
  }

  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return (
      value as Record<
        string,
        unknown
      >
    )[key];
  }

  return undefined;
}

function decodedCallParts(
  raw: unknown,
) {
  const data =
    asRecord(raw);

  const decoded =
    asRecord(
      data.txDataDecoded,
    );

  const callData =
    decoded.callData;

  const structuredMethod =
    firstString(
      callDataField(
        callData,
        "method",
      ),
      decoded.functionName,
      decoded.function_name,
      decoded.method,
    );

  const rawArgs =
    callDataField(
      callData,
      "args",
    );

  return {
    structuredMethod,
    args:
      Array.isArray(rawArgs)
        ? rawArgs
        : null,
  };
}

function extractMethodFromRawTxData(
  value: unknown,
) {
  if (
    typeof value !== "string" ||
    !/^0x[0-9a-fA-F]+$/.test(
      value,
    ) ||
    value.length % 2 !== 0
  ) {
    return null;
  }

  try {
    const bytes =
      Buffer.from(
        value.slice(2),
        "hex",
      );

    const marker =
      Buffer.from(
        "method",
        "utf8",
      );

    const markerIndex =
      bytes.lastIndexOf(
        marker,
      );

    if (markerIndex < 0) {
      return null;
    }

    const searchStart =
      markerIndex +
      marker.length;

    const matches =
      POLICY_WRITE_FUNCTIONS.flatMap(
        (candidate) => {
          const candidateBytes =
            Buffer.from(
              candidate,
              "utf8",
            );

          const index =
            bytes.indexOf(
              candidateBytes,
              searchStart,
            );

          if (index < 0) {
            return [];
          }

          const prefixLength =
            index -
            searchStart;

          if (
            prefixLength < 0 ||
            prefixLength > 8
          ) {
            return [];
          }

          return [
            {
              candidate,
              index,
            },
          ];
        },
      );

    if (
      matches.length !== 1
    ) {
      return null;
    }

    return matches[0]
      .candidate;
  } catch {
    return null;
  }
}

export function extractFunctionNameFromTransaction(
  raw: unknown,
): PolicyWriteFunction | null {
  const data =
    asRecord(raw);

  const {
    structuredMethod,
  } =
    decodedCallParts(raw);

  if (structuredMethod) {
    return isPolicyWriteFunction(
      structuredMethod,
    )
      ? structuredMethod
      : null;
  }

  const rawMethod =
    extractMethodFromRawTxData(
      data.txData,
    ) ??
    extractMethodFromRawTxData(
      data.txCalldata,
    );

  return isPolicyWriteFunction(
    rawMethod,
  )
    ? rawMethod
    : null;
}

function positiveInteger(
  value: unknown,
) {
  if (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
  ) {
    return value;
  }

  if (
    typeof value === "bigint" &&
    value > BigInt(0) &&
    value <=
      BigInt(
        Number.MAX_SAFE_INTEGER,
      )
  ) {
    return Number(value);
  }

  if (
    typeof value === "string" &&
    /^[1-9][0-9]*$/.test(
      value,
    )
  ) {
    const parsed =
      Number(value);

    if (
      Number.isSafeInteger(
        parsed,
      )
    ) {
      return parsed;
    }
  }

  return null;
}

export function extractPolicyDeltaCallFromTransaction(
  raw: unknown,
) {
  const functionName =
    extractFunctionNameFromTransaction(
      raw,
    );

  if (!functionName) {
    return {
      functionName: null,
      policyId: null,
      version: null,
      metadataVerified: false,
    };
  }

  const {
    args,
  } =
    decodedCallParts(raw);

  if (!args) {
    return {
      functionName,
      policyId: null,
      version: null,
      metadataVerified: false,
    };
  }

  const first =
    args[0];

  const policyId =
    typeof first ===
      "string" &&
    first.length > 0 &&
    first.length <= 256
      ? first
      : null;

  if (!policyId) {
    return {
      functionName,
      policyId: null,
      version: null,
      metadataVerified: false,
    };
  }

  if (
    functionName ===
    "create_policy"
  ) {
    return {
      functionName,
      policyId,
      version: 1,
      metadataVerified: true,
    };
  }

  if (
    functionName ===
    "propose_version"
  ) {
    // The created version is a return
    // value, not a transaction argument.
    // Do not infer it from mutable state.
    return {
      functionName,
      policyId,
      version: null,
      metadataVerified: true,
    };
  }

  const version =
    positiveInteger(
      args[1],
    );

  return {
    functionName,
    policyId:
      version === null
        ? null
        : policyId,
    version,
    metadataVerified:
      version !== null,
  };
}

export function isFinalizedSuccessfulTransaction(
  consensusStatus: string,
  executionStatus: string,
) {
  return (
    consensusStatus ===
      "FINALIZED" &&
    executionStatus ===
      "FINISHED_WITH_RETURN"
  );
}

export async function policyRoleForWallet(
  wallet: string,
  policyId: string,
): Promise<WalletPolicyRole | null> {
  const policy =
    await readPolicy(policyId);

  if (!policy.exists) {
    return null;
  }

  const normalized =
    wallet.toLowerCase();

  const principal =
    policy.principal
      .toLowerCase() ===
    normalized;

  const publisher =
    policy.publisher
      .toLowerCase() ===
    normalized;

  if (
    principal &&
    publisher
  ) {
    return "both";
  }

  if (principal) {
    return "principal";
  }

  if (publisher) {
    return "publisher";
  }

  return null;
}

export async function verifyPolicyDeltaTransaction(
  input: {
    wallet: string;
    hash: string;
  },
) {
  const raw =
    await readClient.getTransaction({
      hash:
        input.hash as GenLayerTransactionHash,
    });

  const data =
    asRecord(raw);

  const consensusStatus =
    typeof data.statusName ===
      "string"
      ? data.statusName.toUpperCase()
      : statusName(
          data.status,
        );

  const executionStatus =
    typeof data
      .txExecutionResultName ===
    "string"
      ? data
          .txExecutionResultName
          .toUpperCase()
      : typeof data
            .executionResultName ===
          "string"
        ? data
            .executionResultName
            .toUpperCase()
        : "UNKNOWN";

  const sender =
    typeof data.sender ===
      "string"
      ? data.sender.toLowerCase()
      : "";

  const recipient =
    typeof data.recipient ===
      "string"
      ? data.recipient
          .toLowerCase()
      : "";

  if (
    consensusStatus ===
      "UNINITIALIZED" &&
    executionStatus ===
      "NOT_VOTED" &&
    sender === ZERO_ADDRESS &&
    recipient ===
      ZERO_ADDRESS
  ) {
    throw new Error(
      "Bradbury does not expose this transaction yet.",
    );
  }

  if (
    sender !==
    input.wallet.toLowerCase()
  ) {
    throw new Error(
      "Transaction sender does not match the connected wallet.",
    );
  }

  if (
    recipient !==
    POLICY_DELTA_ADDRESS.toLowerCase()
  ) {
    throw new Error(
      "Transaction does not target the PolicyDelta contract.",
    );
  }

  const call =
    extractPolicyDeltaCallFromTransaction(
      raw,
    );

  if (!call.functionName) {
    throw new Error(
      "Bradbury transaction method could not be independently verified.",
    );
  }

  const finalizedSuccess =
    isFinalizedSuccessfulTransaction(
      consensusStatus,
      executionStatus,
    );

  return {
    consensusStatus,
    executionStatus,
    functionName:
      call.functionName,
    policyId:
      call.metadataVerified
        ? call.policyId
        : null,
    version:
      call.metadataVerified
        ? call.version
        : null,
    methodVerified: true,
    metadataVerified:
      call.metadataVerified,
    finalizedSuccess,
  };
}
