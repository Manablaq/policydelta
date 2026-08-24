# PolicyDelta Testing and Reproduction

## Verification philosophy

PolicyDelta separates verification into distinct layers:

1. deterministic contract regression;
2. source/toolchain verification;
3. live Bradbury execution evidence;
4. production frontend/browser verification.

Passing one layer does not substitute for the others.

## Verified deployment identity

```text
Network:
GenLayer Bradbury Testnet

Chain ID:
4221

Contract:
0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E

Frozen contract SHA-256:
a0721813dd17d01b1d5cc57e9ac455152b6d4eba9daccff2d210d707835b70b2
```

## Contract regression

From the repository root:

```bash
source .venv/bin/activate

python -m pytest \
  tests/direct \
  -v
```

Verified result:

```text
22/22 PASS
```

The Direct Mode suite covers state-machine and reviewer-sensitive contract behavior.

## GenVM verification

```bash
genvm-lint check \
  contracts/policy_delta.py

genvm-lint typecheck \
  contracts/policy_delta.py \
  --strict

genvm-lint schema \
  contracts/policy_delta.py \
  --output abi.json
```

The frozen contract candidate passed these gates before deployment.

## Static verification

```bash
python scripts/verify_static.py
```

Static verification is an additional repository gate and does not replace runtime execution tests.

## Frozen-source verification

Expected SHA:

```text
a0721813dd17d01b1d5cc57e9ac455152b6d4eba9daccff2d210d707835b70b2
```

Verify locally:

```bash
shasum -a 256 \
  contracts/policy_delta.py
```

The output must match exactly.

Deployed-source parity evidence is stored at:

```text
deploy/evidence/BRADBURY_SOURCE_PARITY.txt
```

## Bradbury deployment evidence

Deployment transaction:

```text
0x66e01ac9797ebdf53a17fc56090bad546940adf3614350c362c711457b9b92ac
```

Contract:

```text
0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E
```

Consolidated live-network evidence:

```text
deploy/evidence/BRADBURY_VALIDATION_SUMMARY.md
```

## Live lifecycle validation

Bradbury evidence covers:

- policy creation;
- non-material semantic review;
- automatic non-material activation;
- material semantic review;
- principal consent;
- rejection;
- fresh proposal after rejection;
- superseded review failure;
- superseded consent failure;
- proposal expiry;
- consent expiry;
- recovery of expired versions;
- current authority checks;
- final state snapshots.

## Reference policy

```text
policydelta-bradbury-live-001
```

High-value final state:

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

This demonstrates the central invariant: V3 remains authoritative while the material V6 replacement waits for explicit consent.

## Frontend regression

From `frontend/`:

```bash
npm ci

npm run lint -- --max-warnings=0

npm run build

npm run test:e2e
```

Verified browser suite:

```text
26/26 PASS
```

## Browser coverage

The frontend suite covers:

- landing page;
- responsive application shell;
- live Bradbury policy reads;
- account workspace;
- chain-native wallet history;
- policy lookup;
- policy lineage;
- version comparison;
- Evidence page;
- transaction persistence;
- finality semantics;
- execution-failure semantics;
- wallet permissions;
- multi-provider selection;
- explicit write provider binding.

## Real Bradbury account reconstruction

Live-network test:

```text
frontend/tests/e2e/chain-account.spec.ts
```

Run independently:

```bash
cd frontend

npx playwright test \
  tests/e2e/chain-account.spec.ts
```

This test requires Bradbury network access.

It verifies real Bradbury history rather than a mocked historical account index.

## Known QA wallet history

The wallet used during live QA reconstructed four PolicyDelta policies automatically:

```text
policydelta-ui-qa-20260824-0412
policydelta-bradbury-live-001
policydelta-consent-expiry-live-001
policydelta-expiry-live-001
```

## Production-browser write-path QA

Disposable policy:

```text
policydelta-ui-qa-20260824-0412
```

Lifecycle:

```text
create V1
→ propose byte-identical V2
→ review V2
→ NON_MATERIAL
→ V2 ACTIVE
```

Transactions:

```text
create:
0xd95aad16684b502cc2e7c626d652ede438f4202ed2c1078db39851f5b2476586

propose:
0xfb252612a74dfea8acc1f0aa4af1d2f2d9a7476b0f0a8611a2a097737444093e

review:
0x6d6c4e09b7c7d8941ee4ba6d8c201dfebce8e1a575750d3dccad3dc2ed5b0203
```

All three completed with:

```text
FINALIZED
FINISHED_WITH_RETURN
```

## Execution failure regression

Representative historical failed review:

```text
0x926c27a434f56d97154a6142ba834f1c7510ce27272f85867cebe54e148846f6
```

Final state:

```text
FINALIZED
FINISHED_WITH_ERROR
```

PolicyDelta must never display or count that as a successful write.

## Production verification

Production application:

```text
https://policydelta.vercel.app
```

Verified production behavior includes:

- root application reachable;
- workspace reachable;
- production account endpoint reachable;
- automatic Bradbury wallet-policy reconstruction;
- automatic Bradbury historical activity reconstruction;
- real QA transactions visible;
- failed execution retained as failure.

## Related documentation

- [`../README.md`](../README.md)
- [`ARCHITECTURE.md`](ARCHITECTURE.md)
- [`REVIEWER_GUIDE.md`](REVIEWER_GUIDE.md)
- [`../deploy/README.md`](../deploy/README.md)
