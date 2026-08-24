export function humanizeEnum(
  value: string,
) {
  const normalized =
    value.trim();

  if (!normalized) {
    return "Unknown";
  }

  return normalized
    .split("_")
    .filter(Boolean)
    .map((part) => {
      const lower =
        part.toLowerCase();

      return (
        lower.charAt(0).toUpperCase() +
        lower.slice(1)
      );
    })
    .join(" ");
}

export function formatUnixTime(
  value: number,
) {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(value * 1000),
  );
}

export function statusClasses(
  status: string,
) {
  switch (status) {
    case "ACTIVE":
      return "bg-[var(--success-soft)] text-[var(--success)]";

    case "PROPOSED":
      return "bg-[var(--accent-soft)] text-[var(--accent-text)]";

    case "AWAITING_CONSENT":
      return "bg-[var(--warning-soft)] text-[var(--warning)]";

    case "REJECTED":
    case "EXPIRED":
      return "bg-red-500/10 text-red-500";

    case "SUPERSEDED":
    case "REPLACED":
      return "bg-[var(--surface-strong)] text-[var(--muted)]";

    default:
      return "bg-[var(--surface-strong)] text-[var(--muted)]";
  }
}

export function changeClassLabel(
  status: string,
  changeClass: string,
) {
  // A newly proposed version is initialized
  // with contract defaults before semantic
  // review. Those defaults are not a verdict.
  if (status === "PROPOSED") {
    return "Unreviewed";
  }

  return humanizeEnum(
    changeClass || "UNREVIEWED",
  );
}

export function reconsentLabel(
  status: string,
  requiresReconsent: boolean,
) {
  // Re-consent has not been determined while
  // semantic review is still pending.
  if (status === "PROPOSED") {
    return "Pending review";
  }

  return requiresReconsent
    ? "Required"
    : "Not required";
}
