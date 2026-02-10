import { test, expect } from '@playwright/test';
import { getProductData, navToProduct, productLoc } from '../../helpers/catalog-helpers';
import { t } from '../../helpers/i18n';
import { VALID_USERS } from '../../data/users';
import { toSnapshotName } from '../../helpers/string-utils';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory page', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of VALID_USERS) {
  test.describe(`${persona.role}`, () => {
    test.use({ storageState: persona.storageState });

    test('Verify product data matches data from inventory', async ({ page }) => {
      const { productUI } = productLoc(page);

      const expectedProduct = await test.step('⬜ Scrap product data', async () => {
        return await getProductData(page, { productIndex: 0 });
      });

      await test.step('🟦 Navigate to product', async () => {
        await navToProduct(page, { productName: expectedProduct.name });
      });

      await expect.soft(productUI.name(), '🟧 Name should match').toHaveText(expectedProduct.name);
      await expect.soft(productUI.desc(), '🟧 Description should match').toHaveText(expectedProduct.desc);
      await expect.soft(productUI.price(), '🟧 Price should match').toHaveText(expectedProduct.price);
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
