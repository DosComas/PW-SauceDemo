import { test, expect } from '@playwright/test';
import { catalog, productLoc } from '../../helpers/catalog-helpers';
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
      const firstProduct = 0;

      const expectedProduct = await test.step('⬜ Scrap product data', async () => {
        return await catalog.getProductData(page, { from: 'inventory', index: firstProduct });
      });

      await test.step('🟦 Navigate to product', async () => {
        await catalog.openProductDetails(page, { index: firstProduct, via: 'name' });
      });

      await expect.soft(productUI.name(), '🟧 Name should match').toHaveText(expectedProduct.name);
      await expect.soft(productUI.desc(), '🟧 Description should match').toHaveText(expectedProduct.desc);
      await expect.soft(productUI.price(), '🟧 Price should match').toHaveText(expectedProduct.price);
    });

    test('Verify cart buttons stay syncronized beetwen pages', async ({ page }) => {
      const { productUI, inventoryUI } = productLoc(page);
      const firstProduct = 0;
      const expectedBadgeCount = '1';

      await test.step('🟦 Add product to cart', async () => {
        await catalog.addProductToCart(page, { from: 'inventory', index: firstProduct });
      });

      await test.step('🟦 Navigate to product', async () => {
        await catalog.openProductDetails(page, { index: firstProduct, via: 'img' });
      });

      await expect.soft(productUI.removeButton(), '🟧 Remove button should be visible').toBeVisible();
      await expect.soft(productUI.removeButton(), '🟧 Remove button should be enabled').toBeEnabled();
      await expect
        .soft(inventoryUI.cartBadge, '🟧 Cart badge should show 1 item')
        .toHaveText(expectedBadgeCount);
    });

    if (persona.isBaselineUser) {
      test('Verify product page layout', { tag: '@visual' }, async ({ page }) => {
        const firstProduct = 0;

        await test.step('🟦 Navigate to product', async () => {
          await catalog.openProductDetails(page, { index: firstProduct, via: 'name' });
        });

        // standardize title, info, price
        // snapshot
      });
    }
  });
}
