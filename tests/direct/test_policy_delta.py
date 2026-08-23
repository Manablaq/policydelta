from __future__ import annotations

import json
import pytest


POLICY_ID = "agent-procurement-policy"
RULES = """
Re-consent is mandatory when a new version expands permissions, changes economic limits,
adds or removes obligations, weakens a safety restriction, or otherwise changes the authority
of the agent. Pure wording, formatting, ordering, or semantic-preserving clarification is non-material.
""".strip()

V1 = """
The procurement agent may purchase AWS software subscriptions costing no more than 100 GEN per month.
Transfers to personal wallets are forbidden.
""".strip()

V1_REWRITE = """
The procurement agent can spend at most 100 GEN each month on AWS software subscriptions.
It must not transfer funds to personal wallets.
""".strip()

V2_EXPANDED = """
The procurement agent may purchase operational services costing up to 1,000 GEN per month
and may reimburse approved contractors.
""".strip()

PROMPT_PATTERN = r"You are evaluating whether a proposed AI-agent policy update materially changes"


def as_hex_address(value) -> str:
    if isinstance(value, (bytes, bytearray)):
        return "0x" + bytes(value).hex()

    as_hex = getattr(value, "as_hex", None)
    if isinstance(as_hex, str):
        return as_hex

    return str(value)


def deploy(direct_deploy):
    return direct_deploy("contracts/policy_delta.py")


def create_default(contract, direct_vm, direct_owner, publisher):
    direct_vm.sender = direct_owner
    contract.create_policy(
        POLICY_ID,
        as_hex_address(publisher),
        V1,
        RULES,
        3600,
        3600,
    )


def mock_decision(direct_vm, requires_reconsent: bool, change_class: str):
    direct_vm.mock_llm(
        PROMPT_PATTERN,
        json.dumps(
            {
                "requires_reconsent": requires_reconsent,
                "change_class": change_class,
            }
        ),
    )


def test_create_policy_initial_version_is_active(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    policy = contract.get_policy(POLICY_ID)
    active = contract.get_active_version(POLICY_ID)
    assert policy["active_version"] == 1
    assert policy["open_version"] == 0
    assert active["status"] == "ACTIVE"
    assert active["policy_text"] == V1
    assert contract.is_version_authorized(POLICY_ID, 1) is True


def test_duplicate_policy_id_rejected(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_owner):
        with direct_vm.expect_revert("POLICY_ALREADY_EXISTS"):
            contract.create_policy(
                POLICY_ID,
                as_hex_address(direct_alice),
                V1,
                RULES,
                3600,
                3600,
            )


def test_only_registered_publisher_can_propose(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob
):
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_bob):
        with direct_vm.expect_revert("ONLY_PUBLISHER"):
            contract.propose_version(POLICY_ID, V2_EXPANDED)


def test_identical_version_activates_and_replaces_previous_state_consistently(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V1)
    contract.review_version(POLICY_ID, version)

    reviewed = contract.get_version(POLICY_ID, version)
    previous = contract.get_version(POLICY_ID, 1)
    assert reviewed["requires_reconsent"] is False
    assert reviewed["change_class"] == "NON_MATERIAL"
    assert reviewed["status"] == "ACTIVE"
    assert previous["status"] == "REPLACED"
    assert contract.is_version_authorized(POLICY_ID, version) is True
    assert contract.is_version_authorized(POLICY_ID, 1) is False


def test_semantic_rewrite_validator_independently_recomputes_exact_same_decision(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    direct_vm.strict_mocks = True
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V1_REWRITE)

    mock_decision(direct_vm, False, "NON_MATERIAL")
    contract.review_version(POLICY_ID, version)

    direct_vm.clear_mocks()
    mock_decision(direct_vm, False, "NON_MATERIAL")
    assert direct_vm.run_validator() is True

    reviewed = contract.get_version(POLICY_ID, version)
    assert reviewed["status"] == "ACTIVE"
    assert contract.get_version(POLICY_ID, 1)["status"] == "REPLACED"
    assert contract.get_policy(POLICY_ID)["active_version"] == version


