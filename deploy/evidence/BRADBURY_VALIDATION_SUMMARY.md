# PolicyDelta — Bradbury Validation Evidence

## Deployment

- Network: GenLayer Bradbury Testnet
- Contract: `0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E`
- Deployment transaction: `0x66e01ac9797ebdf53a17fc56090bad546940adf3614350c362c711457b9b92ac`
- Frozen source commit: `69835a06e183493c671d74255261e1ab39b63db9`
- Frozen contract SHA-256: `a0721813dd17d01b1d5cc57e9ac455152b6d4eba9daccff2d210d707835b70b2`

`BRADBURY_SOURCE_PARITY.txt` records byte-identical source parity between the frozen local contract and the source retrieved from Bradbury.

## Live validation gates

### Non-material change

A semantic-preserving V2 was reviewed as `NON_MATERIAL` and activated without re-consent.

Evidence:
- `live/03_REVIEW_NONMATERIAL_V2.txt`
- `live/03_POLICY_AFTER_V2_REVIEW.txt`
- `live/03_V1_AUTHORIZED_AFTER_REVIEW.txt`
- `live/03_V2_AUTHORIZED_AFTER_REVIEW.txt`

### Material change and consent

A spending-authority increase was reviewed as `ECONOMIC_CHANGE` with `requires_reconsent = true`.

Before consent, the prior active version remained authorized and the proposed material version remained unauthorized. After principal consent, the material version became active and authorized.

Evidence:
- `live/04_REVIEW_MATERIAL_V3.txt`
- `live/04_POLICY_AFTER_MATERIAL_REVIEW.txt`
- `live/04_V3_AUTHORIZED_BEFORE_CONSENT.txt`
- `live/05_CONSENT_MATERIAL_V3.txt`
- `live/05_POLICY_AFTER_CONSENT.txt`
- `live/05_V3_AUTHORIZED_AFTER_CONSENT.txt`

### Rejection path

A material V4 was rejected by the principal. The prior active V3 remained authoritative and V4 remained unauthorized.

Evidence:
- `live/07_VALID_REJECT_V4.txt`
- `live/07_POLICY_AFTER_REJECTION.txt`
- `live/07_V3_AUTH_AFTER_REJECTION.txt`
- `live/07_V4_AUTH_AFTER_REJECTION.txt`

### Fresh review after rejection

A fresh V5 proposal after rejection successfully reached semantic review.

Evidence:
- `live/08_PROPOSE_V5_AFTER_REJECTION.txt`
- `live/08_REVIEW_V5_AFTER_REJECTION.txt`
- `live/08_POLICY_AFTER_V5_REVIEW.txt`

### Supersede and cross-method bypass resistance

V6 superseded open V5. Attempts to review or consent to superseded V5 failed closed and did not change authorization.

Evidence:
- `live/09_V6_PROPOSAL_RETRY.txt`
- `live/09_V5_AFTER_V6_RETRY.txt`
- `live/10_SUPERSEDED_V5_REVIEW_MUST_FAIL.txt`
- `live/10_POLICY_AFTER_FAILED_V5_REVIEW.txt`
- `live/11_SUPERSEDED_V5_CONSENT_MUST_FAIL.txt`
- `live/11_POLICY_AFTER_FAILED_V5_CONSENT.txt`

### PROPOSED expiry recovery

An unreviewed proposal passed its review deadline and was recovered to `EXPIRED`. The active version remained authoritative and the open-version pointer was cleared.

Evidence:
- `live/14_EXPIRY_V2_RECOVERY.txt`
- `live/14_EXPIRY_V2_AFTER_RECOVERY.txt`
- `live/14_EXPIRY_POLICY_AFTER_RECOVERY.txt`

A later fresh proposal after recovery demonstrates that expiry does not permanently block policy progress.

Evidence:
- `live/15_CONSENT_EXPIRY_V3_PROPOSAL.txt`
- `live/16_V3_EXPIRED_RECOVERY.txt`

### AWAITING_CONSENT expiry recovery

A dedicated policy used a 600-second review TTL and 60-second consent TTL. Its material V2 was classified `ECONOMIC_CHANGE`, entered `AWAITING_CONSENT`, passed the consent deadline, and was recovered to `EXPIRED`.

The original V1 remained active and authorized; expired V2 remained unauthorized; `open_version` was cleared.

Evidence:
- `live/17_CONSENT_EXPIRY_POLICY_CREATE.txt`
- `live/18_CONSENT_EXPIRY_V2_PROPOSAL.txt`
- `live/19_CONSENT_EXPIRY_V2_REVIEW.txt`
- `live/21_CONSENT_EXPIRY_V2_RECOVERY.txt`
- `live/21_CONSENT_EXPIRY_POLICY_AFTER_RECOVERY.txt`
- `live/21_CONSENT_EXPIRY_V1_AUTH.txt`
- `live/21_CONSENT_EXPIRY_V2_AUTH.txt`

### Main V6 semantic review

Main-policy V6 was independently reviewed as:

- `change_class = ECONOMIC_CHANGE`
- `requires_reconsent = true`
- `status = AWAITING_CONSENT`

The prior active V3 remains authorized and V6 remains unauthorized pending principal consent.

Evidence:
- `live/22_MAIN_V6_REVIEW.txt`
- `live/22_MAIN_POLICY_AFTER_V6_REVIEW.txt`
- `live/22_MAIN_V3_AUTH.txt`
- `live/22_MAIN_V6_AUTH.txt`

## Finality

The final validation sequence, including expiry recovery and the main V6 semantic review, reached Bradbury `Finalized` status (`statusCode = 7`) without manual finalization.

Evidence:
- `live/final/FINAL_SEQUENCE_STATUS.txt`
- `live/final/SLOT27_status.json`
- `live/final/SLOT28_status.json`

## Final authorization state

Main policy:
- active version: V3
- open version: V6
- V3: authorized
- V6: `AWAITING_CONSENT`, unauthorized

Consent-expiry policy:
- active version: V1
- open version: none
- V1: authorized
- V2: `EXPIRED`, unauthorized

Evidence:
- `live/final/FINAL_MAIN_POLICY.txt`
- `live/final/FINAL_MAIN_V3.txt`
- `live/final/FINAL_MAIN_V3_AUTH.txt`
- `live/final/FINAL_MAIN_V6.txt`
- `live/final/FINAL_MAIN_V6_AUTH.txt`
- `live/final/FINAL_CONSENT_POLICY.txt`
- `live/final/FINAL_CONSENT_V1.txt`
- `live/final/FINAL_CONSENT_V1_AUTH.txt`
- `live/final/FINAL_CONSENT_V2.txt`
- `live/final/FINAL_CONSENT_V2_AUTH.txt`
