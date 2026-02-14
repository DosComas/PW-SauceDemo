import { test, expect, toSnapshotName } from '@utils';
import { catalog, catalogLocators } from '@helpers';
import { VALID_USERS, STORAGE_KEYS } from '@data';
import { t } from '@i18n';

const SCOPE = 'Inventory';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory page', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of VALID_USERS) {
  test.describe(`${persona.role}`, () => {
    test.use({ storageState: persona.storageState });

    const SORT_CASES = [
      { sortLabel: t.catalog.sort.nameAZ, attribute: 'name', order: 'asc' },
      { sortLabel: t.catalog.sort.priceHighLow, attribute: 'price', order: 'desc' },
    ] as const;

    for (const { sortLabel, attribute, order } of SORT_CASES) {
      test(`${SCOPE}: Items follow ${sortLabel} order`, async ({ page }) => {
        const { inventoryUI } = catalogLocators(page);

        await test.step('🟦 Sort products', async () => {
          await inventoryUI.sortDropdown.selectOption(sortLabel);
        });

        await expect(inventoryUI.allProductCards, `🟧 UI: Sorted by ${sortLabel}`).toBeSortedBy(attribute, order);
      });
    }

    test(`${SCOPE}: Add/Remove button toggles cart state`, async ({ page }) => {
      const { inventoryUI, headerUI } = catalogLocators(page);

      const setup = {
        productIndexes: [0, 1, 2],
        get firstProduct() {
          return this.productIndexes[0];
        },
        get firstProductLoc() {
          return inventoryUI.allProductCards.nth(this.firstProduct);
        },
      };

      await test.step('🟦 Add products to cart', async () => {
        for (const productIndex of setup.productIndexes) {
          await catalog.addProductToCart(page, { from: 'inventory', index: productIndex });
        }
      });

      await expect
        .soft(inventoryUI.productCard(setup.firstProduct).removeButton, '🟧 UI: Remove button visible')
        .toBeVisible();
      await expect.soft(headerUI.cartBadge, '🟧 UI: Badge shows 3').toHaveText('3');
      await expect(page, '🟧 Data: Local storage has 3 items').toHaveStorageLength(STORAGE_KEYS.cart, 3);

      await test.step('🟦 Remove product from cart', async () => {
        await catalog.removeProductFromCart(page, { from: 'inventory', index: setup.firstProduct });
      });

      await expect
        .soft(inventoryUI.productCard(setup.firstProduct).addToCartButton, '🟧 UI: Add button visible')
        .toBeVisible();
      await expect.soft(headerUI.cartBadge, '🟧 UI: Badge shows 2').toHaveText('2');
      await expect(page, '🟧 Data: Local storage has 2 items').toHaveStorageLength(STORAGE_KEYS.cart, 2);
    });

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page }) => {
        const { inventoryUI } = catalogLocators(page);

        const setup = {
          gridSize: 5,
        };

        const inventoryImages = await test.step('⬜ Standardize grid data', async () => {
          await catalog.standardizeInventoryGridText(page, { gridSize: setup.gridSize });
          return await inventoryUI.allProductCardImages.all();
        });

        await expect(page, '🟧 UI: Inventory layout visual check').toHaveScreenshot(
          `${toSnapshotName(persona.role)}-inventory.png`,
          { mask: inventoryImages, fullPage: true }
        );
      });
    }
  });
}
