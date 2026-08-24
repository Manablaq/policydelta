import {
  expect,
  test,
  type Page,
} from "@playwright/test";

const POLICY_ID =
  "policydelta-bradbury-live-001";

const PRINCIPAL =
  "0x1f87Ae197af539253978d435aD45cCf28Fb95024";

const BACKPACK_ACCOUNT =
  "0x2222222222222222222222222222222222222222";

type RequestLog = {
  wallet: string;
  method: string;
};

async function installMultipleWallets(
  page: Page,
) {
  await page.addInitScript(
    ({
      principal,
      backpackAccount,
    }) => {
      const requests:
        RequestLog[] = [];

      function makeProvider(
        walletName: string,
        account: string,
        flags:
          Record<
            string,
            boolean
          >,
      ) {
        const listeners =
          new Map<
            string,
            Set<
              (
                value:
                  unknown,
              ) => void
            >
          >();

        return {
          ...flags,

          async request({
            method,
          }: {
            method: string;
            params?: unknown;
          }) {
            requests.push({
              wallet:
                walletName,
              method,
            });

            if (
              method ===
                "eth_accounts" ||
              method ===
                "eth_requestAccounts"
            ) {
              return [
                account,
              ];
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
              value:
                unknown,
            ) => void,
          ) {
            const bucket =
              listeners.get(
                event,
              ) ??
              new Set();

            bucket.add(
              listener,
            );

            listeners.set(
              event,
              bucket,
            );
          },

          removeListener(
            event: string,
            listener: (
              value:
                unknown,
            ) => void,
          ) {
            listeners
              .get(event)
              ?.delete(
                listener,
              );
          },
        };
      }

      const backpack =
        makeProvider(
          "Backpack",
          backpackAccount,
          {
            isBackpack:
              true,
          },
        );

      const metamask =
        makeProvider(
          "MetaMask",
          principal,
          {
            isMetaMask:
              true,
          },
        );

      Object.defineProperty(
        window,
        "ethereum",
        {
          value:
            backpack,
          configurable:
            true,
        },
      );

      function announce() {
        window.dispatchEvent(
          new CustomEvent(
            "eip6963:announceProvider",
            {
              detail: {
                info: {
                  uuid:
                    "11111111-1111-4111-8111-111111111111",
                  name:
                    "Backpack",
                  icon:
                    "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
                  rdns:
                    "app.backpack",
                },
                provider:
                  backpack,
              },
            },
          ),
        );

        window.dispatchEvent(
          new CustomEvent(
            "eip6963:announceProvider",
            {
              detail: {
                info: {
                  uuid:
                    "22222222-2222-4222-8222-222222222222",
                  name:
                    "MetaMask",
                  icon:
                    "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
                  rdns:
                    "io.metamask",
                },
                provider:
                  metamask,
              },
            },
          ),
        );
      }

      window.addEventListener(
        "eip6963:requestProvider",
        announce,
      );

      queueMicrotask(
        announce,
      );

      (
        window as typeof window & {
          __policyDeltaMultiWalletRequests?: RequestLog[];
        }
      ).__policyDeltaMultiWalletRequests =
        requests;
    },
    {
      principal:
        PRINCIPAL,
      backpackAccount:
        BACKPACK_ACCOUNT,
    },
  );
}

test("multiple injected wallets require explicit provider selection and use only the chosen provider", async ({
  page,
}) => {
  await installMultipleWallets(
    page,
  );

  await page.goto(
    `/app/policies/${encodeURIComponent(
      POLICY_ID,
    )}`,
  );

  await page.waitForTimeout(
    300,
  );

  await page
    .getByRole(
      "button",
      {
        name:
          "Connect wallet",
        exact: true,
      },
    )
    .click();

  await expect(
    page.getByRole(
      "heading",
      {
        name:
          "Choose a wallet",
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByRole(
      "button",
      {
        name:
          /Backpack/,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByRole(
      "button",
      {
        name:
          /MetaMask/,
      },
    ),
  ).toBeVisible();

  await page
    .getByRole(
      "button",
      {
        name:
          /MetaMask/,
      },
    )
    .click();

  await expect(
    page.locator(
      'button[title*="Copy connected wallet address"]',
    ),
  ).toBeVisible({
    timeout: 15_000,
  });

  const logs =
    await page.evaluate(
      () =>
        (
          window as typeof window & {
            __policyDeltaMultiWalletRequests?: RequestLog[];
          }
        )
          .__policyDeltaMultiWalletRequests ??
        [],
    );

  expect(
    logs.some(
      (entry) =>
        entry.wallet ===
          "MetaMask" &&
        entry.method ===
          "eth_requestAccounts",
    ),
  ).toBe(true);

  expect(
    logs.some(
      (entry) =>
        entry.wallet ===
          "Backpack" &&
        entry.method ===
          "eth_requestAccounts",
    ),
  ).toBe(false);

  expect(
    logs.some(
      (entry) =>
        /wallet_getSnaps|wallet_requestSnaps/.test(
          entry.method,
        ),
    ),
  ).toBe(false);

  expect(
    logs.filter(
      (entry) =>
        /sendtransaction|sign/i.test(
          entry.method,
        ),
    ),
  ).toEqual([]);
});
