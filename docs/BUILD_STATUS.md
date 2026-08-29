# PolicyDelta Build Status — 2026-08-28

## Current state

PolicyDelta has completed:

- Intelligent Contract implementation;
- Direct Mode contract regression;
- GenVM validation;
- contract source freeze;
- Bradbury deployment;
- deployed-source parity verification;
- live Bradbury lifecycle validation;
- production frontend implementation;
- browser E2E regression;
- chain-native wallet-history reconstruction;
- normal Git-integrated Vercel production deployment;
- local appeal/finality remediation and regression verification.

The current remediation candidate is locally complete. Publishing it to the stable Vercel URL and capturing a real Bradbury appeal-window run remain required before resubmission.

## Contract identity

```text
Contract:
0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E

Network:
GenLayer Bradbury Testnet

Chain ID:
4221

Frozen SHA-256:
a0721813dd17d01b1d5cc57e9ac455152b6d4eba9daccff2d210d707835b70b2

Freeze commit:
69835a0
```

## Contract verification

```text
Direct Mode:
30/30 PASS

GenVM validation:
PASS

Strict type validation:
PASS

ABI generation:
PASS

Static verification:
PASS
```

## Deployment

Deployment transaction:

```text
0x66e01ac9797ebdf53a17fc56090bad546940adf3614350c362c711457b9b92ac
```

Deployed contract:

```text
0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E
```

Source parity evidence:

```text
deploy/evidence/BRADBURY_SOURCE_PARITY.txt
```

## Live Bradbury validation

Validated paths include:

- non-material review;
- material review;
- principal consent;
- rejection;
- fresh proposal after rejection;
- superseded review failure;
- superseded consent failure;
- proposal expiry;
- consent expiry;
- expiry recovery;
- final authorization state.

Evidence summary:

```text
deploy/evidence/BRADBURY_VALIDATION_SUMMARY.md
```

## Production frontend

```text
https://policydelta.vercel.app
```

Current production frontend commit:

```text
628277b
```

## Frontend verification

```text
Lint:
PASS

Production build:
PASS

Playwright:
31/31 PASS

Real Bradbury account reconstruction:
PASS

Multi-provider wallet isolation:
PASS

Production deployment:
LIVE — appeal/finality remediation published

First live false-negative appeal:
PASS — 11-validator appeal rejected the accepted NON_MATERIAL verdict

Lineage-display correction found by live run:
LOCAL PASS — publication and second accepted-window capture pending
```

## Account architecture

Historical wallet PolicyDelta state is reconstructed from Bradbury.

No private account database or manual historical import is required.

## Release readiness

The remediation is published and the first live appeal-window run is complete. Before resubmission, publish the lineage-display correction and repeat the accepted-window capture to verify finalized V1 is displayed against provisional V2. The exact remaining gate is recorded in `deploy/evidence/APPEAL_FINALITY_VALIDATION.md`.

No additional Intelligent Contract deployment is required because the remediation preserves the frozen deployed contract source and changes integration read/appeal behavior.
