import {
  defineConfig,
  devices,
} from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 60_000,

  expect: {
    timeout: 15_000,
  },

  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder:
          "playwright-report",
        open: "never",
      },
    ],
  ],

  use: {
    baseURL:
      "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot:
      "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices[
          "Desktop Chrome"
        ],
      },
    },
  ],

  webServer: {
    command:
      "npm run start -- --hostname 127.0.0.1 --port 3100",
    url:
      "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
