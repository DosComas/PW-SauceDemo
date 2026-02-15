import { test as base, expect as baseExpect } from '@playwright/test';
import { customMatchers } from '@utils';
import { createApp } from '@helpers';

type App = ReturnType<typeof createApp>;

export const expect = baseExpect.extend(customMatchers);

export const test = base.extend<{
  loc: App['loc'];
  action: App['action'];
  session: App['session'];
}>({
  loc: async ({ page }, use) => {
    const { loc } = createApp(page);
    await use(loc);
  },

  action: async ({ page }, use) => {
    const { action } = createApp(page);
    await use(action);
  },

  session: async ({ page }, use) => {
    const { session } = createApp(page);
    await use(session);
  },
});
