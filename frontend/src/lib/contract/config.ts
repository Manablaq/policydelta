import policyDeltaAbi from "./policy-delta.abi.json";

export const POLICY_DELTA_ADDRESS =
  (process.env.NEXT_PUBLIC_POLICY_DELTA_ADDRESS ??
    "0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E") as `0x${string}`;

export const POLICY_DELTA_ABI = policyDeltaAbi;

export const GENLAYER_NETWORK = "testnetBradbury" as const;
export const GENLAYER_CHAIN_ID = 4221;

export const GENLAYER_EXPLORER_URL =
  process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL ??
  "https://explorer-bradbury.genlayer.com";
