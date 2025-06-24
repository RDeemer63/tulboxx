import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Read from default ".env" file.
dotenv.config();

// Read from ".env.local" file.
// __dirname is not defined in ESM, compute it from import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local'), override: true });


/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Test directory: Where your E2E tests are located */
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0, // Increased to 1 retry on CI for flakiness

  /* Opt out of parallel tests on CI if needed, or set a specific number of workers. */
  workers: process.env.CI ? 2 : undefined, // Limit workers on CI to manage resources

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'], // Default reporter, good for CI console output
    ['html', { open: 'never', outputFolder: 'playwright-report' }] // HTML report for detailed analysis
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry', // Good balance for debugging failed tests

    /* Default viewport size */
    viewport: { width: 1280, height: 720 },

    /* Timeout for each action in milliseconds */
    actionTimeout: 10 * 1000, // 10 seconds

    /* Timeout for page navigation in milliseconds */
    navigationTimeout: 30 * 1000, // 30 seconds

    /* Ignores HTTPS errors, useful for local dev with self-signed certs if any (not typical for localhost http) */
    ignoreHTTPSErrors: true,

    /* Emulate specific timezone */
    timezoneId: 'America/Chicago', // Example: Central Time
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: {
    /**
     * Use `npm run dev` if you have a package.json script to start your dev server.
     * Alternatively, you can use `pnpm dev` or `yarn dev` if you use different package managers.
     */
    command: 'npm run dev', // Assumes `npm run dev` starts your application
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5000', // URL to wait for
    reuseExistingServer: !process.env.CI, // Reuse server locally, but not in CI
    timeout: 120 * 1000, // 2 minutes for the server to start
    stdout: 'pipe', // Pipe stdout to the console
    stderr: 'pipe', // Pipe stderr to the console
    env: {
      NODE_ENV: 'development', // Ensure dev environment for the server
    }
  },

  /* Global timeout for the whole test run in milliseconds. */
  // globalTimeout: 60 * 60 * 1000, // 1 hour

  /* Timeout for each test case in milliseconds. */
  timeout: 60 * 1000, // 60 seconds per test
});
