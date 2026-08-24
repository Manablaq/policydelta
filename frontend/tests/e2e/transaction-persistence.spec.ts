import {
  expect,
  test,
} from "@playwright/test";

const STORAGE_KEY =
  "policydelta:transactions:v1";

const DEPLOYMENT_HASH =
  "0x66e01ac9797ebdf53a17fc56090bad546940adf3614350c362c711457b9b92ac";

test("restores a tracked transaction, resolves its real Bradbury finality, and survives reload", async ({
  page,
}) => {
  await page.addInitScript(
    ({
      key,
      hash,
    }) => {
      const now = Date.now();

      window.localStorage.setItem(
        key,
        JSON.stringify([
          {
            hash,
            title:
              "PolicyDelta deployment",
            consensusStatus:
              "SUBMITTED",
            executionStatus:
              "UNKNOWN",
            submittedAt: now,
            updatedAt: now,
            pollingPaused: false,
          },
        ]),
      );
    },
    {
      key: STORAGE_KEY,
      hash: DEPLOYMENT_HASH,
    },
  );

  await page.goto("/app");

  await page
    .getByRole("button", {
      name:
        "Open transaction activity",
    })
    .click();

  await expect(
    page.getByText(
      "PolicyDelta deployment",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      "FINALIZED",
      {
        exact: true,
      },
    ),
  ).toBeVisible({
    timeout: 20_000,
  });

  await expect(
    page.getByText(
      "FINISHED_WITH_RETURN",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await page.reload();

  await page
    .getByRole("button", {
      name:
        "Open transaction activity",
    })
    .click();

  await expect(
    page.getByText(
      "PolicyDelta deployment",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      "FINALIZED",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      "FINISHED_WITH_RETURN",
      {
        exact: true,
      },
    ),
  ).toBeVisible();
});

test("restores an old timeout without calling it success and pauses automatic polling", async ({
  page,
}) => {
  await page.addInitScript(
    ({
      key,
      hash,
    }) => {
      const old =
        Date.now() -
        7 * 60 * 60 * 1000;

      window.localStorage.setItem(
        key,
        JSON.stringify([
          {
            hash,
            title:
              "Historical timeout example",
            consensusStatus:
              "LEADER_TIMEOUT",
            executionStatus:
              "UNKNOWN",
            submittedAt: old,
            updatedAt: old,
            pollingPaused: true,
          },
        ]),
      );
    },
    {
      key: STORAGE_KEY,
      hash: DEPLOYMENT_HASH,
    },
  );

  await page.goto("/app");

  await page
    .getByRole("button", {
      name:
        "Open transaction activity",
    })
    .click();

  await expect(
    page.getByText(
      "LEADER_TIMEOUT",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      /Timeout is not success or finalization/i,
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      /Automatic tracking window ended/i,
    ),
  ).toBeVisible();

  await expect(
    page.getByRole("button", {
      name: "Refresh",
      exact: true,
    }),
  ).toBeVisible();

  await expect(
    page.getByText(
      "FINALIZED",
      {
        exact: true,
      },
    ),
  ).toHaveCount(0);
});

test("transaction activity drawer portals above the app shell and fills the viewport", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => {
      window.localStorage.removeItem(
        key,
      );
    },
    STORAGE_KEY,
  );

  await page.goto("/app/activity");

  await page
    .getByRole("button", {
      name:
        "Open transaction activity",
    })
    .click();

  const overlay =
    page.getByTestId(
      "transaction-overlay",
    );

  const drawer =
    page.getByTestId(
      "transaction-drawer",
    );

  await expect(
    overlay,
  ).toBeVisible();

  await expect(
    drawer,
  ).toBeVisible();

  await expect(
    page.getByText(
      "No transactions yet",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  const viewport =
    page.viewportSize();

  const box =
    await drawer.boundingBox();

  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();

  if (!viewport || !box) {
    throw new Error(
      "Drawer geometry unavailable",
    );
  }

  expect(
    box.y,
  ).toBeLessThanOrEqual(1);

  expect(
    box.height,
  ).toBeGreaterThan(
    viewport.height * 0.9,
  );

  expect(
    box.x + box.width,
  ).toBeGreaterThan(
    viewport.width - 2,
  );
});
