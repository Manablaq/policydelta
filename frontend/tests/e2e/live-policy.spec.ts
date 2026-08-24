import {
  expect,
  test,
} from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  watchBrowserErrors,
} from "./helpers";

const POLICY_ID =
  "policydelta-bradbury-live-001";

test("exact policy lookup hydrates live Bradbury state", async ({
  page,
}) => {
  const browser =
    watchBrowserErrors(page);

  await page.goto(
    "/app/policies",
  );

  await page
    .getByLabel("Policy ID")
    .fill(POLICY_ID);

  await page
    .getByRole("button", {
      name: "Load policy",
    })
    .click();

  await expect(
    page.getByRole("heading", {
      name: POLICY_ID,
    }),
  ).toBeVisible({
    timeout: 30_000,
  });

  await expect(
    page.getByText(
      "Version 3",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      "Authorized",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      "Version 6",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  const openProposal =
    page
      .locator("article")
      .filter({
        hasText: "Open proposal",
      });

  await expect(
    openProposal.getByText(
      "Awaiting Consent",
      {
        exact: true,
      },
    ).first(),
  ).toBeVisible();

  await expectNoHorizontalOverflow(
    page,
  );

  await page.screenshot({
    path:
      "artifacts/browser-qa/policy-live.png",
    fullPage: true,
  });

  browser.assertClean();
});

test("full policy detail exposes live lineage without sending a write", async ({
  page,
}) => {
  const browser =
    watchBrowserErrors(page);

  await page.goto(
    `/app/policies/${encodeURIComponent(
      POLICY_ID,
    )}`,
  );

  await expect(
    page.getByRole("heading", {
      name: POLICY_ID,
    }),
  ).toBeVisible({
    timeout: 30_000,
  });

  await expect(
    page.getByRole("heading", {
      name: "Version history",
    }),
  ).toBeVisible();

  await expect(
    page.getByText(
      "V6",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      "V3",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      "Economic Change",
      {
        exact: true,
      },
    ).first(),
  ).toBeVisible();

  await expectNoHorizontalOverflow(
    page,
  );

  await expect(
    page.getByText(/^Loading V\d/),
  ).toHaveCount(0, {
    timeout: 30_000,
  });

  await page.screenshot({
    path:
      "artifacts/browser-qa/policy-detail.png",
    fullPage: true,
  });

  browser.assertClean();
});

test("side-by-side comparison uses live versions and stored semantic verdict", async ({
  page,
}) => {
  const browser =
    watchBrowserErrors(page);

  await page.goto(
    `/app/compare?policyId=${encodeURIComponent(
      POLICY_ID,
    )}&from=3&to=6`,
  );

  await expect(
    page.getByRole("heading", {
      name:
        "Policy version comparison",
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: "Version 3",
    }),
  ).toBeVisible({
    timeout: 30_000,
  });

  await expect(
    page.getByRole("heading", {
      name: "Version 6",
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: "Economic Change",
    }),
  ).toBeVisible();

  await expect(
    page.getByText(
      "Re-consent required",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      /local textual-diff aid only/i,
    ),
  ).toBeVisible();

  await expectNoHorizontalOverflow(
    page,
  );

  await page.screenshot({
    path:
      "artifacts/browser-qa/compare-v3-v6.png",
    fullPage: true,
  });

  browser.assertClean();
});
