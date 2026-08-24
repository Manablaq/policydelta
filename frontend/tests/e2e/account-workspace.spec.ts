import {
  expect,
  test,
  type Page,
} from "@playwright/test";

const WALLET =
  "0x1f87Ae197af539253978d435aD45cCf28Fb95024";

const WALLET_LOWER =
  WALLET.toLowerCase();

const POLICY_ID =
  "policydelta-bradbury-live-001";

const ACTIVITY_HASH =
  "0x66e01ac9797ebdf53a17fc56090bad546940adf3614350c362c711457b9b92ac";

type WalletRequest = {
  method: string;
};

async function installConnectedWallet(
  page: Page,
) {
  await page.addInitScript(
    ({ wallet }) => {
      const requests:
        WalletRequest[] = [];

      const listeners =
        new Map<
          string,
          Set<
            (
              value: unknown,
            ) => void
          >
        >();

      const provider = {
        async request({
          method,
        }: {
          method: string;
          params?: unknown;
        }) {
          requests.push({
            method,
          });

          if (
            method ===
            "eth_accounts"
          ) {
            return [wallet];
          }

          if (
            method ===
            "eth_requestAccounts"
          ) {
            return [wallet];
          }

          if (
            method ===
            "eth_chainId"
          ) {
            return "0x107d";
          }

          if (
            method ===
            "net_version"
          ) {
            return "4221";
          }

          if (
            /sendtransaction|sign/i.test(
              method,
            )
          ) {
            throw new Error(
              `SAFE_QA_BLOCKED_${method}`,
            );
          }

          return null;
        },

        on(
          event: string,
          listener: (
            value: unknown,
          ) => void,
        ) {
          const bucket =
            listeners.get(event) ??
            new Set();

          bucket.add(listener);

          listeners.set(
            event,
            bucket,
          );
        },

        removeListener(
          event: string,
          listener: (
            value: unknown,
          ) => void,
        ) {
          listeners
            .get(event)
            ?.delete(listener);
        },
      };

      Object.defineProperty(
        window,
        "ethereum",
        {
          value: provider,
          configurable: true,
        },
      );

      (
        window as typeof window & {
          __accountQaWalletRequests?: WalletRequest[];
        }
      ).__accountQaWalletRequests =
        requests;
    },
    {
      wallet: WALLET,
    },
  );
}

async function mockAccountApi(
  page: Page,
) {
  let accountPosts = 0;

  await page.route(
    /\/api\/account(?:\?.*)?$/,
    async (route) => {
      const request =
        route.request();

      if (
        request.method() !==
        "GET"
      ) {
        accountPosts += 1;

        await route.fulfill({
          status: 405,
          contentType:
            "application/json",
          body: JSON.stringify({
            error:
              "Unexpected account mutation in read-only QA.",
          }),
        });

        return;
      }

      await route.fulfill({
        status: 200,
        contentType:
          "application/json",
        body: JSON.stringify({
          configured: true,
          wallet:
            WALLET_LOWER,
          policies: [
            {
              wallet:
                WALLET_LOWER,
              policyId:
                POLICY_ID,
              role: "both",
              firstSeenAt:
                "2026-08-24T04:14:00.000Z",
              updatedAt:
                "2026-08-24T06:00:00.000Z",
            },
          ],
          activity: [
            {
              hash:
                ACTIVITY_HASH,
              wallet:
                WALLET_LOWER,
              functionName:
                "review_version",
              policyId:
                POLICY_ID,
              version: 6,
              consensusStatus:
                "FINALIZED",
              executionStatus:
                "FINISHED_WITH_RETURN",
              methodVerified:
                true,
              submittedAt:
                "2026-08-24T05:00:00.000Z",
              updatedAt:
                "2026-08-24T05:10:00.000Z",
            },
          ],
        }),
      });
    },
  );

  return {
    accountPosts: () =>
      accountPosts,
  };
}

async function walletRequests(
  page: Page,
) {
  return page.evaluate(
    () =>
      (
        window as typeof window & {
          __accountQaWalletRequests?: WalletRequest[];
        }
      )
        .__accountQaWalletRequests ??
      [],
  );
}

test("connected wallet overview hydrates persistent account data and live Bradbury policy state", async ({
  page,
}) => {
  await installConnectedWallet(
    page,
  );

  const account =
    await mockAccountApi(
      page,
    );

  await page.goto("/app");

  await expect(
    page.getByText(
      "Your policies",
      {
        exact: true,
      },
    ).first(),
  ).toBeVisible();

  await expect(
    page.getByText(
      POLICY_ID,
      {
        exact: true,
      },
    ),
  ).toBeVisible({
    timeout: 30_000,
  });

  await expect(
    page.getByText(
      "1",
      {
        exact: true,
      },
    ).first(),
  ).toBeVisible();

  await expect(
    page.getByText(
      /V3 Active/i,
    ),
  ).toBeVisible({
    timeout: 30_000,
  });

  expect(
    account.accountPosts(),
  ).toBe(0);

  const requests =
    await walletRequests(page);

  expect(
    requests.filter(
      ({ method }) =>
        /sendtransaction|sign/i.test(
          method,
        ),
    ),
  ).toEqual([]);
});

test("policies page exposes indexed wallet policy without requiring exact-ID discovery", async ({
  page,
}) => {
  await installConnectedWallet(
    page,
  );

  const account =
    await mockAccountApi(
      page,
    );

  await page.goto(
    "/app/policies",
  );

  await expect(
    page.getByRole("heading", {
      name: "Your policies",
    }),
  ).toBeVisible();

  await expect(
    page.getByText(
      "1 indexed",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      POLICY_ID,
      {
        exact: true,
      },
    ).first(),
  ).toBeVisible({
    timeout: 30_000,
  });

  await expect(
    page.getByText(
      "Active V3",
      {
        exact: true,
      },
    ),
  ).toBeVisible({
    timeout: 30_000,
  });

  expect(
    account.accountPosts(),
  ).toBe(0);
});

test("activity page restores persistent wallet activity independently of browser localStorage", async ({
  page,
}) => {
  await installConnectedWallet(
    page,
  );

  await mockAccountApi(page);

  await page.addInitScript(
    () => {
      window.localStorage.removeItem(
        "policydelta:transactions:v1",
      );
    },
  );

  await page.goto(
    "/app/activity",
  );

  await expect(
    page.getByRole("heading", {
      name:
        "Verified PolicyDelta activity",
    }),
  ).toBeVisible();

  await expect(
    page.getByText(
      "Review Version",
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

  await expect(
    page.getByText(
      POLICY_ID,
      {
        exact: true,
      },
    ),
  ).toBeVisible();
});

test("compare page offers connected wallet policies and real Bradbury version choices", async ({
  page,
}) => {
  await installConnectedWallet(
    page,
  );

  await mockAccountApi(page);

  await page.goto(
    "/app/compare",
  );

  const policySelect =
    page.getByLabel(
      "Your indexed policy",
    );

  await expect(
    policySelect,
  ).toBeVisible({
    timeout: 30_000,
  });

  await policySelect.selectOption(
    POLICY_ID,
  );

  await expect(
    page.getByLabel(
      "From version",
    ),
  ).toHaveValue("3", {
    timeout: 30_000,
  });

  await expect(
    page.getByLabel(
      "To version",
    ),
  ).toHaveValue("6", {
    timeout: 30_000,
  });

  await page
    .getByRole("button", {
      name: "Compare",
      exact: true,
    })
    .click();

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
      name:
        "Economic Change",
    }),
  ).toBeVisible();
});
