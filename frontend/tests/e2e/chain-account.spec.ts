import {
  expect,
  test,
} from "@playwright/test";
import {
  discoverWalletAccount,
} from "@/lib/account/chain-discovery";

const WALLET =
  "0x1f87Ae197af539253978d435aD45cCf28Fb95024";

const EXPECTED_POLICIES = [
  "policydelta-bradbury-live-001",
  "policydelta-expiry-live-001",
  "policydelta-consent-expiry-live-001",
  "policydelta-ui-qa-20260824-0412",
];

const QA_CREATE =
  "0xd95aad16684b502cc2e7c626d652ede438f4202ed2c1078db39851f5b2476586";

const QA_PROPOSE =
  "0xfb252612a74dfea8acc1f0aa4af1d2f2d9a7476b0f0a8611a2a097737444093e";

const QA_REVIEW =
  "0x6d6c4e09b7c7d8941ee4ba6d8c201dfebce8e1a575750d3dccad3dc2ed5b0203";

const FAILED_REVIEW =
  "0x926c27a434f56d97154a6142ba834f1c7510ce27272f85867cebe54e148846f6";

test("connected wallet is reconstructed automatically from real Bradbury PolicyDelta history", async () => {
  const account =
    await discoverWalletAccount(
      WALLET,
    );

  expect(
    account.source,
  ).toBe(
    "bradbury",
  );

  expect(
    account.wallet,
  ).toBe(
    WALLET.toLowerCase(),
  );

  const policyIds =
    account.policies.map(
      (item) =>
        item.policyId,
    );

  for (
    const policyId of
    EXPECTED_POLICIES
  ) {
    expect(
      policyIds,
    ).toContain(
      policyId,
    );
  }

  const hashes =
    account.activity.map(
      (item) =>
        item.hash,
    );

  expect(
    hashes,
  ).toContain(
    QA_CREATE,
  );

  expect(
    hashes,
  ).toContain(
    QA_PROPOSE,
  );

  expect(
    hashes,
  ).toContain(
    QA_REVIEW,
  );

  const failed =
    account.activity.find(
      (item) =>
        item.hash ===
        FAILED_REVIEW,
    );

  expect(
    failed?.consensusStatus,
  ).toBe(
    "FINALIZED",
  );

  expect(
    failed?.executionStatus,
  ).toBe(
    "FINISHED_WITH_ERROR",
  );

  expect(
    account.scannedFromBlock,
  ).toBe(
    18_847_788,
  );

  expect(
    account.scannedToBlock,
  ).toBeGreaterThan(
    account.scannedFromBlock,
  );
});
