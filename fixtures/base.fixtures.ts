import { test as base, expect as baseExpect } from '@playwright/test';
import type { AppModules, AppLocs, AppActs, AppQueries, AppArias } from '../helpers';
import { getModules, createLoc, createAct, createQuery, createAria } from '../helpers';
import { customMatchers } from '@utils';

// ==========================================
// 🏛️ CUSTOM FIXTURES
// ==========================================

type MyFixtures = { _modules: AppModules; loc: AppLocs; act: AppActs; query: AppQueries; aria: AppArias };

export const test = base.extend<MyFixtures>({
  _modules: async ({ page }, use) => await use(getModules(page)),

  loc: async ({ _modules }, use) => await use(createLoc(_modules)),
  act: async ({ _modules }, use) => await use(createAct(_modules)),
  query: async ({ _modules }, use) => await use(createQuery(_modules)),
  aria: async ({ _modules }, use) => await use(createAria(_modules)),
});

// ==========================================
// 🏛️ CUSTOM ASSERTIONS
// ==========================================

export const expect = baseExpect.extend(customMatchers);
