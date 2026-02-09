import { test, expect } from '@playwright/test';
import { accountLoc, doLogin } from '../../helpers/account-helpers'; //*
import { t } from '../../helpers/i18n';
import { VALID_USERS } from '../../data/users';
import { toSnapshotName } from '../../helpers/string-utils';
import { getProductData, productLoc } from '../../helpers/catalog-helpers';

test.beforeEach(async ({ page }) => {
  await test.step('🟦 Navigate', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of VALID_USERS) {
  test.describe(`${persona.role}`, () => {
    test.use({ storageState: persona.storageState });

    test('Verify product data matches data from inventory', async ({ page }) => {
      const { productUI } = productLoc(page);

      const { name, price, desc } = await test.step('⬜ Get product data', async () => {
        const firstProduct = await getProductData(page);
        return firstProduct;
      });

      await test.step('🟦 Go to product', async () => {
        await productUI.name.filter({ hasText: name }).click();
      });

      await expect(productUI.name, '🟧 Name should match').toHaveText(name);
      await expect(productUI.desc, '🟧 Description should match').toHaveText(desc);
      await expect(productUI.price, '🟧 Price should match').toHaveText(price);
    });

    test('Verify cart buttons stay syncronized beetwen pages', async ({ page }) => {
      // add product to cart
      // go to that product
      // verify button shows remove and cart has 1 item
    });

    if (persona.isBaselineUser) {
      test('Verify product page layout', { tag: '@visual' }, async ({ page }) => {
        // go to first product
        // standardize title, info, price
        // snapshot
      });
    }
  });
}
