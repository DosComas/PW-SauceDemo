import { type Page } from '@playwright/test';
import { catalog } from './catalog.helpers';
import { identity } from './identity.helpers';

export const createApp = (page: Page) => {
  const catalogObj = catalog(page);
  const identityObj = identity(page);

  return {
    action: {
      ...catalogObj.action,
      ...identityObj.action,
    },
    loc: {
      ...catalogObj.loc,
      ...identityObj.loc,
    },
    session: {
      ...identityObj.session,
    },
  };
};

export { SortableKeys } from './catalog.helpers';
