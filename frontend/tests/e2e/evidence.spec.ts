import {
  expect,
  test,
} from "@playwright/test";
import {
  watchBrowserErrors,
} from "./helpers";

test("Bradbury evidence page exposes frozen deployment identifiers", async ({
  page,
}) => {
  const browser =
    watchBrowserErrors(page);

  await page.goto(
    "/app/evidence",
  );

  await expect(
    page.getByText(
      "0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      "0x66e01ac9797ebdf53a17fc56090bad546940adf3614350c362c711457b9b92ac",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  browser.assertClean();
});
