import { defineConfig, devices } from '@playwright/test';
import { t } from '@data';
import { runSeed, runEnv } from './runtime';
import os from 'os';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  globalSetup: './global.setup.ts',
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? undefined : Math.max(os.cpus().length - 1, 1),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { title: `${runEnv.name} [${t.meta.locale}] [seed: ${runSeed}]` }], ['dot']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: runEnv.baseUrl,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    locale: t.meta.locale,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 4_000,
    navigationTimeout: 8_000,
  },
  snapshotPathTemplate: `{testDir}/__screenshots__/{projectName}/[${t.meta.locale}]-{arg}{ext}`,
  timeout: 20_000,
  expect: { timeout: 4_000 },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'auth.setup.ts',
    },

    /* Test against desktop viewports. */
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      dependencies: ['setup'],
    },
    {
      name: 'safari',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },

    /* Test against mobile viewports. */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer:
    runEnv.name === 'Local'
      ? {
          command: 'cd app-source && npm run start',
          url: runEnv.baseUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        }
      : undefined,
});
