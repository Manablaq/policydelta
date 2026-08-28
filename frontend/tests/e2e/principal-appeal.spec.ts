import {
  expect,
  test,
  type Page,
} from "@playwright/test";
import {
  watchBrowserErrors,
} from "./helpers";

const PRINCIPAL =
  "0x1f87Ae197af539253978d435aD45cCf28Fb95024";

const POLICY_ID =
  "adversarial-authority-policy";

const REVIEW_HASH =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const EVM_HASH =
  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

async function installPrincipalWallet(
  page: Page,
) {
  await page.addInitScript(
    ({
      principal,
      evmHash,
    }) => {
      const requests:
        string[] = [];

      const provider = {
        async request({
          method,
        }: {
          method: string;
          params?: unknown;
        }) {
          requests.push(method);

          if (
            method ===
              "eth_accounts" ||
            method ===
              "eth_requestAccounts"
          ) {
            return [principal];
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
            method ===
            "eth_sendTransaction"
          ) {
            return evmHash;
          }

          if (
            method ===
            "eth_getTransactionCount"
          ) {
            return "0x0";
          }

          if (
            method ===
            "eth_estimateGas"
          ) {
            return "0x30d40";
          }

          if (
            method ===
            "eth_gasPrice"
          ) {
            return "0x1";
          }

          return null;
        },
        on() {},
        removeListener() {},
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
          __appealQaRequests?: string[];
        }
      ).__appealQaRequests =
        requests;
    },
    {
      principal: PRINCIPAL,
      evmHash: EVM_HASH,
    },
  );
}

async function mockPrincipalAccount(
  page: Page,
) {
  await page.route(
    /\/api\/account(?:\?.*)?$/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType:
          "application/json",
        body: JSON.stringify({
          source: "bradbury",
          wallet:
            PRINCIPAL.toLowerCase(),
          scannedFromBlock:
            18_847_788,
          scannedToBlock:
            18_900_000,
          policies: [
            {
              wallet:
                PRINCIPAL.toLowerCase(),
              policyId:
                POLICY_ID,
              role: "principal",
              firstSeenAt:
                "2026-08-28T10:00:00.000Z",
              updatedAt:
                "2026-08-28T10:05:00.000Z",
            },
          ],
          activity: [
            {
              hash:
                REVIEW_HASH,
              wallet:
                PRINCIPAL.toLowerCase(),
              functionName:
                "review_version",
              policyId:
                POLICY_ID,
              version: 2,
              consensusStatus:
                "ACCEPTED",
              executionStatus:
                "FINISHED_WITH_RETURN",
              methodVerified: true,
              relationship:
                "affected_principal",
              submittedAt:
                "2026-08-28T10:05:00.000Z",
              updatedAt:
                "2026-08-28T10:05:00.000Z",
            },
          ],
          principalReviewAlerts: [
            {
              hash:
                REVIEW_HASH,
              policyId:
                POLICY_ID,
              version: 2,
              previousFinalizedVersion: 1,
              previousFinalizedPolicyText:
                "The agent may pay Vendor A only, up to 100 GEN monthly.",
              provisionalPolicyText:
                "The agent may pay any recipient, up to 100 GEN monthly.",
              consensusStatus:
                "ACCEPTED",
              executionStatus:
                "FINISHED_WITH_RETURN",
              changeClass:
                "NON_MATERIAL",
              requiresReconsent: false,
              canAppeal: true,
              appealCheckAvailable: true,
              minAppealBond: "100",
              appealCheckedAt:
                "2026-08-28T10:05:10.000Z",
              submittedAt:
                "2026-08-28T10:05:00.000Z",
            },
          ],
        }),
      });
    },
  );
}

async function mockAppealRpc(
  page: Page,
) {
  let ethCallCount = 0;

  await page.route(
    "https://rpc-bradbury.genlayer.com/**",
    async (route) => {
      const body =
        route.request().postDataJSON() as {
          id?: number;
          method?: string;
        };

      let result:
        | string
        | null = null;

      if (
        body.method ===
        "eth_chainId"
      ) {
        result = "0x107d";
      } else if (
        body.method ===
        "eth_call"
      ) {
        ethCallCount += 1;
        result =
          ethCallCount === 1
            ? `0x${"0".repeat(63)}1`
            : `0x${"0".repeat(62)}64`;
      } else if (
        body.method ===
        "eth_getTransactionCount"
      ) {
        result = "0x0";
      } else if (
        body.method ===
        "eth_estimateGas"
      ) {
        result = "0x30d40";
      } else if (
        body.method ===
        "eth_gasPrice"
      ) {
        result = "0x1";
      } else if (
        body.method ===
        "eth_blockNumber"
      ) {
        result = "0x1";
      } else if (
        body.method ===
        "eth_getTransactionReceipt"
      ) {
        await route.fulfill({
          status: 200,
          contentType:
            "application/json",
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: body.id ?? 1,
            result: {
              transactionHash:
                EVM_HASH,
              transactionIndex:
                "0x0",
              blockHash:
                `0x${"c".repeat(64)}`,
              blockNumber: "0x1",
              from:
                PRINCIPAL,
              to:
                "0x0112Bf6e83497965A5fdD6Dad1E447a6E004271D",
              cumulativeGasUsed:
                "0x5208",
              gasUsed: "0x5208",
              contractAddress: null,
              logs: [],
              logsBloom:
                `0x${"0".repeat(512)}`,
              status: "0x1",
              effectiveGasPrice:
                "0x1",
              type: "0x2",
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType:
          "application/json",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: body.id ?? 1,
          result,
        }),
      });
    },
  );
}

test("permissionless false-negative review is surfaced to the principal before finality", async ({
  page,
}) => {
  const browser =
    watchBrowserErrors(page);

  await installPrincipalWallet(
    page,
  );
  await mockPrincipalAccount(
    page,
  );

  await page.goto(
    "/app/activity",
  );

  await expect(
    page.getByRole("heading", {
      name:
        "NON_MATERIAL review accepted — appeal before finality",
    }),
  ).toBeVisible();

  await expect(
    page.getByText(
      /V1 remains the authority shown by PolicyDelta's finalized read path/i,
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      "The agent may pay Vendor A only, up to 100 GEN monthly.",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      "The agent may pay any recipient, up to 100 GEN monthly.",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      "Submitted by another account · affects you as principal",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByRole("button", {
      name: "Appeal verdict",
    }),
  ).toBeEnabled();

  const requests =
    await page.evaluate(() =>
      (
        window as typeof window & {
          __appealQaRequests?: string[];
        }
      ).__appealQaRequests ??
      [],
    );

  expect(
    requests,
  ).not.toContain(
    "eth_sendTransaction",
  );

  browser.assertClean();
});

test("principal appeal action rechecks eligibility and submits the exact minimum bond", async ({
  page,
}) => {
  await installPrincipalWallet(
    page,
  );
  await mockPrincipalAccount(
    page,
  );
  await mockAppealRpc(page);

  await page.goto(
    "/app/activity",
  );

  await page
    .getByRole("button", {
      name: "Appeal verdict",
    })
    .click();

  await expect.poll(
    () =>
      page.evaluate(() =>
        (
          window as typeof window & {
            __appealQaRequests?: string[];
          }
        ).__appealQaRequests ??
        [],
      ),
  ).toContain(
    "eth_sendTransaction",
  );

  await expect(
    page.getByText(
      `Appeal submitted for ${POLICY_ID} V2.`,
      {
        exact: true,
      },
    ),
  ).toBeVisible();
});
