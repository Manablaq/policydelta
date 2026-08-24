export const ADDRESS_RE =
  /^0x[a-fA-F0-9]{40}$/;

export const HASH_RE =
  /^0x[a-fA-F0-9]{64}$/;

export const POLICY_WRITE_FUNCTIONS = [
  "create_policy",
  "propose_version",
  "review_version",
  "consent_to_version",
  "reject_version",
  "recover_expired_version",
] as const;

export type PolicyWriteFunction =
  (typeof POLICY_WRITE_FUNCTIONS)[number];

export function normalizeWallet(
  value: string,
) {
  const trimmed = value.trim();

  if (!ADDRESS_RE.test(trimmed)) {
    return null;
  }

  return trimmed.toLowerCase();
}

export function validHash(
  value: string,
) {
  return HASH_RE.test(value.trim());
}

export function isPolicyWriteFunction(
  value: unknown,
): value is PolicyWriteFunction {
  return (
    typeof value === "string" &&
    (
      POLICY_WRITE_FUNCTIONS as readonly string[]
    ).includes(value)
  );
}
