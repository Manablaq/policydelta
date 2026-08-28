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
  28 passed
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

## Live Bradbury validation — required before resubmission

Do not mark these items complete without durable evidence.

- [ ] Deploy the current frontend candidate to the stable production URL.
- [ ] Confirm the deployed bundle uses explicit `LATEST_FINAL` authority reads.
- [ ] Create a disposable Bradbury policy with distinct principal and publisher wallets.
- [ ] Submit an authority-changing adversarial proposal from the corpus.
- [ ] Produce or intentionally stage an accepted automatic `NON_MATERIAL` verdict for the false-negative exercise.
- [ ] While the review transaction is `ACCEPTED`, capture the connected principal's global warning.
- [ ] Record the finalized and provisional versions/text shown in the warning.
- [ ] Record `canAppeal = true` and the displayed minimum bond.
- [ ] Submit the appeal from the principal wallet before finality.
- [ ] Record the appeal transaction/EVM hash and explorer links.
- [ ] Record the larger validator round outcome.
- [ ] Prove ordinary authority reads remained on the prior finalized version throughout the open appeal window.
- [ ] Record the final authority state after the appealed transaction resolves.

## Evidence slots

```text
Policy ID:
Principal:
Publisher:
Proposal version:
Review transaction ID:
Accepted timestamp:
Minimum appeal bond:
Appeal submission hash:
Appeal-round transaction/status:
Final transaction status:
Prior finalized authority check:
Resolved authority check:
Production screenshot paths:
Explorer links:
```

## Claim boundary

Local implementation and regression evidence are complete. Production publication and a real Bradbury appeal-window run require the principal wallet and must be completed before the submission claims live closure of the reviewer request.
