import type {
  PolicyRecord,
  PolicyVersionRecord,
} from "./types";

function recordFrom(
  value: unknown,
): Record<string, unknown> {
  if (value instanceof Map) {
    return Object.fromEntries(value);
  }

  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

function text(
  value: unknown,
  fallback = "",
) {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  return fallback;
}

function integer(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? Math.trunc(value)
      : 0;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed)
      ? Math.trunc(parsed)
      : 0;
  }

  return 0;
}

function boolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === 1 || value === "1") {
    return true;
  }

  if (value === 0 || value === "0") {
    return false;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return false;
}

export function normalizePolicy(
  policyId: string,
  value: unknown,
): PolicyRecord {
  const data = recordFrom(value);

  return {
    policyId,
    principal: text(data.principal),
    publisher: text(data.publisher),
    activeVersion: integer(
      data.active_version,
    ),
    nextVersion: integer(
      data.next_version,
    ),
    openVersion: integer(
      data.open_version,
    ),
    reviewTtlSeconds: integer(
      data.review_ttl_seconds,
    ),
    consentTtlSeconds: integer(
      data.consent_ttl_seconds,
    ),
    materialityRules: text(
      data.materiality_rules,
    ),
    exists:
      data.exists === undefined
        ? true
        : boolean(data.exists),
  };
}

export function normalizeVersion(
  fallbackPolicyId: string,
  value: unknown,
): PolicyVersionRecord {
  const data = recordFrom(value);

  return {
    policyId: text(
      data.policy_id,
      fallbackPolicyId,
    ),
    version: integer(data.version),
    parentVersion: integer(
      data.parent_version,
    ),
    policyText: text(data.policy_text),
    publisher: text(data.publisher),
    createdAt: integer(data.created_at),
    reviewDeadline: integer(
      data.review_deadline,
    ),
    consentDeadline: integer(
      data.consent_deadline,
    ),
    status: text(data.status, "UNKNOWN"),
    requiresReconsent: boolean(
      data.requires_reconsent,
    ),
    changeClass: text(
      data.change_class,
      "UNREVIEWED",
    ),
  };
}
