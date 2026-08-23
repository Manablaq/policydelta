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


if __name__ == "__main__":
    main()
