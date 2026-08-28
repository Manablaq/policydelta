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

Current production frontend commit (pre-remediation):

```text
34052de0841e54939c6119b0fee58c67e5e958bb
```

## Frontend verification

```text
Lint:
PASS

Production build:
PASS

Playwright:
28/28 PASS

Real Bradbury account reconstruction:
PASS

Multi-provider wallet isolation:
PASS

Production deployment:
LIVE — remediation publish pending

Appeal/finality remediation candidate:
LOCAL PASS
```

## Account architecture

Historical wallet PolicyDelta state is reconstructed from Bradbury.

No private account database or manual historical import is required.

## Release readiness

The implementation, local regressions, historical Bradbury validation, and reviewer-facing documentation are complete. Production publication and the live checklist in `deploy/evidence/APPEAL_FINALITY_VALIDATION.md` remain open.

No additional Intelligent Contract deployment is required because the remediation preserves the frozen deployed contract source and changes integration read/appeal behavior.
