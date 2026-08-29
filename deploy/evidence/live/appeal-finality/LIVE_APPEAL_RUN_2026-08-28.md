# Live Bradbury false-negative appeal run — 2026-08-28

## Scope

This run exercises the exact residual risk raised by the reviewer: a permissionless review incorrectly agrees that an authority-changing edit is `NON_MATERIAL`, the affected principal is notified while the transaction is accepted but not final, and the principal appeals before finality.

Network: Bradbury (`chainId 4221`)

Contract: `0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E`

Policy ID: `policydelta-appeal-live-20260828-01`

Principal: `0x1f87Ae197af539253978d435aD45cCf28Fb95024`

Distinct publisher/reviewer: `0xe85c52ace2d8f281933dd313cfb745fe12c47ce5`

## Authority-changing semantic regression

V1:

> The agent must obtain principal approval before every transfer.

V2:

> The agent should obtain principal approval before every transfer.

This is the `modal-obligation-weakening` adversarial corpus pattern. Replacing “must” with “should” weakens a mandatory approval gate, so the expected class is `OBLIGATION_CHANGE`, not `NON_MATERIAL`.

## Transaction record

| Event | GenLayer transaction ID | Observed result |
| --- | --- | --- |
| Initial create attempt | `0x7b059cd6590be40f494dadd83f0df4b6769bc0c8536acd96a6c4a67095e4a71a` | Finalized with execution error; no state change. The CLI encoded the publisher as an Address object although the contract constructor expects a string. |
| Correct V1 create | `0xee5d789d310481b9f5ff46c761838f0976425cc43dab6179b2b0296397012d37` | `FINALIZED / FINISHED_WITH_RETURN`. |
| V2 proposal | `0xc398adc037dc4e84bd558d291029e61a4b91cf642ce284a6dcc4e5ebe33d1f5f` | Accepted and later finalized. Submitted by the distinct publisher. |
| Earlier review attempt | `0xf0226168d6f58754e54202669912c5c830f296a218d9948f1633e85231c0dc9e` | The production history currently reports `FINALIZED / FINISHED_WITH_RETURN`; this transaction is not used as the appeal proof. |
| False-negative review and appeal target | `0x1a57acb3f3b7b73e00819f575895de7be2467b3bd0dc2e3033f4796eb60288df` | Initially `ACCEPTED / FINISHED_WITH_RETURN` with decoded class `NON_MATERIAL`; after the principal appeal, `UNDETERMINED / FINISHED_WITH_ERROR` with `DISAGREE`. |

The correct create transaction exposed an exact ready-to-finalize timestamp of `2026-08-28T22:24:53Z` and became final at approximately `2026-08-28T22:25:13Z`. This directly demonstrated an accepted-to-finality interval on Bradbury.

## Evidence captured during the accepted window

While transaction `0x1a57…88df` was `ACCEPTED / FINISHED_WITH_RETURN`, the production `/api/account` response for the principal contained a global `principalReviewAlerts` entry with:

```text
relationship: affected_principal
policyId: policydelta-appeal-live-20260828-01
version: 2
consensusStatus: ACCEPTED
executionStatus: FINISHED_WITH_RETURN
changeClass: NON_MATERIAL
requiresReconsent: false
canAppeal: true
appealCheckAvailable: true
minAppealBond: 0
```

The CLI independently returned a minimum appeal bond of `0 GEN`.

The live response also exposed a comparison defect: it reported V2 as both `previousFinalizedVersion` and the provisional version. That defect is not concealed as evidence. It led directly to the regression fix that derives previous authority from the reviewed version’s immutable `parentVersion` and only emits an actionable alert for `ACCEPTED` reviews.

## Appeal outcome

The principal submitted the zero-bond appeal before finality. The appeal reused the target GenLayer transaction ID; the CLI did not print a separate appeal transaction ID.

The appeal expanded the validator round to 11 validators. All 11 reported `DETERMINISTIC_VIOLATION`. The resulting transaction state was:

```text
transaction: 0x1a57acb3f3b7b73e00819f575895de7be2467b3bd0dc2e3033f4796eb60288df
consensus status: UNDETERMINED
consensus result: DISAGREE
execution status: FINISHED_WITH_ERROR
execution result: MALFORMED_SEMANTIC_DECISION
```

The production account endpoint subsequently confirmed the same transaction as `UNDETERMINED / FINISHED_WITH_ERROR`, with `relationship: affected_principal`, and returned no actionable principal review alert.

## Authority after resolution

Post-appeal contract reads showed:

```text
active_version: 1
open_version: 2
V2 status: PROPOSED
is_version_authorized(V1): true
is_version_authorized(V2): false
```

The incorrectly accepted automatic activation therefore did not become the durable authority. The prior mandatory-approval policy remained authorized.

## Evidence boundary

- The accepted-window API fields were observed live but no wallet-connected screenshot was captured; the available in-app browser had no wallet provider.
- No separate appeal EVM hash is claimed because the CLI returned the appealed GenLayer transaction ID rather than a distinct hash.
- The post-appeal production endpoint observation was repeated on 2026-08-29 with a scan through Bradbury block `19560017`.
- Production commit `56da646` deploys the lineage fix. Direct browser regressions prove that a reviewed V3 with `parent_version = 1` displays V1 as the prior authority and that only `ACCEPTED` reviews are actionable.

## Post-deployment live repetition — 2026-08-29

The same modal-obligation-weakening edit was repeated after production commit `56da646` was `READY` at the stable URL.

| Event | GenLayer transaction ID | Observed result |
| --- | --- | --- |
| Recover expired V2 | `0x97cb7ae781bf42c3f113f4b4d622a432a92443127759974639fac7cd8b447be5` | Accepted with five agreeing validators. |
| Propose V3 | `0xe1df7000f95523f4d72e2aeb70324c80f25b861fe93e4eb8fcbd42e131c394e8` | Accepted; V3 records `parent_version = 1`. |
| Initial V3 review | `0x7281b21e6cab6278fe49f25103cde8e6029899dd8d2969850bee746b4b20142c` | Returned the safe `OBLIGATION_CHANGE` semantic output but ended `UNDETERMINED` after validator timeouts. |
| Publisher V3 retry | `0x9454677b377263a95729e52acdf0ee8c5dfdab4099433dba2b6141790d7dfd5a` | `ACCEPTED / FINISHED_WITH_RETURN`; five validators unanimously agreed on `OBLIGATION_CHANGE` and `requires_reconsent = true`. |
| Competing principal retry | `0x7794bd05efb8a14f798dedee7d0a014520285444f2b714d96b5af17dfd0d219e` | `ACCEPTED / FINISHED_WITH_ERROR` after the publisher review had already changed V3 to a non-reviewable state; no authority change. |

The production principal endpoint attributed the publisher reviews to the affected principal. It correctly returned no `principalReviewAlerts` entry because the accepted publisher retry was material and required consent, not an automatic `NON_MATERIAL` activation.

Post-review contract reads:

```text
active_version: 1
open_version: 3
V3 parent_version: 1
V3 status: AWAITING_CONSENT
V3 change_class: OBLIGATION_CHANGE
V3 requires_reconsent: true
is_version_authorized(V1): true
is_version_authorized(V3): false
```

This repetition validates the strengthened adversarial semantic path in production. It does not claim a second false negative: validators correctly caught the authority change, so generating an appeal warning would itself have been incorrect.

Explorer address: <https://explorer-bradbury.genlayer.com/address/0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E>
