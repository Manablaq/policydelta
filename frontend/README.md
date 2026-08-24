# PolicyDelta frontend

Production frontend for PolicyDelta, built with Next.js App Router, TypeScript,
Tailwind CSS, GenLayerJS, TanStack Query, Motion, and next-themes.

## Product boundary

The frontend consumes the already-frozen PolicyDelta Intelligent Contract.
Frontend implementation must not change contract semantics to simplify UI work.

Bradbury contract:

`0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E`

Network:

- GenLayer Bradbury Testnet
- Chain ID: `4221`

## Non-negotiable UX requirements

- public landing page before the application workspace;
- clear product explanation and how-it-works flow;
- old/new policy versions side-by-side;
- materiality verdict and re-consent state;
- never label `ACCEPTED` as `FINALIZED`;
- never treat execution failure as successful contract execution;
- never show awaiting/rejected/expired/superseded versions as authorized;
- expose version lineage and immutable history;
- automatic query refresh after transaction state changes;
- no manual browser reload required after writes;
- persistent light/dark theme;
- responsive mobile and desktop layouts;
- reduced-motion accessibility support;
- explicit error and recovery states.

## Visual direction

PolicyDelta uses Instrument Sans Variable for its primary UI and JetBrains Mono
Variable for addresses, hashes, IDs, and transaction metadata.

The landing page is editorial and narrative. The application workspace is a
structured trust/operations console rather than a generic crypto dashboard.

## Production metadata

Set `NEXT_PUBLIC_SITE_URL` to the canonical deployed origin when a
custom production domain is known. On Vercel, PolicyDelta falls back to
the platform-provided `VERCEL_URL`; local builds fall back to
`http://localhost:3000`.

## Runtime configuration

PolicyDelta is intentionally pinned to the GenLayer Bradbury Testnet
(`testnetBradbury`, chain ID `4221`) in application configuration.

Public deployment configuration:

```env
NEXT_PUBLIC_POLICY_DELTA_ADDRESS=0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-bradbury.genlayer.com
NEXT_PUBLIC_SITE_URL=
```

`NEXT_PUBLIC_SITE_URL` is optional. On Vercel, metadata falls back to
`VERCEL_URL`; local builds fall back to `http://localhost:3000`.

## Local verification

```bash
npm ci
npm run lint -- --max-warnings=0
npm run build
npm run test:e2e
```

The browser suite covers the public landing experience, responsive
application shell, live Bradbury policy reads, immutable lineage,
side-by-side comparison, transaction persistence/finality semantics,
wallet permissions, and the transaction activity overlay.

## Bradbury live frontend QA

A disposable Bradbury policy was used to verify the real frontend write
path without changing the validated reference policy.

The exercised lifecycle was:

1. create V1;
2. propose byte-identical V2;
3. review V2 through the deterministic non-material path.

All three submitted frontend transactions were observed as `FINALIZED`
with `FINISHED_WITH_RETURN`.

The resulting on-chain policy state was:

- V2 `ACTIVE` and authorized;
- V1 `REPLACED`;
- no open replacement;
- change class `NON_MATERIAL`;
- re-consent not required.

`ACCEPTED` is never treated as finality, and an accepted transaction
with `FINISHED_WITH_ERROR` is not treated as successful execution.
