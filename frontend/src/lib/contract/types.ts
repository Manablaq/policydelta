export type PolicyRecord = {
  policyId: string;
  principal: string;
  publisher: string;
  activeVersion: number;
  nextVersion: number;
  openVersion: number;
  reviewTtlSeconds: number;
  consentTtlSeconds: number;
  materialityRules: string;
  exists: boolean;
};

export type PolicyVersionRecord = {
  policyId: string;
  version: number;
  parentVersion: number;
  policyText: string;
  publisher: string;
  createdAt: number;
  reviewDeadline: number;
  consentDeadline: number;
  status: string;
  requiresReconsent: boolean;
  changeClass: string;
};
