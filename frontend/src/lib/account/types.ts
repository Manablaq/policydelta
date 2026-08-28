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
  relationship:
    | "submitted"
    | "affected_principal";
  submittedAt: string;
  updatedAt: string;
};

export type PrincipalReviewAlert = {
  hash: string;
  policyId: string;
  version: number;
  previousFinalizedVersion: number;
  previousFinalizedPolicyText: string;
  provisionalPolicyText: string;
  consensusStatus: string;
  executionStatus: string;
  changeClass: string;
  requiresReconsent: boolean;
  canAppeal: boolean;
  appealCheckAvailable: boolean;
  minAppealBond: string | null;
  appealCheckedAt: string;
  submittedAt: string;
};

export type WalletAccountSnapshot = {
  source: "bradbury";
  wallet: string;
  scannedFromBlock: number;
  scannedToBlock: number;
  policies: WalletPolicyRecord[];
  activity: WalletActivityRecord[];
  principalReviewAlerts:
    PrincipalReviewAlert[];
};
