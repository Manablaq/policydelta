# PolicyDelta Frontend

Production frontend for PolicyDelta.

[https://policydelta.vercel.app](https://policydelta.vercel.app)

## Deployment

```text
Network:
GenLayer Bradbury Testnet

Chain ID:
4221

Contract:
0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E
```

The frontend consumes the frozen PolicyDelta Intelligent Contract.

Frontend implementation does not redefine contract authorization semantics.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- GenLayerJS
- TanStack Query
- Playwright
- Motion
- next-themes

## Product surfaces

The production application contains:

- public landing page;
- connected-wallet Overview;
- automatic wallet policy discovery;
- exact policy lookup;
- policy detail and lineage;
- semantic version comparison;
- PolicyDelta Activity history;
- deployment Evidence;
- finality-aware transaction center.

## Account architecture

PolicyDelta derives historical account state directly from Bradbury.

The account route reconstructs wallet history from Bradbury.

```text
Connected wallet
      ↓
ConsensusMain transaction logs
      ↓
EVM wallet origin
      ↓
Canonical GenLayer transaction
      ↓
Decoded PolicyDelta method
      ↓
Policy IDs + activity
      ↓
Current contract state
```

Account route:

```text
src/app/api/account/route.ts
```

Discovery implementation:

```text
src/lib/account/chain-discovery.ts
```

## Wallet boundary

Connecting a wallet:

```text
requests account access
verifies network
loads account context
```

Connecting does not automatically:

```text
sign
submit
execute a PolicyDelta write
```

When multiple injected wallet providers exist, PolicyDelta preserves explicit provider selection.

Immediately before a write, the frontend re-checks:

- selected provider;
- account;
- Bradbury chain.

## Write boundary

All application-level PolicyDelta writes are centralized through:

```text
src/hooks/use-policy-write.ts
```

Individual pages do not create independent signing pipelines.

## Finality handling

The frontend keeps these states separate:

```text
ACCEPTED
FINALIZED
FINISHED_WITH_RETURN
FINISHED_WITH_ERROR
```

Successful finalized execution requires:

```text
FINALIZED
+
FINISHED_WITH_RETURN
```

A finalized transaction with `FINISHED_WITH_ERROR` remains a failure.

Policy authority reads explicitly use `LATEST_FINAL`. Accepted automatic `NON_MATERIAL` review results are discovered through a separate `LATEST_NONFINAL` path and never replace finalized authority in the UI before finality.

For a connected principal, the global appeal alert:

- discovers `review_version` transactions regardless of submitter;
- displays finalized and provisional policy text side by side;
- checks `canAppeal` and `getMinAppealBond` through GenLayerJS;
- submits the native appeal with `appealTransaction`;
- refreshes every 30 seconds, on focus, and after appeal submission.

## Browser persistence

Recent submitted transaction references may be persisted locally for transaction UX.

That persistence is not used for historical wallet discovery or authoritative policy state.

Bradbury remains authoritative.

## Automatic refresh

Transaction-state changes invalidate relevant TanStack Query entries.

The frontend then reads live Bradbury state again.

No normal workflow requires a manual page reload after a successful state transition.

## Public configuration

```env
NEXT_PUBLIC_POLICY_DELTA_ADDRESS=0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-bradbury.genlayer.com
NEXT_PUBLIC_SITE_URL=https://policydelta.vercel.app
```

The application is pinned to Bradbury chain ID `4221`.

## Local development

```bash
npm ci
npm run dev
```

## Verification

```bash
npm run lint -- --max-warnings=0
npm run build
npm run test:e2e
```

Verified browser regression:

```text
28/28 PASS
```

## Real Bradbury account test

```bash
npx playwright test \
  tests/e2e/chain-account.spec.ts
```

This test uses live Bradbury history.

## Frontend QA policy

```text
policydelta-ui-qa-20260824-0412
```

Validated lifecycle:

```text
V1 create
→ V2 proposal
→ V2 NON_MATERIAL review
→ V2 ACTIVE
```

The three intended frontend transactions reached:

```text
FINALIZED
FINISHED_WITH_RETURN
```

## Production screenshots

Repository documentation screenshots are stored at:

```text
../docs/assets/screenshots/
```

They were captured from the real production application using a read-only documentation provider that blocked signing and transaction submission.

## Related documentation

- [`../README.md`](../README.md)
- [`../docs/README.md`](../docs/README.md)
- [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
- [`../docs/TESTING_AND_REPRODUCTION.md`](../docs/TESTING_AND_REPRODUCTION.md)
- [`../docs/REVIEWER_GUIDE.md`](../docs/REVIEWER_GUIDE.md)