def test_material_change_requires_principal_consent_and_is_not_authorized_early(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    direct_vm.strict_mocks = True
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)

    mock_decision(direct_vm, True, "MIXED_MATERIAL_CHANGE")
    contract.review_version(POLICY_ID, version)

    direct_vm.clear_mocks()
    mock_decision(direct_vm, True, "MIXED_MATERIAL_CHANGE")
    assert direct_vm.run_validator() is True

    reviewed = contract.get_version(POLICY_ID, version)
    assert reviewed["status"] == "AWAITING_CONSENT"
    assert reviewed["requires_reconsent"] is True
    assert contract.get_policy(POLICY_ID)["active_version"] == 1
    assert contract.get_version(POLICY_ID, 1)["status"] == "ACTIVE"
    assert contract.is_version_authorized(POLICY_ID, version) is False
    assert contract.is_version_authorized(POLICY_ID, 1) is True


def test_validator_rejects_when_independent_change_class_differs(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    direct_vm.strict_mocks = True
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)

    mock_decision(direct_vm, True, "ECONOMIC_CHANGE")
    contract.review_version(POLICY_ID, version)

    direct_vm.clear_mocks()
    mock_decision(direct_vm, True, "PERMISSION_EXPANSION")
    assert direct_vm.run_validator() is False


def test_validator_rejects_when_independent_materiality_differs(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    direct_vm.strict_mocks = True
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)

    mock_decision(direct_vm, False, "NON_MATERIAL")
    contract.review_version(POLICY_ID, version)

    direct_vm.clear_mocks()
    mock_decision(direct_vm, True, "MIXED_MATERIAL_CHANGE")
    assert direct_vm.run_validator() is False


def test_validator_malformed_independent_result_rejects(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    direct_vm.strict_mocks = True
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)

    mock_decision(direct_vm, True, "MIXED_MATERIAL_CHANGE")
    contract.review_version(POLICY_ID, version)

    direct_vm.clear_mocks()
    direct_vm.mock_llm(PROMPT_PATTERN, json.dumps({"unexpected": True}))
    assert direct_vm.run_validator() is False


def test_principal_can_consent_after_material_review_and_previous_becomes_replaced(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    direct_vm.strict_mocks = True
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)

    mock_decision(direct_vm, True, "MIXED_MATERIAL_CHANGE")
    contract.review_version(POLICY_ID, version)

    direct_vm.clear_mocks()
    mock_decision(direct_vm, True, "MIXED_MATERIAL_CHANGE")
    assert direct_vm.run_validator() is True

    with direct_vm.prank(direct_owner):
        contract.consent_to_version(POLICY_ID, version)

    assert contract.get_policy(POLICY_ID)["active_version"] == version
    assert contract.get_version(POLICY_ID, version)["status"] == "ACTIVE"
    assert contract.get_version(POLICY_ID, 1)["status"] == "REPLACED"
    assert contract.is_version_authorized(POLICY_ID, version) is True
    assert contract.is_version_authorized(POLICY_ID, 1) is False


def test_non_principal_cannot_consent(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob
):
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)
    mock_decision(direct_vm, True, "MIXED_MATERIAL_CHANGE")
    contract.review_version(POLICY_ID, version)

    with direct_vm.prank(direct_bob):
        with direct_vm.expect_revert("ONLY_PRINCIPAL"):
            contract.consent_to_version(POLICY_ID, version)


def test_non_principal_cannot_reject(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob
):
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)
    mock_decision(direct_vm, True, "MIXED_MATERIAL_CHANGE")
    contract.review_version(POLICY_ID, version)

    with direct_vm.prank(direct_bob):
        with direct_vm.expect_revert("ONLY_PRINCIPAL"):
            contract.reject_version(POLICY_ID, version)


def test_principal_rejection_cannot_activate_version(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)
    mock_decision(direct_vm, True, "MIXED_MATERIAL_CHANGE")
    contract.review_version(POLICY_ID, version)

    with direct_vm.prank(direct_owner):
        contract.reject_version(POLICY_ID, version)

    assert contract.get_version(POLICY_ID, version)["status"] == "REJECTED"
    assert contract.get_policy(POLICY_ID)["active_version"] == 1
    assert contract.is_version_authorized(POLICY_ID, version) is False


