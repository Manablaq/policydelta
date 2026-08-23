# Reviewer Readiness Gates

PolicyDelta must not be submitted until every applicable gate below has evidence.

## Evidence and provenance
- [ ] Core settlement/authorization evidence is immutable or versioned.
- [ ] The publisher identity is bound on-chain; arbitrary provider-selected URLs cannot control the decision.
- [ ] If external evidence is added later, approved publishers/signing keys, freshness, version pinning, and corroboration rules are explicit.
- [ ] No stale mutable page can silently replace the evidence validators thought they reviewed.

## Consensus-to-consequence binding
- [ ] Validators independently recompute the canonical decision from the actual evidence and rubric without being shown the leader decision in their adjudication prompt; no shape-only validator.
- [ ] Every field used by downstream authorization is consensus-bound.
- [ ] No tolerance allows validators to accept different consequential values while the leader's exact value controls state or funds.
- [ ] Malformed or contradictory leader output fails closed.

## State-machine integrity
- [ ] No alternate write method bypasses review or re-consent.
- [ ] A suspended/pending/awaiting proposal cannot become active through an unchanged-field update.
- [ ] Parent version is checked before review and consent.
- [ ] New responses/proposals can trigger a fresh review without erasing history.
- [ ] Replaced, superseded, rejected, and expired versions remain unauthorized and their stored status cannot still claim `ACTIVE`.

## Liveness
- [ ] Review deadline exists.
- [ ] Consent deadline exists for material changes.
- [ ] Expiry recovery is permissionless.
- [ ] Failure/expiry preserves the last valid active policy.

## Testing
- [ ] Direct Mode happy path passes.
- [ ] Validator agreement is exercised with `direct_vm.run_validator()`.
- [ ] Validator disagreement is explicitly exercised.
- [ ] Malformed LLM output is covered.
- [ ] Review-expiry and consent-expiry are covered.
- [ ] Superseding an open proposal is covered.
- [ ] Unauthorized publisher/principal paths are covered.
- [ ] Pickling checks pass.
- [ ] GenVM lint, validation, strict typecheck, and ABI extraction pass.
- [ ] Bradbury live tests cover approval and denial/disagreement behavior.
- [ ] Finality is proven separately from acceptance.

## Deployment provenance
- [ ] Contract source hash recorded immediately before deployment.
- [ ] Explorer source matches the repository source exactly.
- [ ] Submitted Explorer link points to the corrected/current deployment, never an earlier deployment.
- [ ] Deployment address, tx hash, network, source hash, and repository commit are recorded together.

## Frontend
- [ ] `ACCEPTED` is visually distinct from `FINALIZED`.
- [ ] Pending re-consent is visibly not authorized.
- [ ] Fresh review is available after a superseding response/version.
- [ ] No UI path claims a version is active when the contract says otherwise.
