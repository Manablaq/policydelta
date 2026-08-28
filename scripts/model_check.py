"""Small invariant model for PolicyDelta's authorization state machine.

This is not a substitute for GenVM/Bradbury testing. It is a deterministic design check
that explores every defined status and verifies fail-closed authorization invariants.
"""

STATUSES = {
    "ACTIVE",
    "PROPOSED",
    "AWAITING_CONSENT",
    "REJECTED",
    "EXPIRED",
    "SUPERSEDED",
    "REPLACED",
}


def authorized(version: int, active_version: int, status: str) -> bool:
    return version == active_version and status == "ACTIVE"


def main() -> None:
    for status in STATUSES:
        for version in range(1, 5):
            for active in range(1, 5):
                result = authorized(version, active, status)
                expected = status == "ACTIVE" and version == active
                assert result == expected

    # Reviewer-sensitive fail-closed states must never authorize, even if their
    # numeric version happens to equal an incorrectly supplied active_version.
    for status in ("PROPOSED", "AWAITING_CONSENT", "REJECTED", "EXPIRED", "SUPERSEDED"):
        assert authorized(2, 2, status) is False

    print("AUTHORIZATION MODEL: PASS")
    print("FAIL-CLOSED STATES: PASS")

    # An accepted NON_MATERIAL review can expose a provisional state where V2
    # appears active. Authority consumers must continue querying the finalized
    # snapshot, which still authorizes V1 until the appeal path completes.
    finalized_active = 1
    provisional_active = 2
    assert authorized(1, finalized_active, "ACTIVE") is True
    assert authorized(2, finalized_active, "ACTIVE") is False
    assert authorized(2, provisional_active, "ACTIVE") is True

    print("FINALIZED AUTHORITY BOUNDARY: PASS")


if __name__ == "__main__":
    main()
