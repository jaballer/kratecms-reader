import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — runs the Vite dev server automatically so the suite is
 * self-contained. The tests hit http://localhost:5173 (Vite's default), which
 * proxies /api/* to the configured KrateCMS instance.
 *
 * For CI / a deployed-URL smoke test, run with:
 *   E2E_BASE_URL=https://kratecms-reader.netlify.app npx playwright test
 */

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:5173";
const usingExternalServer = !!process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Only start the dev server when we're not pointing at a deployed URL.
  webServer: usingExternalServer
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:5173",
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
});
