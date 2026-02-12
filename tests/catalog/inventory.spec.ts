import { test, expect, t, toSnapshotName } from '@utils';
import { catalog, catalogLoc } from '@helpers';
import { VALID_USERS, STORAGE_KEYS } from '@data';

const SCOPE = 'Inventory';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory page', async () => {
    await page.goto('/inventory.html');
  });
});

// TEST CASES:
// sorting - TODO
// cart badge (Add/Remove button toggles cart state)- X
// visual (Visual layout)- X

for (const persona of VALID_USERS) {
  test.describe(`${persona.role}`, () => {
    test.use({ storageState: persona.storageState });

    // TODO
    const CASES = [
      { title: 'low to high price', sortBy: 'priceLowHigh' },
      { title: 'high to low price', sortBy: 'priceHighLow' },
      { title: 'name A to Z', sortBy: 'nameAZ' },
      { title: 'name Z to A', sortBy: 'nameZA' },
    ] as const; // cut on the numbe of cases, 1 for text other for price?

    CASES.forEach(({ title, sortBy }) => {
      test(`${SCOPE}: Verify sorting by ${title}`, async ({ page }) => {
        const { inventoryUI } = catalogLoc(page);

        await test.step('🟦 Sort products', async () => {
          await inventoryUI.productSortDropdown.selectOption(t(`product.sort.${sortBy}`));
        });

        // how to accert? get list of all prices / titles and compare
      });
    });
    // END

    test(`${SCOPE}: Add/Remove button toggles cart state`, async ({ page }) => {
      const { inventoryUI, productUI } = catalogLoc(page);

      const setup = {
        productIndices: [0, 1, 2],
        get firstProduct() {
          return this.productIndices[0];
        },
        get firstProductLoc() {
          return inventoryUI.productCards.nth(this.firstProduct);
        },
      };

      await test.step('🟦 Add products to cart', async () => {
        for (const productIndex of setup.productIndices) {
          await catalog.addProductToCart(page, { from: 'inventory', index: productIndex });
        }
      });

      await expect.soft(productUI.removeButton(setup.firstProductLoc), '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(inventoryUI.cartBadge, '🟧 UI: Badge shows 3').toHaveText('3');
      await expect.soft({ page, key: STORAGE_KEYS.cart }, '🟧 Data: Local storage has 3 items').toHaveStorageLength(3);

      await test.step('🟦 Remove product from cart', async () => {
        await catalog.removeProductFromCart(page, { from: 'inventory', index: setup.firstProduct });
      });

      await expect.soft(productUI.addToCartButton(setup.firstProductLoc), '🟧 UI: Add button visible').toBeVisible();
      await expect.soft(inventoryUI.cartBadge, '🟧 UI: Badge shows 2').toHaveText('2');
      await expect.soft({ page, key: STORAGE_KEYS.cart }, '🟧 Data: Local storage has 2 items').toHaveStorageLength(2);
    });

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page }) => {
        const { inventoryUI } = catalogLoc(page);

        const setup = {
          productCount: 5,
        };

        const inventoryImgs = await test.step('⬜ Standardize grid data', async () => {
          await catalog.standardizeInventoryGrid(page, { products: setup.productCount });
          return await inventoryUI.inventoryImg.all();
        });

        await expect(page, '🟧 UI: Inventory layout visual check').toHaveScreenshot(
          `${toSnapshotName(persona.role)}-inventory.png`,
          { mask: inventoryImgs, fullPage: true }
        );
      });
    }
  });
}
