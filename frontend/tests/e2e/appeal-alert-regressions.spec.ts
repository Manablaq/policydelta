import {
  expect,
  test,
} from "@playwright/test";
import {
  isActionablePrincipalReviewStatus,
  previousAuthorityVersionForAlert,
} from "@/lib/account/chain-discovery";

test("accepted review alert derives prior authority from immutable version lineage", () => {
  // Live Bradbury exposed a moving policy head of V2 during an accepted
  // review. The reviewed version still records V1 as its immutable parent.
  const movingPolicyHead = 2;
  const reviewedVersion = 2;
  const parentVersion = 1;

  expect(
    movingPolicyHead,
  ).toBe(reviewedVersion);
  expect(
    previousAuthorityVersionForAlert(
      reviewedVersion,
      parentVersion,
    ),
  ).toBe(1);
});

test("only ACCEPTED reviews remain actionable principal alerts", () => {
  expect(
    isActionablePrincipalReviewStatus(
      "ACCEPTED",
    ),
  ).toBe(true);

  for (const status of [
    "UNDETERMINED",
    "FINALIZED",
    "CANCELED",
    "VALIDATORS_TIMEOUT",
  ]) {
    expect(
      isActionablePrincipalReviewStatus(
        status,
      ),
    ).toBe(false);
  }
});

test("invalid or self-referential lineage fails closed", () => {
  expect(
    previousAuthorityVersionForAlert(
      2,
      0,
    ),
  ).toBeNull();
  expect(
    previousAuthorityVersionForAlert(
      2,
      2,
    ),
  ).toBeNull();
  expect(
    previousAuthorityVersionForAlert(
      2,
      3,
    ),
  ).toBeNull();
});
