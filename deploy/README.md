# PolicyDelta Bradbury Deployment Evidence

This directory contains the deployment, source-provenance, live lifecycle, finality, expiry, and authorization evidence for the frozen PolicyDelta Intelligent Contract.

## Deployment identity

| Item | Value |
| --- | --- |
| Network | GenLayer Bradbury Testnet |
| Chain ID | `4221` |
| Contract | `0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E` |
| Deployment transaction | `0x66e01ac9797ebdf53a17fc56090bad546940adf3614350c362c711457b9b92ac` |
| Frozen SHA-256 | `a0721813dd17d01b1d5cc57e9ac455152b6d4eba9daccff2d210d707835b70b2` |
| Freeze commit | `69835a0` |

## Explorer links

Contract:

https://explorer-bradbury.genlayer.com/address/0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E

Deployment transaction:

https://explorer-bradbury.genlayer.com/tx/0x66e01ac9797ebdf53a17fc56090bad546940adf3614350c362c711457b9b92ac

## Start here

Consolidated validation summary:

```text
evidence/BRADBURY_VALIDATION_SUMMARY.md
```

Source parity:

```text
evidence/BRADBURY_SOURCE_PARITY.txt
```

Deployment finality:

```text
evidence/BRADBURY_DEPLOY_FINALIZED_0x66e01ac9797ebdf53a17fc56090bad546940adf3614350c362c711457b9b92ac.txt
```

## Reference policy

```text
policydelta-bradbury-live-001
```

The final high-value state is:

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

This demonstrates that semantic review of a material replacement does not silently transfer authority.

## Lifecycle evidence

Recorded evidence covers:

- creation;
- non-material review;
- material review;
- consent;
- rejection;
- fresh proposal after rejection;
- supersession;
- stale-operation execution failures;
- proposal expiry;
- consent expiry;
- expiry recovery;
- final authorization checks.

## Expiry policies

Separate disposable policies were used for expiry behavior:

```text
policydelta-expiry-live-001
policydelta-consent-expiry-live-001
```

## Final snapshots

Read-only final snapshots are under:

```text
evidence/live/final/
```

## Failed execution evidence

Intentionally invalid or stale operations provide evidence that final consensus does not automatically imply successful execution.

The frontend therefore preserves the distinction between:

```text
FINALIZED + FINISHED_WITH_RETURN
```

and:

```text
FINALIZED + FINISHED_WITH_ERROR
```

## Production application

```text
https://policydelta.vercel.app
```

The application's Evidence page exposes the same Bradbury contract identity recorded here.

## Related documentation

- [`../README.md`](../README.md)
- [`../docs/REVIEWER_GUIDE.md`](../docs/REVIEWER_GUIDE.md)
- [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
- [`../docs/TESTING_AND_REPRODUCTION.md`](../docs/TESTING_AND_REPRODUCTION.md)
