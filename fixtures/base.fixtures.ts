import { test as base, expect as baseExpect } from '@playwright/test';
import { customMatchers } from '@utils';
import { type App, createApp } from '@helpers';

// ==========================================
// 🏛️ CUSTOM ASSERTIONS
// ==========================================

export const expect = baseExpect.extend(customMatchers);

// ==========================================
// 🏛️ TEST FIXTURES
// ==========================================

type MyFixtures = { _app: App; loc: App['loc']; action: App['action']; session: App['session'] };

export const test = base.extend<MyFixtures>({
  _app: async ({ page }, use) => {
    await use(createApp(page));
  },

  loc: async ({ _app }, use) => {
    await use(_app.loc);
  },

  action: async ({ _app }, use) => {
    await use(_app.action);
  },

  session: async ({ _app }, use) => {
    await use(_app.session);
  },
});