def test_new_proposal_supersedes_old_open_version_without_reactivating_it(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        first = contract.propose_version(POLICY_ID, V2_EXPANDED)
        second = contract.propose_version(POLICY_ID, V1_REWRITE)

    assert contract.get_version(POLICY_ID, first)["status"] == "SUPERSEDED"
    assert contract.get_version(POLICY_ID, second)["status"] == "PROPOSED"
    assert contract.get_policy(POLICY_ID)["open_version"] == second
    assert contract.get_policy(POLICY_ID)["active_version"] == 1


def test_superseded_version_cannot_be_reviewed(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        first = contract.propose_version(POLICY_ID, V2_EXPANDED)
        contract.propose_version(POLICY_ID, V1_REWRITE)

    with direct_vm.expect_revert("VERSION_NOT_REVIEWABLE"):
        contract.review_version(POLICY_ID, first)


def test_review_deadline_recovery_is_permissionless_and_fail_closed(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob
):
    direct_vm.warp("2026-08-23T12:00:00+00:00")
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)

    direct_vm.warp("2026-08-23T13:00:01+00:00")
    with direct_vm.prank(direct_bob):
        contract.recover_expired_version(POLICY_ID, version)

    assert contract.get_version(POLICY_ID, version)["status"] == "EXPIRED"
    assert contract.get_policy(POLICY_ID)["active_version"] == 1
    assert contract.is_version_authorized(POLICY_ID, version) is False


def test_review_after_deadline_reverts_without_changing_active_version(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    direct_vm.warp("2026-08-23T12:00:00+00:00")
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)

    direct_vm.warp("2026-08-23T13:00:01+00:00")
    with direct_vm.expect_revert("REVIEW_DEADLINE_PASSED"):
        contract.review_version(POLICY_ID, version)

    assert contract.get_policy(POLICY_ID)["active_version"] == 1
    assert contract.is_version_authorized(POLICY_ID, version) is False


def test_recovery_before_deadline_reverts(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob
):
    direct_vm.warp("2026-08-23T12:00:00+00:00")
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)

    with direct_vm.prank(direct_bob):
        with direct_vm.expect_revert("VERSION_NOT_EXPIRED"):
            contract.recover_expired_version(POLICY_ID, version)


def test_consent_deadline_recovery_preserves_previous_active_version(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob
):
    direct_vm.warp("2026-08-23T12:00:00+00:00")
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)
    mock_decision(direct_vm, True, "MIXED_MATERIAL_CHANGE")
    contract.review_version(POLICY_ID, version)

    direct_vm.warp("2026-08-23T13:00:01+00:00")
    with direct_vm.prank(direct_bob):
        contract.recover_expired_version(POLICY_ID, version)

    assert contract.get_version(POLICY_ID, version)["status"] == "EXPIRED"
    assert contract.get_policy(POLICY_ID)["active_version"] == 1
    assert contract.get_version(POLICY_ID, 1)["status"] == "ACTIVE"
    assert contract.is_version_authorized(POLICY_ID, 1) is True


def test_consent_after_deadline_reverts_and_preserves_previous_active_version(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    direct_vm.warp("2026-08-23T12:00:00+00:00")
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)
    mock_decision(direct_vm, True, "MIXED_MATERIAL_CHANGE")
    contract.review_version(POLICY_ID, version)

    direct_vm.warp("2026-08-23T13:00:01+00:00")
    with direct_vm.prank(direct_owner):
        with direct_vm.expect_revert("CONSENT_DEADLINE_PASSED"):
            contract.consent_to_version(POLICY_ID, version)

    assert contract.get_policy(POLICY_ID)["active_version"] == 1
    assert contract.is_version_authorized(POLICY_ID, version) is False


def test_malformed_semantic_result_fails_closed(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)
    direct_vm.mock_llm(
        PROMPT_PATTERN,
        json.dumps({"requires_reconsent": False, "change_class": "ECONOMIC_CHANGE"}),
    )

    with direct_vm.expect_revert("MALFORMED_SEMANTIC_DECISION"):
        contract.review_version(POLICY_ID, version)

    assert contract.get_policy(POLICY_ID)["active_version"] == 1
    assert contract.is_version_authorized(POLICY_ID, version) is False


def test_extra_semantic_output_fields_fail_closed(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    contract = deploy(direct_deploy)
    create_default(contract, direct_vm, direct_owner, direct_alice)

    with direct_vm.prank(direct_alice):
        version = contract.propose_version(POLICY_ID, V2_EXPANDED)
    direct_vm.mock_llm(
        PROMPT_PATTERN,
        json.dumps(
            {
                "requires_reconsent": True,
                "change_class": "ECONOMIC_CHANGE",
                "confidence": 100,
            }
        ),
    )

    with direct_vm.expect_revert("MALFORMED_SEMANTIC_DECISION"):
        contract.review_version(POLICY_ID, version)

    assert contract.get_policy(POLICY_ID)["active_version"] == 1
    assert contract.is_version_authorized(POLICY_ID, version) is False
