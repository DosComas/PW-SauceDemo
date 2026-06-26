import type { Page } from '@playwright/test';
import { layout } from './core/layout.core';
import { account } from './account.helpers';
import { catalog } from './catalog.helpers';
import { purchase } from './purchase.helpers';

// ==========================================
// 🏛️ HELPERS GATEWAY
// ==========================================

export type AppModules = ReturnType<typeof getModules>;
export type AppLocs = ReturnType<typeof createLoc>;
export type AppActs = ReturnType<typeof createAct>;
export type AppQueries = ReturnType<typeof createQuery>;
export type AppA11y = ReturnType<typeof createA11y>;

export const getModules = (page: Page) => ({
  layout: layout(page),
  account: account(page),
  catalog: catalog(page),
  purchase: purchase(page),
});

export const createLoc = (m: AppModules) => {
  return {
    ...m.layout.loc,
    ...m.account.loc,
    ...m.catalog.loc,
    ...m.purchase.loc,
  };
};

export const createAct = (m: AppModules) => {
  return {
    ...m.account.act,
    ...m.catalog.act,
    ...m.purchase.act,
  };
};

export const createQuery = (m: AppModules) => {
  return {
    ...m.account.query,
    ...m.catalog.query,
    ...m.purchase.query,
  };
};

export const createA11y = (m: AppModules) => {
  return {
    aria: {
      ...m.account.a11y.aria,
      ...m.catalog.a11y.aria,
      ...m.purchase.a11y.aria,
    },
    axe: {
      ...m.account.a11y.axe,
      ...m.catalog.a11y.axe,
      ...m.purchase.a11y.axe,
    },
  };
};
