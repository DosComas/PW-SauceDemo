import { type Locator } from '@playwright/test';
import { test, expect } from '@fixtures';
import { type ExpectedSort, createRandom } from '@utils';
import { type SortOption, t, ACCESS_USERS } from '@data';
import { type SortableFields } from '@helpers';

const SCOPE = 'PLP';

const random = createRandom();
const itemIndexes = random.basket(3);
const itemIndex = random.target(itemIndexes);

const SORT_CASES: { option: SortOption; field: (items: SortableFields) => Locator; expected: ExpectedSort }[] = [
  { option: t.plp.sort.az, field: (loc) => loc.plp.items.names, expected: { by: 'name', order: 'asc' } },
  { option: t.plp.sort.hiLo, field: (loc) => loc.plp.items.prices, expected: { by: 'price', order: 'desc' } },
];

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of ACCESS_USERS) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test.use({ storageState: persona.storageState });

    SORT_CASES.forEach(({ option, field, expected }) => {
      test(`${SCOPE}: Items follow ${option} order`, async ({ loc, action }) => {
        await test.step('🟦 Sort items', async () => {
          await action.plp.sort({ label: option });
        });

        await expect(field(loc), `🟧 UI: Sorted by ${option}`).toBeSortedBy(expected.by, expected.order);
      });
    });

    test(`${SCOPE}: Add/Remove button toggles cart state`, async ({ page, loc, action, session }) => {
      await test.step('🟦 Add items to cart', async () => {
        await action.plp.add({ index: itemIndexes });
      });

      await expect.soft(loc.plp.item(itemIndex).removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(loc.header.cart.badge, '🟧 UI: Badge shows 3').toHaveText('3');
      await test.step('🟧 Data: Local storage has 3 items', async () => {
        expect(await session.cartItems()).toHaveLength(3);
      });

      await test.step('🟦 Remove item from cart', async () => {
        await action.plp.remove({ index: itemIndex });
      });

      await expect.soft(loc.plp.item(itemIndex).addBtn, '🟧 UI: Add button visible').toBeVisible();
      await expect.soft(loc.header.cart.badge, '🟧 UI: Badge shows 2').toHaveText('2');
      await test.step('🟧 Data: Local storage has 2 items', async () => {
        expect(await session.cartItems()).toHaveLength(2);
      });
    });

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page, loc, action }) => {
        const imgs = await test.step('⬜ Mock grid', async () => {
          await action.plp.mockGrid();
          return await loc.plp.items.imgs.all();
        });

        await expect(page, '🟧 UI: PLP layout visual check').toHaveScreenshot({ mask: imgs, fullPage: true });
      });
    }
  });
}
