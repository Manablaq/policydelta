# PolicyDelta v1 Specification

## Purpose

PolicyDelta is a GenLayer Intelligent Contract for deciding whether a proposed policy version materially changes previously consented authority and therefore requires fresh consent.

The consensus-critical question is intentionally narrow:

> Does the proposed policy version require re-consent under the policy's registered materiality rubric?

A deterministic contract can prove that bytes changed. PolicyDelta uses GenLayer only for the semantic decision that deterministic code cannot make safely.

## Trust model

The v1 core evidence is stored directly in contract state:

- exact prior policy text;
- exact proposed policy text;
- the registered materiality rubric;
- publisher address;
- principal address;
- version lineage and deadlines.

The contract therefore does not rely on a provider-selected mutable URL for the evidence that controls authorization. Publisher provenance is bound to an on-chain address: only the registered publisher can propose a new version.

## Roles

- **Principal** — the account that creates the policy and whose fresh consent is required for material changes.
- **Publisher** — the account authorized to propose policy updates.
- **Validators** — independently review the same old policy, new policy, and registered rubric.
- **Any account** — may trigger expiry recovery after a deadline passes.

## State machine

Initial creation records Version 1 as `ACTIVE`, because the principal creates the policy in the same transaction.

Subsequent versions move through:

```text
PROPOSED
  | review says non-material
  +--------------------------> ACTIVE
  |
  | review says re-consent required
  v
AWAITING_CONSENT
  | principal consents       -> ACTIVE
  | principal rejects        -> REJECTED
  | consent deadline passes  -> EXPIRED

PROPOSED + review deadline passes -> EXPIRED
PROPOSED/AWAITING_CONSENT + newer proposal -> SUPERSEDED
ACTIVE + newer version activated -> REPLACED
```

The previous active version remains authoritative until a replacement reaches `ACTIVE`. At that transition, the former active version is marked `REPLACED`, so historical status and `is_version_authorized()` remain consistent.

## Consensus boundary

Leader output contains only two consequential fields:

- `requires_reconsent: bool`
- `change_class: enum`

A leader response is rejected as malformed if these fields contradict one another.

The validator does **not** merely validate shape and does not receive the leader decision in its adjudication prompt. It independently re-runs the materiality classification over the exact prior policy text, proposed policy text, and immutable registered rubric, produces its own canonical `requires_reconsent` and `change_class`, validates that bounded schema, and then compares both consequential fields exactly against the leader result. Any field mismatch produces disagreement.

`requires_reconsent` and `change_class` are therefore the fields bound by consensus before state transition.

No payout percentage, confidence score, or fuzzy numerical tolerance controls downstream authorization.

## Fail-closed rules

1. A version in `PROPOSED` is never authorized.
2. A version in `AWAITING_CONSENT` is never authorized.
3. Expiry never activates a proposal.
4. Rejection never activates a proposal.
5. Superseding a proposal never activates the superseded version.
6. A proposal must be based on the currently active parent version when reviewed or consented.
7. Malformed semantic output fails the transaction rather than creating an authorization result.
8. The active version changes only through a successful non-material review or explicit principal consent after a material review.

## Prompt-injection boundary

Policy text and rubric are treated as untrusted evidence. Both leader and validator prompts explicitly instruct the model to ignore instructions embedded inside those evidence blocks. The contract additionally constrains the semantic output to a small schema and fixed change classes.

## Liveness

Every proposal has a review deadline. A material proposal also receives a consent deadline. After either deadline, expiry recovery is permissionless and leaves the previous active policy in force.

## Fresh-review behavior

A new proposal can be created even while an earlier proposal is open. The earlier open version is marked `SUPERSEDED`; the new proposal is compared against the still-authoritative active version. This prevents stale reports from blocking a corrected response while also preventing a new proposal from bypassing prior authority.

## Finality

Application UX must distinguish GenLayer `ACCEPTED` from `FINALIZED`. A transaction that is only accepted must not be represented as irreversible. Production integration must track the finality window before presenting a newly active policy as permanently settled.
