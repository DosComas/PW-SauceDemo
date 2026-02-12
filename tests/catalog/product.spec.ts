import { test, expect, toSnapshotName } from '@utils';
import { catalog, catalogLoc } from '@helpers';
import { VALID_USERS, STORAGE_KEYS } from '@data';

const SCOPE = 'PDP';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory page', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of VALID_USERS) {
  test.describe(`${persona.role}`, () => {
    test.use({ storageState: persona.storageState });

    test(`${SCOPE}: Content matches inventory data`, async ({ page }) => {
      const { productUI } = catalogLoc(page);

      const setup = {
        firstProduct: 0,
      };

      const expectedProduct = await test.step('⬜ Scrape product data', async () => {
        return await catalog.getProductData(page, { from: 'inventory', index: setup.firstProduct });
      });

      await test.step('🟦 Navigate to PDP', async () => {
        await catalog.openProductDetails(page, { index: setup.firstProduct, via: 'name' });
      });

      await expect.soft(productUI.name(), '🟧 UI: Product name matches').toHaveText(expectedProduct.name);
      await expect.soft(productUI.desc(), '🟧 UI: Product description matches').toHaveText(expectedProduct.desc);
      await expect.soft(productUI.price(), '🟧 UI: Product price matches').toHaveText(expectedProduct.price);
    });

    test(`${SCOPE}: Add/Remove button toggles cart state`, async ({ page }) => {
      const { productUI, inventoryUI } = catalogLoc(page);

      const setup = {
        firstProduct: 0,
      };

      await test.step('🟦 Navigate to PDP', async () => {
        await catalog.openProductDetails(page, { index: setup.firstProduct, via: 'img' });
      });

      await test.step('🟦 Add product to cart', async () => {
        await catalog.addProductToCart(page, { from: 'pdp', index: setup.firstProduct });
      });

      await expect.soft(productUI.removeButton(), '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(inventoryUI.cartBadge, `🟧 UI: Badge shows 1`).toHaveText('1');
      await expect.soft({ page, key: STORAGE_KEYS.cart }, `🟧 Data: Local storage has 1 item`).toHaveStorageLength(1);

      await test.step('🟦 Remove product from cart', async () => {
        await catalog.removeProductFromCart(page, { from: 'pdp', index: setup.firstProduct });
      });

      await expect.soft(productUI.addToCartButton(), '🟧 UI: Add button visible').toBeVisible();
      await expect.soft(inventoryUI.cartBadge, `🟧 UI: Badge removed`).not.toBeVisible();
      await expect.soft({ page, key: STORAGE_KEYS.cart }, `🟧 Data: Local storage is empty`).toHaveStorageLength(0);
    });

    test(`${SCOPE}: State persistence from inventory`, async ({ page }) => {
      const { productUI, inventoryUI } = catalogLoc(page);

      const setup = {
        productIndices: [0, 1, 2],
        get lastProduct() {
          return this.productIndices.slice(-1)[0];
        },
      };

      await test.step('⬜ Add products to cart on inventory', async () => {
        for (const productIndex of setup.productIndices) {
          await catalog.addProductToCart(page, { from: 'inventory', index: productIndex });
        }
      });

      await test.step('🟦 Navigate to PDP', async () => {
        await catalog.openProductDetails(page, { index: setup.lastProduct, via: 'img' });
      });

      await expect.soft(productUI.removeButton(), '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(inventoryUI.cartBadge, `🟧 UI: Badge shows 3`).toHaveText('3');
      await expect.soft({ page, key: STORAGE_KEYS.cart }, `🟧 Data: Local storage has 3 items`).toHaveStorageLength(3);
    });

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page }) => {
        const { productUI } = catalogLoc(page);

        const setup = {
          firstProduct: 0,
        };

        await test.step('⬜ Navigate to PDP', async () => {
          await catalog.openProductDetails(page, { index: setup.firstProduct, via: 'name' });
        });

        await test.step('⬜ Standardize PDP data', async () => {
          await catalog.standardizeProductCard(page, { from: 'pdp', index: setup.firstProduct });
        });

        await expect(page, '🟧 UI: PDP layout visual check').toHaveScreenshot(
          `${toSnapshotName(persona.role)}-product.png`,
          { mask: [productUI.pdpImg], fullPage: true }
        );
      });
    }
  });
}
