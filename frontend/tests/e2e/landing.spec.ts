import {
  expect,
  test,
} from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  watchBrowserErrors,
} from "./helpers";

test("landing page renders the full product narrative", async ({
  page,
}) => {
  const browser =
    watchBrowserErrors(page);

  await page.goto("/");

  await expect(page).toHaveTitle(
    /PolicyDelta/,
  );

  await expect(
    page.getByRole("heading", {
      name: /Policies evolve/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByText(
      "Semantic consent infrastructure",
    ),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: /semantic control plane/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: /Integrity tells you the text changed/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: /Consequences are explicit/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByText(
      /Built around authority safety/i,
    ),
  ).toBeVisible();

  await expectNoHorizontalOverflow(
    page,
  );

  await page.screenshot({
    path:
      "artifacts/browser-qa/landing-light.png",
    fullPage: true,
  });

  browser.assertClean();
});

test("theme toggle switches into dark mode without hydration errors", async ({
  page,
}) => {
  const browser =
    watchBrowserErrors(page);

  await page.emulateMedia({
    colorScheme: "light",
  });

  await page.goto("/");

  await page
    .getByRole("button", {
      name: "Toggle color theme",
    })
    .click();

  await expect(
    page.locator("html"),
  ).toHaveClass(/dark/);

  await page.screenshot({
    path:
      "artifacts/browser-qa/landing-dark.png",
    fullPage: true,
  });

  browser.assertClean();
});

test("landing page remains usable on a phone viewport", async ({
  page,
}) => {
  const browser =
    watchBrowserErrors(page);

  await page.setViewportSize({
    width: 390,
    height: 844,
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /Policies evolve/i,
    }),
  ).toBeVisible();

  await expect(
    page
      .getByRole("link", {
        name: /Open PolicyDelta/i,
      })
      .first(),
  ).toBeVisible();

  await expectNoHorizontalOverflow(
    page,
  );

  await page.screenshot({
    path:
      "artifacts/browser-qa/landing-mobile.png",
    fullPage: true,
  });

  browser.assertClean();
});
