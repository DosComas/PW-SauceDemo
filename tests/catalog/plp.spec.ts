import { type Locator } from '@playwright/test';
import { test, expect } from '@fixtures';
import type { SortOption, SortableLocators, SortCriteria } from '@data';
import { t, AUTHENTICATED } from '@data';
import { createRandom } from '@utils';

type SortScenario = { option: SortOption; getLoc: (items: SortableLocators) => Locator; expected: SortCriteria };

const SCOPE = 'PLP';

const random = createRandom();
const itemIndexes = random.basket(3);
const itemIndex = random.target(itemIndexes);

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of AUTHENTICATED) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test.use({ storageState: persona.storageState });

    (
      [
        { option: t.plp.sort.az, getLoc: (it) => it.names, expected: { by: 'name', order: 'asc' } },
        { option: t.plp.sort.hiLo, getLoc: (it) => it.prices, expected: { by: 'price', order: 'desc' } },
      ] as const satisfies SortScenario[]
    ).forEach(({ option, getLoc, expected }) => {
      test(`${SCOPE}: Items follow ${option} order`, async ({ loc, action }) => {
        await test.step('🟦 Sort items', async () => {
          await action.plp.sort({ label: option });
        });

        await expect(getLoc(loc.plp.items), `🟧 UI: Sorted by ${option}`).toBeSortedBy(expected.by, expected.order);
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

    if (persona.isBaseline) {
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
