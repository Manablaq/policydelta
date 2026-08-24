# PolicyDelta Reviewer Guide

## Five-minute evaluation path

A reviewer can evaluate PolicyDelta's core safety property without submitting a transaction.

## 1. Open the production application

[https://policydelta.vercel.app](https://policydelta.vercel.app)

## 2. Confirm deployment identity

Open **Evidence**.

Expected:

```text
Network:
GenLayer Bradbury Testnet

Chain ID:
4221

Contract:
0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E
```

Frozen repository SHA:

```text
a0721813dd17d01b1d5cc57e9ac455152b6d4eba9daccff2d210d707835b70b2
```

## 3. Inspect the reference policy

Use:

```text
policydelta-bradbury-live-001
```

The important versions are:

```text
V3
  ACTIVE
  authorized = true

V6
  AWAITING_CONSENT
  ECONOMIC_CHANGE
  requires_reconsent = true
  authorized = false
```

## 4. Compare V3 and V6

Open **Compare**.

Use:

```text
Policy:
policydelta-bradbury-live-001

From:
V3

To:
V6
```

Expected stored verdict:

```text
ECONOMIC_CHANGE
```

The comparison UI separates literal presentation-layer differences from the stored GenLayer materiality verdict.

## 5. Verify the central safety property

The important invariant is:

> **V3 remains active and authorized while the material V6 replacement waits for renewed consent.**

Semantic review alone does not transfer authority.

## 6. Inspect Activity

The Activity page reconstructs real PolicyDelta history from Bradbury.

It intentionally distinguishes:

```text
FINALIZED + FINISHED_WITH_RETURN
```

from:

```text
FINALIZED + FINISHED_WITH_ERROR
```

A failed execution remains a failure.

## 7. Review deployment evidence

Start with:

```text
deploy/evidence/BRADBURY_VALIDATION_SUMMARY.md
```

Then inspect individual evidence under:

```text
deploy/evidence/live/
```

Final read-only snapshots are under:

```text
deploy/evidence/live/final/
```

## 8. Verify source provenance

Review:

```text
deploy/evidence/BRADBURY_SOURCE_PARITY.txt
```

Frozen local SHA:

```text
a0721813dd17d01b1d5cc57e9ac455152b6d4eba9daccff2d210d707835b70b2
```

Contract freeze commit:

```text
69835a0
```

## 9. Review wallet safety

Relevant frontend tests:

```text
frontend/tests/e2e/wallet.spec.ts
frontend/tests/e2e/wallet-multiprovider.spec.ts
frontend/tests/e2e/transaction-persistence.spec.ts
```

Important guarantees:

- connect does not automatically sign;
- connect does not automatically submit;
- writes use the explicitly selected provider;
- account/network are re-checked immediately before writes.

## 10. Run automated verification

Contract:

```bash
python -m pytest tests/direct -v
```

Frontend:

```bash
cd frontend

npm ci
npm run lint -- --max-warnings=0
npm run build
npm run test:e2e
```

Real Bradbury account reconstruction:

```bash
cd frontend

npx playwright test \
  tests/e2e/chain-account.spec.ts
```

## Evidence map

| Question | Best evidence |
| --- | --- |
| What problem does PolicyDelta solve? | Root `README.md` |
| What are the contract semantics? | `docs/SPEC_V1.md` |
| How does the architecture work? | `docs/ARCHITECTURE.md` |
| Was the deployed source frozen? | `deploy/evidence/BRADBURY_SOURCE_PARITY.txt` |
| Was it tested on Bradbury? | `deploy/evidence/BRADBURY_VALIDATION_SUMMARY.md` |
| How can tests be reproduced? | `docs/TESTING_AND_REPRODUCTION.md` |
| Is the frontend live? | `https://policydelta.vercel.app` |
| Where does wallet history come from? | Bradbury chain history — see `docs/ARCHITECTURE.md` |
| Are failed executions preserved as failures? | Activity + frontend E2E |

## Project boundary

PolicyDelta's Intelligent Contract is deployed to Bradbury Testnet.

The web application is production-hosted, but no GenLayer mainnet deployment is claimed.

## Reviewer thesis

The project should be evaluated around one core safety property:

> **A semantic policy change cannot silently inherit the authorization of the policy version the principal actually consented to.**
