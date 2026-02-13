import { test, expect, t, toSnapshotName } from '@utils';
import { catalog, catalogLoc } from '@helpers';
import { VALID_USERS, STORAGE_KEYS } from '@data';

const SCOPE = 'Inventory';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory page', async () => {
    await page.goto('/inventory.html');
  });
});

// TODO: add to readme, that the goal is to test the app regarless of current data

for (const persona of VALID_USERS) {
  test.describe(`${persona.role}`, () => {
    test.use({ storageState: persona.storageState });

    // TODO
    const SORT_KEYS = ['nameAZ'] as const;
    // ['nameAZ', 'nameZA', 'priceLowHigh', 'priceHighLow'] as const;
    // use the key like this or with the label (t()) and flags (by: string | number, order: ascending | desending)

    SORT_KEYS.forEach((sortKey) => {
      const sortLabel = t(`product.sort.${sortKey}`);

      test(`${SCOPE}: Items follow ${sortLabel} order`, async ({ page }) => {
        const { inventoryUI } = catalogLoc(page);

        const setup = {
          productCards: inventoryUI.productCards,
        };

        await test.step('🟦 Sort products', async () => {
          await inventoryUI.productSortDropdown.selectOption(sortLabel);
          await page.waitForLoadState();
        });

        await expect.soft(setup.productCards, '🟧 UI: good order').toBeSortedBy('name', 'asc');
      });
    });
    // END

    test(`${SCOPE}: Add/Remove button toggles cart state`, async ({ page }) => {
      const { inventoryUI, productUI } = catalogLoc(page);

      const setup = {
        productIndexes: [0, 1, 2],
        get firstProduct() {
          return this.productIndexes[0];
        },
        get firstProductLoc() {
          return inventoryUI.productCards.nth(this.firstProduct);
        },
      };

      await test.step('🟦 Add products to cart', async () => {
        for (const productIndex of setup.productIndexes) {
          await catalog.addProductToCart(page, { from: 'inventory', index: productIndex });
        }
      });

      await expect.soft(productUI.removeButton(setup.firstProductLoc), '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(inventoryUI.cartBadge, '🟧 UI: Badge shows 3').toHaveText('3');
      await expect.soft(page, '🟧 Data: Local storage has 3 items').toHaveStorageLength(STORAGE_KEYS.cart, 3);

      await test.step('🟦 Remove product from cart', async () => {
        await catalog.removeProductFromCart(page, { from: 'inventory', index: setup.firstProduct });
      });

      await expect.soft(productUI.addToCartButton(setup.firstProductLoc), '🟧 UI: Add button visible').toBeVisible();
      await expect.soft(inventoryUI.cartBadge, '🟧 UI: Badge shows 2').toHaveText('2');
      await expect.soft(page, '🟧 Data: Local storage has 2 items').toHaveStorageLength(STORAGE_KEYS.cart, 2);
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
