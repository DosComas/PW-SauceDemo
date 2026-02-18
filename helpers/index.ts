import type { Page } from '@playwright/test';
import { _getHeader, _getFooter } from './common/app.locators';
import { account } from './account.helpers';
import { catalog } from './catalog.helpers';
import { purchase } from './purchase.helpers';

// ==========================================
// 🏛️ HELPERS GATEWAY
// ==========================================

export type App = ReturnType<typeof createApp>;

export const createApp = (page: Page) => {
  const headerLocs = _getHeader(page);
  const footerLocs = _getFooter(page);

  const catalogObj = catalog(page);
  const accountObj = account(page, headerLocs);
  const purchaseObj = purchase(page, headerLocs);

  return {
    loc: {
      header: headerLocs,
      footer: footerLocs,
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
