export type WalletPolicyRole =
  | "principal"
  | "publisher"
  | "both";

export type WalletPolicyRecord = {
  wallet: string;
  policyId: string;
  role: WalletPolicyRole;
  firstSeenAt: string;
  updatedAt: string;
};

export type WalletActivityRecord = {
  hash: string;
  wallet: string;
  functionName: string;
  policyId: string | null;
  version: number | null;
  consensusStatus: string;
  executionStatus: string;
  methodVerified: boolean;
  submittedAt: string;
  updatedAt: string;
};

export type WalletAccountSnapshot = {
  source: "bradbury";
  wallet: string;
  scannedFromBlock: number;
  scannedToBlock: number;
  policies: WalletPolicyRecord[];
  activity: WalletActivityRecord[];
};
