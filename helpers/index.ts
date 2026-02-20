import type { Page } from '@playwright/test';
import { layoutLocators } from './core/layout.core';
import { account } from './account.helpers';
import { catalog } from './catalog.helpers';
import { purchase } from './purchase.helpers';

// ==========================================
// 🏛️ HELPERS GATEWAY
// ==========================================

export type Gateway = ReturnType<typeof createGateway>;

export const createGateway = (page: Page) => {
  const catalogObj = catalog(page);
  const accountObj = account(page);
  const purchaseObj = purchase(page);

  return {
    loc: {
      ...layoutLocators(page),
      ...accountObj.loc,
      ...catalogObj.loc,
      ...purchaseObj.loc,
    },
    act: {
      ...accountObj.act,
      ...catalogObj.act,
      ...purchaseObj.act,
    },
    query: {
      ...accountObj.query,
      ...catalogObj.query,
      ...purchaseObj.query,
    },
  };
};
