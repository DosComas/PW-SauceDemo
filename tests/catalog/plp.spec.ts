import { test, expect } from '@fixtures';
import { toSnapshotName } from '@utils';
import { t, VALID_USERS, STATE_KEYS, SortLabels } from '@data';

type SortCase = {
  sortLabel: SortLabels;
  locatorKey: 'names' | 'prices';
  sortBy: {
    content: 'name' | 'price';
    order: 'asc' | 'desc';
  };
};

const SCOPE = 'PLP';

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

    const SORT_CASES: SortCase[] = [
      {
        sortLabel: t.catalog.sort.nameAZ,
        locatorKey: 'names',
        sortBy: { content: 'name', order: 'asc' },
      },
      {
        sortLabel: t.catalog.sort.priceHighLow,
        locatorKey: 'prices',
        sortBy: { content: 'price', order: 'desc' },
      },
    ];

    SORT_CASES.forEach(({ sortLabel, locatorKey, sortBy }) => {
      test(`${SCOPE}: Items follow ${sortLabel} order`, async ({ loc, action }) => {
        await test.step('🟦 Sort products', async () => {
          await action.plp.sort({ sortLabel });
        });

        await expect(loc.plp[locatorKey], `🟧 UI: Sorted by ${sortLabel}`).toBeSortedBy(sortBy);
      });
    });

    test(`${SCOPE}: Add/Remove button toggles cart state`, async ({ page, loc, action }) => {
      await test.step('🟦 Add products to cart', async () => {
        for (const productIndex of productIndexes) {
          await action.plp.add({ index: productIndex });
        }
      });

      await expect.soft(loc.plp.card(firstProduct).removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(loc.header.cartBadge, '🟧 UI: Badge shows 3').toHaveText('3');
      await expect(page, '🟧 Data: Local storage has 3 items').toHaveStorageLength(STATE_KEYS.cart, 3);

      await test.step('🟦 Remove product from cart', async () => {
        await action.plp.remove({ index: firstProduct });
      });

      await expect.soft(loc.plp.card(firstProduct).addBtn, '🟧 UI: Add button visible').toBeVisible();
      await expect.soft(loc.header.cartBadge, '🟧 UI: Badge shows 2').toHaveText('2');
      await expect(page, '🟧 Data: Local storage has 2 items').toHaveStorageLength(STATE_KEYS.cart, 2);
    });

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page, loc, action }) => {
        const imgs = await test.step('⬜ Standardize grid data', async () => {
          await action.plp.populateGrid({ size: gridSize });
          return await loc.plp.imgs.all();
        });

        await expect(page, '🟧 UI: Inventory layout visual check').toHaveScreenshot(
          `${toSnapshotName(persona.role)}-inventory.png`,
          { mask: imgs, fullPage: true }
        );
      });
    }
  });
}
