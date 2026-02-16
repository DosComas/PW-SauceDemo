import { type Page } from '@playwright/test';
import { _appHeader } from './common/app.locators';
import { identity } from './identity.helpers';
import { catalog } from './catalog.helpers';
import { purchase } from './purchase.helpers';

export const createApp = (page: Page) => {
  const headerLocs = _appHeader(page);
  const catalogObj = catalog(page);
  const identityObj = identity(page, headerLocs);
  const purchaseObj = purchase(page, headerLocs);

  return {
    loc: {
      header: headerLocs,
      ...identityObj.loc,
      ...catalogObj.loc,
      ...purchaseObj.loc,
    },
    action: {
      ...identityObj.action,
      ...catalogObj.action,
      ...purchaseObj.action,
    },
    session: {
      ...identityObj.session,
    },
  };
};

export type App = ReturnType<typeof createApp>;
export { ItemSortAttribute } from './catalog.helpers';
