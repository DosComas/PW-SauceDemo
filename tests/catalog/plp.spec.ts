import { test, expect } from '@fixtures';
import type { SortOption, SortableLocators, SortCriteria } from '@data';
import { AUTHENTICATED } from '@data';
import { createRandom } from '@utils';

type SortScenario = { label: string; sortBy: SortOption; by: keyof SortableLocators; order: SortCriteria['order'] };

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
        { label: 'name descending', sortBy: 'za', by: 'names', order: 'desc' },
        { label: 'price ascending', sortBy: 'loHi', by: 'prices', order: 'asc' },
      ] as const satisfies SortScenario[]
    ).forEach(({ label, sortBy, by, order }) => {
      test(`${label} sorting`, async ({ loc, act }) => {
        await test.step('🟦 Sort items', async () => {
          await act.plp.sortGrid({ sortBy });
        });

        await expect(loc.plp.items[by], `🟧 UI: Sorted by ${sortBy}`).toBeSortedBy(by, order);
      });
    });

    test('add/remove item logic', async ({ loc, act, query }) => {
      let itemCount: number = 0;

      await test.step('🟦 Add items to cart', async () => {
        await act.plp.addToCart({ indexes: itemIndexes });
        itemCount += itemIndexes.length;
      });

      await expect.soft(loc.plp.item(itemIndex).removeBtn, '🟧 UI: Remove button visible').toBeVisible();

      await expect.soft(loc.header.cart.badge, `🟧 UI: Cart Badge shows ${itemCount}`).toHaveText(String(itemCount));

      await test.step(`🟧 Data: Local storage has ${itemCount} items`, async () => {
        expect(await query.session.readCart(), 'Local storage match').toHaveLength(itemCount);
      });

      await test.step('🟦 Remove item from cart', async () => {
        await act.plp.removeFromCart({ indexes: [itemIndex] });
        itemCount -= 1;
      });

      await expect.soft(loc.plp.item(itemIndex).addBtn, '🟧 UI: Add button visible').toBeVisible();

      await expect.soft(loc.header.cart.badge, `🟧 UI: Cart Badge shows ${itemCount}`).toHaveText(String(itemCount));

      await test.step(`🟧 Data: Local storage has ${itemCount} items`, async () => {
        expect(await query.session.readCart(), 'Local storage match').toHaveLength(itemCount);
      });
    });

    if (persona.isBaseline) {
      test('visual: item list', { tag: '@visual' }, async ({ page, loc, act }) => {
        const imgs = await test.step('⬜ Mock grid', async () => {
          await act.plp.mockGrid();
          return await loc.plp.items.imgs.all();
        });

        await expect(page, '🟧 UI: Layout visual check').toHaveScreenshot('plp-page.png', {
          mask: imgs,
          fullPage: true,
        });
      });
    }
  });
}
