import {
  expect,
  type Page,
} from "@playwright/test";

export function watchBrowserErrors(
  page: Page,
) {
  const errors: string[] = [];

  page.on(
    "pageerror",
    (error) => {
      errors.push(
        `PAGEERROR: ${error.message}`,
      );
    },
  );

  page.on(
    "console",
    (message) => {
      if (
        message.type() === "error"
      ) {
        errors.push(
          `CONSOLE: ${message.text()}`,
        );
      }
    },
  );

  return {
    assertClean() {
      expect(
        errors,
        errors.join("\n"),
      ).toEqual([]);
    },
  };
}

export async function expectNoHorizontalOverflow(
  page: Page,
) {
  const overflow =
    await page.evaluate(() => {
      return (
        document.documentElement
          .scrollWidth >
        window.innerWidth + 1
      );
    });

  expect(overflow).toBe(false);
}
