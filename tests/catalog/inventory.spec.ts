import { test, expect, toSnapshotName } from '@utils';
import { catalog, catalogLocators } from '@helpers';
import { VALID_USERS, STATE_KEYS } from '@data';
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

    const CATALOG_CONTEXT = {
      firstProduct: 0,
      productIndexes: [0, 1, 2],
      gridSize: 5,
    } as const;

    const { firstProduct, productIndexes, gridSize } = CATALOG_CONTEXT;

    const SORT_CASES = [
      {
        sortLabel: t.catalog.sort.nameAZ,
        locatorKey: 'allProductNames',
        sortBy: { content: 'name', order: 'asc' },
      },
      {
        sortLabel: t.catalog.sort.priceHighLow,
        locatorKey: 'allProductPrices',
        sortBy: { content: 'price', order: 'desc' },
      },
    ] as const;

    for (const { sortLabel, locatorKey, sortBy } of SORT_CASES) {
      test(`${SCOPE}: Items follow ${sortLabel} order`, async ({ page }) => {
        const { inventoryUI } = catalogLocators(page);

        await test.step('🟦 Sort products', async () => {
          await inventoryUI.sortDropdown.selectOption(sortLabel);
        });

        await expect(inventoryUI[locatorKey], `🟧 UI: Sorted by ${sortLabel}`).toBeSortedBy(sortBy);
      });
    }

    test(`${SCOPE}: Add/Remove button toggles cart state`, async ({ page }) => {
      const { inventoryUI, headerUI } = catalogLocators(page);

      await test.step('🟦 Add products to cart', async () => {
        for (const productIndex of productIndexes) {
          await catalog.addProductToCart(page, { from: 'inventory', index: productIndex });
        }
      });

      await expect.soft(inventoryUI.productCard(firstProduct).removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(headerUI.cartBadge, '🟧 UI: Badge shows 3').toHaveText('3');
      await expect(page, '🟧 Data: Local storage has 3 items').toHaveStorageLength(STATE_KEYS.cart, 3);

      await test.step('🟦 Remove product from cart', async () => {
        await catalog.removeProductFromCart(page, { from: 'inventory', index: firstProduct });
      });

      await expect.soft(inventoryUI.productCard(firstProduct).addToCartBtn, '🟧 UI: Add button visible').toBeVisible();
      await expect.soft(headerUI.cartBadge, '🟧 UI: Badge shows 2').toHaveText('2');
      await expect(page, '🟧 Data: Local storage has 2 items').toHaveStorageLength(STATE_KEYS.cart, 2);
    });

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page }) => {
        const { inventoryUI } = catalogLocators(page);

        const inventoryImages = await test.step('⬜ Standardize grid data', async () => {
          await catalog.standardizeInventoryGridText(page, { gridSize: gridSize });
          return await inventoryUI.allProductCardImgs.all();
        });

        await expect(page, '🟧 UI: Inventory layout visual check').toHaveScreenshot(
          `${toSnapshotName(persona.role)}-inventory.png`,
          { mask: inventoryImages, fullPage: true }
        );
      });
    }
  });
}
