from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "contracts" / "policy_delta.py"
OUTPUT = ROOT / "deploy" / "SOURCE_MANIFEST.json"

manifest = {
    "generated_at_utc": datetime.now(timezone.utc).isoformat(),
    "contract_path": "contracts/policy_delta.py",
    "contract_sha256": hashlib.sha256(CONTRACT.read_bytes()).hexdigest(),
    "deployment_network": "Bradbury Testnet",
    "deployment_status": "NOT_DEPLOYED",
    "contract_address": None,
    "deployment_tx": None,
    "explorer_url": None,
    "repository_commit": None,
}
OUTPUT.write_text(json.dumps(manifest, indent=2) + "\n")
print(OUTPUT)
print(manifest["contract_sha256"])
