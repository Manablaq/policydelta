import {
  expect,
  test,
} from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  watchBrowserErrors,
} from "./helpers";

test("application shell has functional navigation and no dead routes", async ({
  page,
}) => {
  const browser =
    watchBrowserErrors(page);

  await page.goto("/app");

  await expect(
    page.getByRole("heading", {
      name: "Authority at a glance",
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("button", {
      name: /Connect wallet/i,
    }),
  ).toBeVisible();

  const routes = [
    [
      "Policies",
      "/app/policies",
    ],
    [
      "Compare",
      "/app/compare",
    ],
    [
      "Activity",
      "/app/activity",
    ],
    [
      "Evidence",
      "/app/evidence",
    ],
  ] as const;

  for (const [label, url] of routes) {
    await page
      .getByRole("link", {
        name: label,
        exact: true,
      })
      .click();

    await expect(page).toHaveURL(
      new RegExp(
        url.replaceAll(
          "/",
          "\\/",
        ),
      ),
    );

    await expect(
      page.getByRole("link", {
        name: label,
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.locator("body"),
    ).not.toContainText(
      "404",
    );
  }

  await expectNoHorizontalOverflow(
    page,
  );

  browser.assertClean();
});

test("mobile application navigation opens and remains within viewport", async ({
  page,
}) => {
  const browser =
    watchBrowserErrors(page);

  await page.setViewportSize({
    width: 390,
    height: 844,
  });

  await page.goto("/app");

  await page
    .getByRole("button", {
      name: "Open navigation",
    })
    .click();

  await expect(
    page.getByRole("link", {
      name: "Policies",
      exact: true,
    }),
  ).toBeVisible();

  await expectNoHorizontalOverflow(
    page,
  );

  await page.screenshot({
    path:
      "artifacts/browser-qa/app-mobile.png",
    fullPage: true,
  });

  browser.assertClean();
});
