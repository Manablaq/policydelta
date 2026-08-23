from __future__ import annotations

import ast
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "contracts" / "policy_delta.py"
TEST = ROOT / "tests" / "direct" / "test_policy_delta.py"

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

print("AST: PASS")
print("REVIEWER GUARDS: PASS")
print("CONTRACT_SHA256=" + hashlib.sha256(CONTRACT.read_bytes()).hexdigest())
