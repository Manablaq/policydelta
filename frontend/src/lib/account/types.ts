export type WalletPolicyRole =
  | "principal"
  | "publisher"
  | "both";

export type IndexedWalletPolicy = {
  wallet: string;
  policyId: string;
  role: WalletPolicyRole;
  firstSeenAt: string;
  updatedAt: string;
};

export type IndexedWalletActivity = {
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
  configured: boolean;
  wallet: string | null;
  policies: IndexedWalletPolicy[];
  activity: IndexedWalletActivity[];
};
