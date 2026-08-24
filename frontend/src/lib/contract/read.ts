import { POLICY_DELTA_ADDRESS } from "./config";
import {
  normalizePolicy,
  normalizeVersion,
} from "./normalize";
import { readClient } from "@/lib/genlayer/client";

export async function readPolicy(
  policyId: string,
) {
  const result = await readClient.readContract({
    address: POLICY_DELTA_ADDRESS,
    functionName: "get_policy",
    args: [policyId],
  });

  return normalizePolicy(
    policyId,
    result,
  );
}

export async function readActiveVersion(
  policyId: string,
) {
  const result = await readClient.readContract({
    address: POLICY_DELTA_ADDRESS,
    functionName: "get_active_version",
    args: [policyId],
  });

  return normalizeVersion(
    policyId,
    result,
  );
}

export async function readVersion(
  policyId: string,
  version: number,
) {
  const result = await readClient.readContract({
    address: POLICY_DELTA_ADDRESS,
    functionName: "get_version",
    args: [policyId, version],
  });

  return normalizeVersion(
    policyId,
    result,
  );
}

export async function readAuthorization(
  policyId: string,
  version: number,
) {
  const result = await readClient.readContract({
    address: POLICY_DELTA_ADDRESS,
    functionName: "is_version_authorized",
    args: [policyId, version],
  });

  return result === true;
}
