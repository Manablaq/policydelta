import {
  expect,
  test,
  type Page,
} from "@playwright/test";

const POLICY_ID =
  "policydelta-bradbury-live-001";

const PRINCIPAL =
  "0x1f87Ae197af539253978d435aD45cCf28Fb95024";

const OTHER_WALLET =
  "0x1111111111111111111111111111111111111111";

type WalletRequestLog = {
  method: string;
  params?: unknown;
};

async function installMockWallet(
  page: Page,
  account: string,
  initiallyConnected = false,
) {
  await page.addInitScript(
    ({
      account,
      initiallyConnected,
    }) => {
      let connected =
        initiallyConnected;

      const requests:
        WalletRequestLog[] = [];

      const listeners =
        new Map<
          string,
          Set<
            (
              value: unknown,
            ) => void
          >
        >();

      function emit(
        event: string,
        value: unknown,
      ) {
        for (
          const listener of
          listeners.get(event) ?? []
        ) {
          listener(value);
        }
      }

      const provider = {
        async request({
          method,
          params,
        }: {
          method: string;
          params?: unknown;
        }) {
          requests.push({
            method,
            params,
          });

          if (
            method ===
            "eth_accounts"
          ) {
            return connected
              ? [account]
              : [];
          }

          if (
            method ===
            "eth_requestAccounts"
          ) {
            connected = true;

            emit(
              "accountsChanged",
              [account],
            );

            return [account];
          }

          if (
            method ===
            "eth_chainId"
          ) {
            // 4221 decimal
            return "0x107d";
          }

          if (
            method ===
            "net_version"
          ) {
            return "4221";
          }

          if (
            method ===
              "wallet_switchEthereumChain" ||
            method ===
              "wallet_addEthereumChain"
          ) {
            emit(
              "chainChanged",
              "0x107d",
            );

            return null;
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
          __policyDeltaWalletRequests?: WalletRequestLog[];
        }
      ).__policyDeltaWalletRequests =
        requests;
    },
    {
      account,
      initiallyConnected,
    },
  );
}

async function walletRequests(
  page: Page,
) {
  return page.evaluate(() => {
    return (
      (
        window as typeof window & {
          __policyDeltaWalletRequests?: WalletRequestLog[];
        }
      ).__policyDeltaWalletRequests ??
      []
    );
  });
}

function expectNoSigningOrWrite(
  requests: WalletRequestLog[],
) {
  const dangerous =
    requests.filter(
      ({ method }) =>
        /sendtransaction|sign/i.test(
          method,
        ),
    );

  expect(dangerous).toEqual([]);
}

test("principal wallet connects on Bradbury without signing or sending anything", async ({
  page,
}) => {
  await installMockWallet(
    page,
    PRINCIPAL,
  );

  await page.goto(
    `/app/policies/${encodeURIComponent(
      POLICY_ID,
    )}`,
  );

  const connect =
    page.getByRole("button", {
      name: "Connect wallet",
      exact: true,
    });

  await expect(
    connect,
  ).toBeVisible();

  await connect.click();

  await expect(
    page.locator(
      'button[title="Copy connected wallet address"]',
    ),
  ).toBeVisible({
    timeout: 15_000,
  });

  await expect(
    page.getByText(
      "Version 6",
      {
        exact: true,
      },
    ),
  ).toBeVisible({
    timeout: 30_000,
  });

  // Publisher role.
  await expect(
    page.getByRole("button", {
      name: "Propose version",
      exact: true,
    }),
  ).toBeEnabled();

  await page
    .getByRole("button", {
      name: "Propose version",
      exact: true,
    })
    .click();

  await expect(
    page.getByText(
      "Propose version V7",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await page
    .getByRole("button", {
      name: "Close proposal",
      exact: true,
    })
    .click();

  // V6 is already awaiting consent,
  // so semantic review is not currently valid.
  await expect(
    page.getByRole("button", {
      name: "Review version",
      exact: true,
    }),
  ).toBeDisabled();

  // Principal-only decisions.
  await expect(
    page.getByRole("button", {
      name: "Consent",
      exact: true,
    }),
  ).toBeEnabled();

  await expect(
    page.getByRole("button", {
      name: "Reject",
      exact: true,
    }),
  ).toBeEnabled();

  // Recovery itself is permissionless.
  await expect(
    page.getByRole("button", {
      name: "Recover if expired",
      exact: true,
    }),
  ).toBeEnabled();

  // Merely connecting must not
  // create transaction activity.
  await page
    .getByRole("button", {
      name:
        "Open transaction activity",
    })
    .click();

  await expect(
    page.getByText(
      "No transactions yet",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  const requests =
    await walletRequests(page);

  expect(
    requests.some(
      ({ method }) =>
        method ===
        "eth_requestAccounts",
    ),
  ).toBe(true);

  expectNoSigningOrWrite(
    requests,
  );

  await page.screenshot({
    path:
      "artifacts/browser-qa/wallet-connected-safe.png",
    fullPage: true,
  });
});

test("unrelated wallet cannot perform publisher or principal actions", async ({
  page,
}) => {
  await installMockWallet(
    page,
    OTHER_WALLET,
    true,
  );

  await page.goto(
    `/app/policies/${encodeURIComponent(
      POLICY_ID,
    )}`,
  );

  await expect(
    page.locator(
      'button[title="Copy connected wallet address"]',
    ),
  ).toBeVisible({
    timeout: 15_000,
  });

  await expect(
    page.getByText(
      "Version 6",
      {
        exact: true,
      },
    ),
  ).toBeVisible({
    timeout: 30_000,
  });

  await expect(
    page.getByRole("button", {
      name: "Propose version",
      exact: true,
    }),
  ).toBeDisabled();

  await expect(
    page.getByRole("button", {
      name: "Consent",
      exact: true,
    }),
  ).toBeDisabled();

  await expect(
    page.getByRole("button", {
      name: "Reject",
      exact: true,
    }),
  ).toBeDisabled();

  // Permissionless recovery remains
  // available at the UI layer.
  await expect(
    page.getByRole("button", {
      name: "Recover if expired",
      exact: true,
    }),
  ).toBeEnabled();

  const requests =
    await walletRequests(page);

  expectNoSigningOrWrite(
    requests,
  );
});
