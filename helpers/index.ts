import type { Page } from '@playwright/test';
import { layoutLocators } from './core/layout.core';
import { account } from './account.helpers';
import { catalog } from './catalog.helpers';
import { purchase } from './purchase.helpers';

// ==========================================
// 🏛️ HELPERS GATEWAY
// ==========================================

export type App = ReturnType<typeof createApp>;

export const createApp = (page: Page) => {
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
    action: {
      ...accountObj.action,
      ...catalogObj.action,
      ...purchaseObj.action,
    },
    session: {
      ...accountObj.session,
    },
  };
};
