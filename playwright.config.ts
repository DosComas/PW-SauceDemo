import { defineConfig, devices } from '@playwright/test';
import { t, CURRENT_ENV } from '@data';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      'html',
      {
        title: `${CURRENT_ENV.environment} Report [${t.meta.locale}]`,
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: CURRENT_ENV.baseUrl,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    locale: t.meta.locale,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  snapshotPathTemplate: `{testDir}/__snapshots__/{testFilePath}/{projectName}-${t.meta.locale}-{arg}{ext}`,

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'Auth',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: 'auth.setup.ts',
    },

    /* Test against desktop viewports. */
    {
      name: 'Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      dependencies: ['Auth'],
    },
    {
      name: 'Safari',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['Auth'],
    },

    /* Test against mobile viewports. */
    {
      name: 'Android',
      use: { ...devices['Pixel 7'] },
      dependencies: ['Auth'],
    },
    {
      name: 'iPhone',
      use: { ...devices['iPhone 14'] },
      dependencies: ['Auth'],
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
