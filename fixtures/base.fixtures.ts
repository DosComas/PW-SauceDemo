import { test as base, expect as baseExpect } from '@playwright/test';
import { customMatchers } from '@utils';
import { type Gateway, createGateway } from '../helpers';

// ==========================================
// 🏛️ CUSTOM FIXTURES
// ==========================================

type MyFixtures = { _gateway: Gateway; loc: Gateway['loc']; act: Gateway['act']; query: Gateway['query'] };

/** Fixture: Provides gateway access to loc, act, query */
export const test = base.extend<MyFixtures>({
  _gateway: async ({ page }, use) => {
    await use(createGateway(page));
  },

  loc: async ({ _gateway }, use) => await use(_gateway.loc),
  act: async ({ _gateway }, use) => await use(_gateway.act),
  query: async ({ _gateway }, use) => await use(_gateway.query),
});

// ==========================================
// 🏛️ CUSTOM ASSERTIONS
// ==========================================

/** Custom matchers extended with toBeSortedBy */
export const expect = baseExpect.extend(customMatchers);
