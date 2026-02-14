import { test, expect, toSnapshotName } from '@utils';
import { catalog, catalogLocators } from '@helpers';
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
      const { pdpUI } = catalogLocators(page);

      const setup = {
        firstProduct: 0,
      };

      const expectedProduct = await test.step('⬜ Scrape product data', async () => {
        return await catalog.scrapeCatalogProduct(page, { from: 'inventory', index: setup.firstProduct });
      });

      await test.step('🟦 Navigate to PDP', async () => {
        await catalog.openProductDetails(page, { index: setup.firstProduct, via: 'name' });
      });

      await expect.soft(pdpUI.productCard.name, '🟧 UI: Product name matches').toHaveText(expectedProduct.name);
      await expect.soft(pdpUI.productCard.desc, '🟧 UI: Product description matches').toHaveText(expectedProduct.desc);
      await expect.soft(pdpUI.productCard.price, '🟧 UI: Product price matches').toHaveText(expectedProduct.price);
      await expect
        .soft(pdpUI.productCard.image, '🟧 UI: Product image source matches')
        .toHaveAttribute('src', expectedProduct.image);
    });

    test(`${SCOPE}: Add/Remove button toggles cart state`, async ({ page }) => {
      const { pdpUI, headerUI } = catalogLocators(page);

      const setup = {
        firstProduct: 0,
      };

      await test.step('🟦 Navigate to PDP', async () => {
        await catalog.openProductDetails(page, { index: setup.firstProduct, via: 'img' });
      });

      await test.step('🟦 Add product to cart', async () => {
        await catalog.addProductToCart(page, { from: 'pdp' });
      });

      await expect.soft(pdpUI.productCard.removeButton, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(headerUI.cartBadge, `🟧 UI: Cart Badge shows 1 item`).toHaveText('1');
      await expect(page, `🟧 Data: Local storage has 1 item`).toHaveStorageLength(STORAGE_KEYS.cart, 1);

      await test.step('🟦 Remove product from cart', async () => {
        await catalog.removeProductFromCart(page, { from: 'pdp' });
      });

      await expect.soft(pdpUI.productCard.addToCartButton, '🟧 UI: Add button visible').toBeVisible();
      await expect.soft(headerUI.cartBadge, `🟧 UI: Cart Badge removed`).not.toBeVisible();
      await expect(page, `🟧 Data: Local storage is empty`).toHaveStorageLength(STORAGE_KEYS.cart, 0);
    });

    test(`${SCOPE}: State persistence from inventory`, async ({ page }) => {
      const { pdpUI, headerUI } = catalogLocators(page);

      const setup = {
        productIndexes: [0, 1, 2],
        get lastProduct() {
          return this.productIndexes.slice(-1)[0];
        },
      };

      await test.step('⬜ Add products to cart on inventory', async () => {
        for (const productIndex of setup.productIndexes) {
          await catalog.addProductToCart(page, { from: 'inventory', index: productIndex });
        }
      });

      await test.step('🟦 Navigate to PDP', async () => {
        await catalog.openProductDetails(page, { index: setup.lastProduct, via: 'img' });
      });

      await expect.soft(pdpUI.productCard.removeButton, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(headerUI.cartBadge, `🟧 UI: Cart Badge shows 3 items`).toHaveText('3');
      await expect(page, `🟧 Data: Local storage has 3 items`).toHaveStorageLength(STORAGE_KEYS.cart, 3);
    });

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page }) => {
        const { pdpUI } = catalogLocators(page);

        const setup = {
          firstProduct: 0,
        };

        await test.step('⬜ Navigate to PDP', async () => {
          await catalog.openProductDetails(page, { index: setup.firstProduct, via: 'name' });
        });

        await test.step('⬜ Standardize PDP data', async () => {
          await catalog.standardizeProductText(page, { from: 'pdp' });
        });

        await expect(page, '🟧 UI: PDP layout visual check').toHaveScreenshot(
          `${toSnapshotName(persona.role)}-product.png`,
          { mask: [pdpUI.productCard.image], fullPage: true }
        );
      });
    }
  });
}
