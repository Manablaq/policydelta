# Appeal and Finality Validation

## Purpose

This evidence closes the reviewer question: can an incorrectly agreed `NON_MATERIAL` verdict be surfaced to the affected principal in time to use GenLayer Optimistic Democracy's existing appeal window?

## Implemented controls

- Normal policy, active-version, lineage, and authorization reads use `LATEST_FINAL`.
- `LATEST_NONFINAL` is used only by the accepted-review watcher.
- `review_version` transactions are associated with the policy principal regardless of transaction origin.
- An accepted automatic activation displays finalized and provisional policy text side by side.
- Appeal eligibility and minimum bond are queried from GenLayerJS.
- The principal appeal action rechecks eligibility and calls `appealTransaction` with the discovered minimum bond.
- Account surveillance refreshes every 30 seconds, on focus/reconnect, and after appeal submission.

## Local verification — complete

```text
python scripts/verify_static.py
  FINALITY/APPEAL GUARDS: PASS
  ADVERSARIAL CORPUS: PASS (8 cases)

python scripts/model_check.py
  FINALIZED AUTHORITY BOUNDARY: PASS

python -m pytest tests/direct -q
  30 passed

npm run lint -- --max-warnings=0
  PASS

npm run build
  PASS

npx playwright test
  31 passed
```

Key browser regressions:

```text
frontend/tests/e2e/principal-appeal.spec.ts
```

They simulate a permissionless reviewer submitting an authority-expanding change that consensus incorrectly accepts as `NON_MATERIAL`. The tests verify principal surfacing, finalized/provisional separation, live eligibility recheck, exact minimum bond, and wallet appeal submission.

Adversarial corpus:

```text
tests/corpus/adversarial_semantic_regressions.json
```

## Live Bradbury validation — first run complete

Durable run notes are recorded in:

```text
deploy/evidence/live/appeal-finality/LIVE_APPEAL_RUN_2026-08-28.md
```

- [x] Deploy the appeal/finality frontend to the stable production URL.
- [x] Confirm the deployed bundle uses explicit `LATEST_FINAL` authority reads.
- [x] Create a disposable Bradbury policy with distinct principal and publisher wallets.
- [x] Submit an authority-changing adversarial proposal from the corpus.
- [x] Produce an accepted automatic `NON_MATERIAL` false negative.
- [x] While the review transaction was `ACCEPTED`, observe the principal's global warning in the production account response.
- [x] Record `canAppeal = true` and minimum bond `0`.
- [x] Submit the appeal from the principal wallet before finality.
- [x] Record the appeal target transaction and contract explorer link. No separate appeal hash was printed by the CLI, so none is claimed.
- [x] Record the unanimous 11-validator appeal outcome.
- [x] Record the final authority state after the appealed transaction resolved: V1 authorized, V2 unauthorized and returned to `PROPOSED`.
- [ ] Deploy the lineage correction found by the live run.
- [ ] Repeat the accepted-window capture and verify the warning displays finalized V1 against provisional V2.

## Evidence slots

```text
Policy ID: policydelta-appeal-live-20260828-01
Principal: 0x1f87Ae197af539253978d435aD45cCf28Fb95024
Publisher: 0xe85c52ace2d8f281933dd313cfb745fe12c47ce5
Proposal version: 2
Review transaction ID: 0x1a57acb3f3b7b73e00819f575895de7be2467b3bd0dc2e3033f4796eb60288df
Minimum appeal bond: 0 GEN
Appeal submission hash: not emitted separately by the CLI
Appeal-round transaction/status: same review ID; 11-validator unanimous DETERMINISTIC_VIOLATION
Final transaction status: UNDETERMINED / DISAGREE / FINISHED_WITH_ERROR
Resolved authority check: V1 authorized; V2 unauthorized and PROPOSED
Production screenshot paths: none; accepted-window API fields were captured without a wallet-capable browser
Explorer: https://explorer-bradbury.genlayer.com/address/0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E
```

## Claim boundary

The first live run proves timely principal discovery, live appeal eligibility, principal appeal submission, a larger validator round, and rollback to the prior authority. It also found a production alert-comparison defect. Resubmission should wait until the lineage correction is deployed and the V1-versus-V2 accepted-window display is reverified live.
