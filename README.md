# PolicyDelta

**Consensus-backed semantic policy versioning and re-consent for AI agents.**

Hashes prove that a policy changed. PolicyDelta uses GenLayer to decide whether its **meaning** changed enough that consent must be renewed.

## Status

Contract foundation and reviewer-hardening are in active verification as of 2026-08-23.

Implemented in this baseline:

- versioned policy state;
- on-chain publisher provenance;
- principal/publisher separation;
- semantic material-change adjudication;
- independent validator evidence review;
- exact consequential decision binding;
- re-consent state machine;
- deadline-based fail-closed recovery;
- fresh proposal/supersession flow;
- Direct Mode regression suite targeting reviewer failure modes.

Current verification status:

- v1.3 reached 22/22 Direct Mode tests, GenVM validation, strict typecheck (0 errors / 0 warnings), and ABI generation;
- v1.3 was intentionally blocked from deployment because GenVM lint detected a nondeterministic-call reachability violation;
- v1.4 corrects that structure and must pass the same full gate before source freeze.

Still not claimed as complete:

- v1.4 full pinned-toolchain verification;
- Bradbury deployment and live validator/finality evidence;
- production frontend and browser E2E.

## Why GenLayer

A deterministic contract can compare hashes or bytes, but it cannot reliably decide whether a new natural-language policy expands an agent's authority, changes economic limits, weakens a safety restriction, or merely rewrites the same meaning.

PolicyDelta keeps deterministic state transitions deterministic and uses GenLayer only for the shared semantic judgment that must not depend on a single backend or model.

## Repository structure

```text
contracts/            PolicyDelta Intelligent Contract
tests/direct/         Direct Mode regression tests
docs/SPEC_V1.md       Contract and trust-model specification
docs/REVIEWER_GATES.md Reviewer rejection-prevention checklist
scripts/              Reproducible verification helpers
frontend/             Reserved for the public app
deploy/               Reserved for Bradbury deployment evidence
```

## Local verification target

Use Python 3.12+ and the current GenLayer testing/lint tooling compatible with the contract's pinned SDK header.

```bash
python -m pytest tests/direct -v
genvm-lint check contracts/policy_delta.py
genvm-lint typecheck contracts/policy_delta.py --strict
genvm-lint schema contracts/policy_delta.py --output abi.json
python scripts/verify_static.py
```

Direct Mode should run with strict mocks and pickling validation enabled in the final verified suite.

## Deployment rule

The project is not reviewer-ready merely because a contract has been deployed. Before submission, the repository source, deployed Explorer source, recorded source hash, and submitted Explorer link must all identify the same corrected contract version.
