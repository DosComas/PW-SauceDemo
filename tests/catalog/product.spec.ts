import { test, expect } from '@playwright/test';
import { catalog, productLoc } from '../../helpers/catalog.helpers';
import { t } from '../../utils/i18n';
import { VALID_USERS } from '../../data/users';
import { toSnapshotName } from '../../utils/string.utils';

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

      const setup = {
        target: 0,
      };

      const expectedProduct = await test.step('⬜ Scrap product data', async () => {
        return await catalog.getProductData(page, { from: 'inventory', index: setup.target });
      });

      await test.step('🟦 Navigate to product', async () => {
        await catalog.openProductDetails(page, { index: setup.target, via: 'name' });
      });

      await expect.soft(productUI.name(), '🟧 Name should match').toHaveText(expectedProduct.name);
      await expect.soft(productUI.desc(), '🟧 Description should match').toHaveText(expectedProduct.desc);
      await expect.soft(productUI.price(), '🟧 Price should match').toHaveText(expectedProduct.price);
    });

    test('Verify product can be added and removed from cart', async ({ page }) => {
      const { productUI, inventoryUI } = productLoc(page);

      const setup = {
        target: 0,
      };

      await test.step('🟦 Navigate to product', async () => {
        await catalog.openProductDetails(page, { index: setup.target, via: 'img' });
      });

      await test.step('🟦 Add product to cart', async () => {
        await catalog.addProductToCart(page, { from: 'pdp', index: setup.target });
      });

      await expect.soft(productUI.removeButton(), '🟧 Remove button should be visible').toBeVisible();
      await expect.soft(productUI.removeButton(), '🟧 Remove button should be enabled').toBeEnabled();

      await test.step('🟦 Remove product from cart', async () => {
        await catalog.removeProductFromCart(page, { from: 'pdp', index: setup.target });
      });

      await expect.soft(productUI.addToCartButton(), '🟧 Add to cart button should be visible').toBeVisible();
      await expect.soft(productUI.addToCartButton(), '🟧 Add to cart button should be enabled').toBeEnabled();
      await expect.soft(inventoryUI.cartBadge, `🟧 Cart badge should disappear`).not.toBeVisible();
    });

    test('Verify cart buttons stay syncronized beetwen pages', async ({ page }) => {
      const { productUI, inventoryUI } = productLoc(page);

      const setup = {
        targets: [0, 1, 2],
        get target() {
          return this.targets.at(-1)!;
        },
        get count() {
          return this.targets.length.toString();
        },
      };

      await test.step('🟦 Add products to cart', async () => {
        for (const productIndex of setup.targets) {
          await catalog.addProductToCart(page, { from: 'inventory', index: productIndex });
        }
      });

      await test.step('🟦 Navigate to product', async () => {
        await catalog.openProductDetails(page, { index: setup.target, via: 'img' });
      });

      await expect.soft(productUI.removeButton(), '🟧 Remove button should be visible').toBeVisible();
      await expect.soft(productUI.removeButton(), '🟧 Remove button should be enabled').toBeEnabled();
      await expect
        .soft(inventoryUI.cartBadge, `🟧 Cart badge should show ${setup.count} items`)
        .toHaveText(setup.count);
    });

    if (persona.isBaselineUser) {
      test('Verify product page layout', { tag: '@visual' }, async ({ page }) => {
        const productToOpen = 0;

        await test.step('🟦 Navigate to product', async () => {
          await catalog.openProductDetails(page, { index: productToOpen, via: 'name' });
        });

        // standardize title, info, price
        // snapshot
      });
    }
  });
}
