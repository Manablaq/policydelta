# PolicyDelta Documentation

This directory contains the reviewer-facing technical documentation for PolicyDelta.

## Start here

If you are evaluating the project, use this order:

1. [`../README.md`](../README.md) — product overview, live deployment, screenshots, and core safety model.
2. [`REVIEWER_GUIDE.md`](REVIEWER_GUIDE.md) — fastest evaluation path.
3. [`ARCHITECTURE.md`](ARCHITECTURE.md) — system architecture and trust boundaries.
4. [`TESTING_AND_REPRODUCTION.md`](TESTING_AND_REPRODUCTION.md) — reproducible verification.
5. [`SPEC_V1.md`](SPEC_V1.md) — contract semantics and state machine.
6. [`../deploy/README.md`](../deploy/README.md) — Bradbury evidence index.

## Current deployment

| Item | Value |
| --- | --- |
| Application | `https://policydelta.vercel.app` |
| Network | GenLayer Bradbury Testnet |
| Chain ID | `4221` |
| Contract | `0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E` |
| Frozen SHA-256 | `a0721813dd17d01b1d5cc57e9ac455152b6d4eba9daccff2d210d707835b70b2` |

The appeal/finality remediation and previous-version lineage correction are published. The first live run proves false-negative surfacing and appeal; the post-fix live repetition correctly classified the same authority change as `OBLIGATION_CHANGE`. See [`../deploy/evidence/APPEAL_FINALITY_VALIDATION.md`](../deploy/evidence/APPEAL_FINALITY_VALIDATION.md) for the complete evidence boundary.

## Documents

### Reviewer Guide

[`REVIEWER_GUIDE.md`](REVIEWER_GUIDE.md)

Short path through the production application, reference policy, deployment identity, evidence, and test suite.

### Architecture

[`ARCHITECTURE.md`](ARCHITECTURE.md)

Covers:

- Intelligent Contract boundary;
- semantic consensus;
- deterministic authorization;
- chain-native wallet discovery;
- wallet-provider isolation;
- finality handling;
- read/write trust boundaries.

### Testing and Reproduction

[`TESTING_AND_REPRODUCTION.md`](TESTING_AND_REPRODUCTION.md)

Covers:

- Direct Mode regression;
- GenVM validation;
- frozen-source verification;
- Bradbury evidence;
- frontend E2E;
- real Bradbury account reconstruction.

### v1 Specification

[`SPEC_V1.md`](SPEC_V1.md)

Normative description of the PolicyDelta v1 contract model.

### Reviewer Gates

[`REVIEWER_GATES.md`](REVIEWER_GATES.md)

Checklist of reviewer-sensitive safety and release gates.

### Build Status

[`BUILD_STATUS.md`](BUILD_STATUS.md)

Current verified project state.

## Production screenshots

Real production screenshots are stored under:

```text
docs/assets/screenshots/
```

They include:

- landing;
- overview;
- policies;
- policy detail;
- V3 → V6 comparison;
- Activity;
- Evidence.

These screenshots were captured from the live production deployment with a read-only documentation wallet provider that blocked signing and transaction submission.
