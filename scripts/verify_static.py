from __future__ import annotations

import ast
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "contracts" / "policy_delta.py"
TEST = ROOT / "tests" / "direct" / "test_policy_delta.py"
CORPUS = ROOT / "tests" / "corpus" / "adversarial_semantic_regressions.json"
READ_PATH = ROOT / "frontend" / "src" / "lib" / "contract" / "read.ts"
DISCOVERY = ROOT / "frontend" / "src" / "lib" / "account" / "chain-discovery.ts"
APPEAL_CENTER = (
    ROOT
    / "frontend"
    / "src"
    / "components"
    / "account"
    / "principal-appeal-center.tsx"
)

source = CONTRACT.read_text()
ast.parse(source)
ast.parse(TEST.read_text())

required = [
    "run_nondet_unsafe",
    "The validator does not receive the leader decision in its prompt.",
    "MALFORMED_SEMANTIC_DECISION",
    "STALE_PARENT_VERSION",
    "recover_expired_version",
    "STATUS_SUPERSEDED",
    "STATUS_REPLACED",
    "is_version_authorized",
    "consent_to_version",
    "validator_value = leader_fn()",
]
for token in required:
    if token not in source:
        raise SystemExit(f"missing required reviewer guard: {token}")

forbidden = [
    "abs(own_score - leader_result)",
    "confidence_bps",
    "500 basis points",
    "leader_only",
    "<leader_decision>",
    "def classify_policy_change",
]
for token in forbidden:
    if token in source:
        raise SystemExit(f"forbidden reviewer-risk pattern in contract: {token}")

read_source = READ_PATH.read_text()
discovery_source = DISCOVERY.read_text()
appeal_source = APPEAL_CENTER.read_text()

frontend_guards = {
    "finalized authority reads": (
        "TransactionHashVariant.LATEST_FINAL",
        read_source,
    ),
    "separate provisional reads": (
        "TransactionHashVariant.LATEST_NONFINAL",
        read_source,
    ),
    "permissionless principal review discovery": (
        '"affected_principal"',
        discovery_source,
    ),
    "accepted review alert boundary": (
        "isActionablePrincipalReviewStatus",
        discovery_source,
    ),
    "immutable previous-authority lineage": (
        "provisional.parentVersion",
        discovery_source,
    ),
    "live appeal eligibility": (
        "canAppeal",
        appeal_source,
    ),
    "minimum appeal bond": (
        "getMinAppealBond",
        appeal_source,
    ),
    "native appeal submission": (
        "appealTransaction",
        appeal_source,
    ),
}

for name, (token, location) in frontend_guards.items():
    if token not in location:
        raise SystemExit(f"missing frontend safety guard ({name}): {token}")

if "finalizedPolicy.activeVersion" in discovery_source:
    raise SystemExit(
        "principal alert must derive previous authority from version lineage"
    )

corpus = json.loads(CORPUS.read_text())
if len(corpus) < 8:
    raise SystemExit("adversarial semantic corpus must contain at least 8 cases")

case_ids = [case.get("id") for case in corpus]
if len(case_ids) != len(set(case_ids)):
    raise SystemExit("adversarial semantic corpus IDs must be unique")

for case in corpus:
    required_case_fields = {
        "id",
        "old_policy",
        "new_policy",
        "expected_change_class",
        "reason",
    }
    if set(case) != required_case_fields:
        raise SystemExit(f"invalid adversarial corpus shape: {case.get('id')}")
    if case["old_policy"] == case["new_policy"]:
        raise SystemExit(f"adversarial corpus case has no delta: {case['id']}")

print("AST: PASS")
print("REVIEWER GUARDS: PASS")
print("FINALITY/APPEAL GUARDS: PASS")
print(f"ADVERSARIAL CORPUS: PASS ({len(corpus)} cases)")
print("CONTRACT_SHA256=" + hashlib.sha256(CONTRACT.read_bytes()).hexdigest())
