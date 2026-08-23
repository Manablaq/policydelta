# Build Status — 2026-08-23

## Verified on the user's pinned local toolchain before v1.4

The v1.3 source (`6cac6690ab5ef9d9b2ee3aaca885547d70a8f729a2a8eaa50a0bebc143a8d705`) produced this evidence on Python 3.12.14 with `genlayer-test==0.29.2` and `genvm-linter==0.11.0`:

- static reviewer guards: PASS;
- authorization/fail-closed model: PASS;
- Direct Mode: 22/22 PASS;
- GenVM semantic validation: PASS;
- strict typecheck: 0 errors, 0 warnings (SDK typing diagnostics remained informational);
- ABI generation: PASS;
- GenVM lint: **FAIL** because the `gl.nondet.exec_prompt` call was located in a nested helper that the linter could not prove reachable from the equivalence-principle block.

Therefore v1.3 is **not** deployment-ready and must not be submitted or deployed as the final source.

## v1.4 correction awaiting verification

v1.4 keeps the independent validator-recomputation design but moves `gl.nondet.exec_prompt(...)` directly into `leader_fn`, the function passed to `gl.vm.run_nondet_unsafe`. `validator_fn` independently invokes that computation on validator execution and compares the two exact consequential fields:

- `requires_reconsent`;
- `change_class`.

The leader decision is not inserted into the validator's adjudication prompt. All storage/state effects remain outside the non-deterministic block.

The v1.4 source must pass, in order:

1. static reviewer guards;
2. deterministic state-machine model;
3. all Direct Mode tests including validator agreement and disagreement;
4. `genvm-lint check` with both lint and validation passing;
5. strict typecheck;
6. ABI generation;
7. source hash capture.

Only after all seven pass may the source be frozen for Bradbury deployment.
