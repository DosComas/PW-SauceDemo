import { test, expect, toSnapshotName } from '@utils';
import { catalog, catalogLocators } from '@helpers';
import { VALID_USERS, STATE_KEYS } from '@data';

const SCOPE = 'PDP';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory page', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of VALID_USERS) {
  test.describe(`${persona.role}`, () => {
    test.use({ storageState: persona.storageState });

    const CATALOG_CONTEXT = {
      firstProduct: 0,
      productIndexes: [0, 1, 2],
      get lastProduct() {
        return this.productIndexes[this.productIndexes.length - 1];
      },
    } as const;

    const { firstProduct, productIndexes, lastProduct } = CATALOG_CONTEXT;

    test(`${SCOPE}: Content matches inventory data`, async ({ page }) => {
      const { pdpUI } = catalogLocators(page);

      const expectedProduct = await test.step('⬜ Scrape product data', async () => {
        return await catalog.scrapeCatalogProduct(page, { from: 'inventory', index: firstProduct });
      });

      await test.step('🟦 Navigate to PDP', async () => {
        await catalog.openProductDetails(page, { index: firstProduct, via: 'name' });
      });

      await expect.soft(pdpUI.productCard.name, '🟧 UI: Product name matches').toHaveText(expectedProduct.name);
      await expect.soft(pdpUI.productCard.desc, '🟧 UI: Product description matches').toHaveText(expectedProduct.desc);
      await expect.soft(pdpUI.productCard.price, '🟧 UI: Product price matches').toHaveText(expectedProduct.price);
      await expect
        .soft(pdpUI.productCard.img, '🟧 UI: Product image source matches')
        .toHaveAttribute('src', expectedProduct.img);
    });

    test(`${SCOPE}: Add/Remove button toggles cart state`, async ({ page }) => {
      const { pdpUI, headerUI } = catalogLocators(page);

      await test.step('🟦 Navigate to PDP and add product', async () => {
        await catalog.openProductDetails(page, { index: firstProduct, via: 'img' });
        await catalog.addProductToCart(page, { from: 'pdp' });
      });

      await expect.soft(pdpUI.productCard.removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(headerUI.cartBadge, `🟧 UI: Cart Badge shows 1 item`).toHaveText('1');
      await expect(page, `🟧 Data: Local storage has 1 item`).toHaveStorageLength(STATE_KEYS.cart, 1);

      await test.step('🟦 Remove product from cart', async () => {
        await catalog.removeProductFromCart(page, { from: 'pdp' });
      });

      await expect.soft(pdpUI.productCard.addToCartBtn, '🟧 UI: Add button visible').toBeVisible();
      await expect.soft(headerUI.cartBadge, `🟧 UI: Cart Badge removed`).not.toBeVisible();
      await expect(page, `🟧 Data: Local storage is empty`).toHaveStorageLength(STATE_KEYS.cart, 0);
    });

    test(`${SCOPE}: State persistence on PDP entry`, async ({ page }) => {
      const { pdpUI, headerUI } = catalogLocators(page);

      await test.step('⬜ Add products to cart on inventory', async () => {
        for (const productIndex of productIndexes) {
          await catalog.addProductToCart(page, { from: 'inventory', index: productIndex });
        }
      });

      await test.step('🟦 Navigate to PDP', async () => {
        await catalog.openProductDetails(page, { index: lastProduct, via: 'img' });
      });

      await expect.soft(pdpUI.productCard.removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(headerUI.cartBadge, `🟧 UI: Cart Badge shows 3 items`).toHaveText('3');
      await expect(page, `🟧 Data: Local storage has 3 items`).toHaveStorageLength(STATE_KEYS.cart, 3);
    });

    test(`${SCOPE}: State persistence on Inventory return`, async ({ page }) => {
      const { inventoryUI, pdpUI, headerUI } = catalogLocators(page);

      await test.step('⬜ Navigate to PDP', async () => {
        await catalog.openProductDetails(page, { index: firstProduct, via: 'name' });
      });

      await test.step('🟦 Add item and return to inventory', async () => {
        await catalog.addProductToCart(page, { from: 'pdp' });
        await pdpUI.backToProductsBtn.click();
      });

      await expect.soft(inventoryUI.productCard(firstProduct).removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(headerUI.cartBadge, `🟧 UI: Cart Badge shows 1 item`).toHaveText('1');
      await expect(page, `🟧 Data: Local storage has 1 item`).toHaveStorageLength(STATE_KEYS.cart, 1);
    });

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page }) => {
        const { pdpUI } = catalogLocators(page);

        await test.step('⬜ Navigate to PDP and standardize data', async () => {
          await catalog.openProductDetails(page, { index: firstProduct, via: 'name' });
          await catalog.standardizeProductText(page, { from: 'pdp' });
        });

        await expect(page, '🟧 UI: PDP layout visual check').toHaveScreenshot(
          `${toSnapshotName(persona.role)}-product.png`,
          { mask: [pdpUI.productCard.img], fullPage: true }
        );
      });
    }
  });
}
