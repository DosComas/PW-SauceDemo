import { test, expect } from '@playwright/test';
import { accountLoc, doLogin } from '../../helpers/account-helpers'; //*
import { t } from '../../helpers/i18n';
import { VALID_USERS } from '../../data/users';
import { toSnapshotName } from '../../helpers/string-utils';

// test, open a product, test visual
// test add to cart?

test.beforeEach(async ({ page }) => {
  await test.step('🟦 Navigate', async () => {
    await page.goto('/');
  });
});

for (const persona of VALID_USERS) {
  test.describe(`${persona.role}`, () => {
    test('Verify product data matches data from inventory', async ({ page }) => {
      //*
    });

    test('Verify cart buttons stay syncronized beetwen pages', async ({ page }) => {
      //*
    });

    if (persona.isBaselineUser) {
      test('Verify product page layout @visual', async ({ page }) => {
        //*
      });
    }
  });
}
