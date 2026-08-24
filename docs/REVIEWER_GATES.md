# PolicyDelta Reviewer Readiness Gates

This checklist records the gates used to prevent common Intelligent Contract submission failures.

## Source provenance

- [x] Contract source frozen before frontend work.
- [x] Frozen SHA recorded.
- [x] Bradbury deployment address recorded.
- [x] Deployment transaction recorded.
- [x] Deployed-source parity evidence recorded.
- [x] Frontend work did not modify the frozen contract.

Frozen SHA:

```text
a0721813dd17d01b1d5cc57e9ac455152b6d4eba9daccff2d210d707835b70b2
```

## Consensus-to-consequence binding

- [x] Semantic materiality is the nondeterministic judgment.
- [x] Consequential transitions remain constrained by contract logic.
- [x] Validator output is restricted to known change classes.
- [x] Review binds to the exact proposed version.
- [x] Stale or superseded review fails closed.

## State-machine integrity

- [x] Material changes enter `AWAITING_CONSENT`.
- [x] Awaiting-consent versions remain unauthorized.
- [x] Rejected versions remain unauthorized.
- [x] Expired versions remain unauthorized.
- [x] Superseded versions remain unauthorized.
- [x] Current authorization can be queried by exact version.

## Liveness

- [x] Proposal review has a deadline.
- [x] Consent has a deadline.
- [x] Expired versions can be recovered.
- [x] Fresh proposals can supersede stale open proposals.

## Contract testing

- [x] Direct Mode suite passes.
- [x] Material behavior covered.
- [x] Non-material behavior covered.
- [x] Rejection covered.
- [x] Supersession covered.
- [x] Expiry/recovery covered.

Verified:

```text
22/22 PASS
```

## Bradbury validation

- [x] Frozen source deployed to Bradbury.
- [x] Source parity recorded.
- [x] Non-material review finalized.
- [x] Material review finalized.
- [x] Consent path finalized.
- [x] Rejection path finalized.
- [x] Supersession failures observed.
- [x] Expiry recovery observed.
- [x] Final authority state recorded.

## Finality semantics

- [x] `ACCEPTED` is not presented as `FINALIZED`.
- [x] Consensus and execution states are separate.
- [x] `FINISHED_WITH_ERROR` is never treated as successful execution.

## Wallet safety

- [x] Wallet connect does not automatically sign.
- [x] Wallet connect does not automatically submit.
- [x] Multi-provider selection is explicit.
- [x] Writes remain bound to the selected provider.
- [x] Account/network are re-checked before writes.
- [x] Application writes are centralized through one guarded hook.

## Frontend

- [x] Public landing page.
- [x] Responsive application workspace.
- [x] Bradbury policy reads.
- [x] Automatic wallet policy discovery.
- [x] Chain-native wallet activity reconstruction.
- [x] Immutable version lineage.
- [x] Semantic comparison.
- [x] Evidence page.
- [x] Transaction center.
- [x] Light/dark theme.
- [x] Browser regression suite.

Verified:

```text
26/26 PASS
```

## Account architecture

- [x] Historical account state is derived from Bradbury.
- [x] Wallet-associated policies are discovered automatically.
- [x] Wallet history reconstructed from Bradbury.
- [x] Canonical GenLayer transaction decoding used.
- [x] Current contract state read after discovery.

## Production

- [x] Normal Git-integrated Vercel deployment.
- [x] Production deployment from `main`.
- [x] Stable production URL.
- [x] Production account endpoint verified.
- [x] Production Overview visually verified.
- [x] Production Activity visually verified.

Production:

```text
https://policydelta.vercel.app
```

## Documentation

- [x] Real production screenshots captured.
- [x] Architecture documented.
- [x] Finality model documented.
- [x] Testing and reproduction documented.
- [x] Reviewer quick-start documented.
- [x] Deployment evidence indexed.
- [x] Current production and deployment status documented.

## Submission rule

A final submission should reference only:

- the current repository;
- the frozen deployed contract;
- the current Bradbury evidence;
- the stable production application.

Do not submit obsolete contract deployments, Preview URLs, or pre-deployment status text.
