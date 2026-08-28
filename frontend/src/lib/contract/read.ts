import { POLICY_DELTA_ADDRESS } from "./config";
import {
  normalizePolicy,
  normalizeVersion,
} from "./normalize";
import { readClient } from "@/lib/genlayer/client";
import { TransactionHashVariant } from "genlayer-js/types";

export type ContractReadFinality =
  | "finalized"
  | "provisional";

function transactionHashVariant(
  finality: ContractReadFinality,
) {
  return finality === "finalized"
    ? TransactionHashVariant.LATEST_FINAL
    : TransactionHashVariant.LATEST_NONFINAL;
}

export async function readPolicy(
  policyId: string,
  finality: ContractReadFinality =
    "finalized",
) {
  const result = await readClient.readContract({
    address: POLICY_DELTA_ADDRESS,
    functionName: "get_policy",
    args: [policyId],
    transactionHashVariant:
      transactionHashVariant(finality),
  });

  return normalizePolicy(
    policyId,
    result,
  );
}

export async function readActiveVersion(
  policyId: string,
  finality: ContractReadFinality =
    "finalized",
) {
  const result = await readClient.readContract({
    address: POLICY_DELTA_ADDRESS,
    functionName: "get_active_version",
    args: [policyId],
    transactionHashVariant:
      transactionHashVariant(finality),
  });

  return normalizeVersion(
    policyId,
    result,
  );
}

export async function readVersion(
  policyId: string,
  version: number,
  finality: ContractReadFinality =
    "finalized",
) {
  const result = await readClient.readContract({
    address: POLICY_DELTA_ADDRESS,
    functionName: "get_version",
    args: [policyId, version],
    transactionHashVariant:
      transactionHashVariant(finality),
  });

  return normalizeVersion(
    policyId,
    result,
  );
}

export async function readAuthorization(
  policyId: string,
  version: number,
  finality: ContractReadFinality =
    "finalized",
) {
  const result = await readClient.readContract({
    address: POLICY_DELTA_ADDRESS,
    functionName: "is_version_authorized",
    args: [policyId, version],
    transactionHashVariant:
      transactionHashVariant(finality),
  });

  return result === true;
}
