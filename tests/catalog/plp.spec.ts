import { type Locator } from '@playwright/test';
import { test, expect } from '@fixtures';
import { type SortByField, type SortOrder } from '@utils';
import { type SortLabels, t, ACCESS_USERS, STATE_KEYS } from '@data';
import { type ItemSortAttribute } from '@helpers';

type SortCase = {
  sortBy: SortLabels;
  attribute: (items: ItemSortAttribute) => Locator;
  expected: { by: SortByField; order: SortOrder };
};

const SCOPE = 'PLP';

const PLP_CONTEXT = { firstItem: 0, itemIndexes: [0, 1, 2], gridSize: 5 } as const;
const { firstItem, itemIndexes, gridSize } = PLP_CONTEXT;

const SORT_CASES: SortCase[] = [
  { sortBy: t.plp.sort.az, attribute: (items) => items.names, expected: { by: 'name', order: 'asc' } },
  { sortBy: t.plp.sort.hiLo, attribute: (items) => items.prices, expected: { by: 'price', order: 'desc' } },
];

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory page', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of ACCESS_USERS) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test.use({ storageState: persona.storageState });

    SORT_CASES.forEach(({ sortBy, attribute, expected }) => {
      test(`${SCOPE}: Items follow ${sortBy} order`, async ({ loc, action }) => {
        await test.step('🟦 Sort items', async () => {
          await action.plp.sort({ label: sortBy });
        });

        await expect(attribute(loc.plp.items), `🟧 UI: Sorted by ${sortBy}`).toBeSortedBy(expected.by, expected.order);
      });
    });

    test(`${SCOPE}: Add/Remove button toggles cart state`, async ({ page, loc, action }) => {
      await test.step('🟦 Add items to cart', async () => {
        for (const productIndex of itemIndexes) {
          await action.plp.add({ index: productIndex });
        }
      });

      await expect.soft(loc.plp.item(firstItem).removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(loc.header.cartBadge, '🟧 UI: Badge shows 3').toHaveText('3');
      await expect(page, '🟧 Data: Local storage has 3 items').toHaveStorageLength(STATE_KEYS.cart, 3);

      await test.step('🟦 Remove item from cart', async () => {
        await action.plp.remove({ index: firstItem });
      });

      await expect.soft(loc.plp.item(firstItem).addBtn, '🟧 UI: Add button visible').toBeVisible();
      await expect.soft(loc.header.cartBadge, '🟧 UI: Badge shows 2').toHaveText('2');
      await expect(page, '🟧 Data: Local storage has 2 items').toHaveStorageLength(STATE_KEYS.cart, 2);
    });

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page, loc, action }) => {
        const imgs = await test.step('⬜ Mock grid', async () => {
          await action.plp.mockGrid({ size: gridSize });
          return await loc.plp.items.imgs.all();
        });

        await expect(page, '🟧 UI: PLP layout visual check').toHaveScreenshot({ mask: imgs, fullPage: true });
      });
    }
  });
}
