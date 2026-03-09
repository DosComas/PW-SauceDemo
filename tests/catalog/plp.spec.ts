import { test, expect } from '@fixtures';
import type { SortOption, SortableLocators, SortCriteria } from '@data';
import { AUTHENTICATED } from '@data';
import { createRandom } from '@utils';

type SortScenario = { sortBy: SortOption; by: keyof SortableLocators; order: SortCriteria['order'] };

const random = createRandom();
const itemIndexes = random.basket(3);
const itemIndex = random.target(itemIndexes);

test.describe('PLP', () => {
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
          { sortBy: 'az', by: 'names', order: 'asc' },
          { sortBy: 'hiLo', by: 'prices', order: 'desc' },
        ] as const satisfies SortScenario[]
      ).forEach(({ sortBy, by, order }) => {
        test(`Items follow ${sortBy} order`, async ({ loc, act }) => {
          await test.step('🟦 Sort items', async () => {
            await act.plp.sortGrid({ sortBy });
          });

          await expect(loc.plp.items[by], `🟧 UI: Sorted by ${sortBy}`).toBeSortedBy(by, order);
        });
      });

      test('Add/Remove button toggles cart state', async ({ loc, act, query }) => {
        await test.step('🟦 Add items to cart', async () => {
          await act.plp.addToCart({ indexes: itemIndexes });
        });

        await expect.soft(loc.plp.item(itemIndex).removeBtn, '🟧 UI: Remove button visible').toBeVisible();

        await expect.soft(loc.header.cart.badge, '🟧 UI: Badge shows 3').toHaveText('3');

        await test.step('🟧 Data: Local storage has 3 items', async () => {
          expect(await query.session.readCart(), 'Local storage match').toHaveLength(3);
        });

        await test.step('🟦 Remove item from cart', async () => {
          await act.plp.removeFromCart({ indexes: [itemIndex] });
        });

        await expect.soft(loc.plp.item(itemIndex).addBtn, '🟧 UI: Add button visible').toBeVisible();

        await expect.soft(loc.header.cart.badge, '🟧 UI: Badge shows 2').toHaveText('2');

        await test.step('🟧 Data: Local storage has 2 items', async () => {
          expect(await query.session.readCart(), 'Local storage match').toHaveLength(2);
        });
      });

      if (persona.isBaseline) {
        test('Visual layout', { tag: '@visual' }, async ({ page, loc, act }) => {
          const imgs = await test.step('⬜ Mock grid', async () => {
            await act.plp.mockGrid();
            return await loc.plp.items.imgs.all();
          });

          await expect(page, '🟧 UI: Layout visual check').toHaveScreenshot({ mask: imgs, fullPage: true });
        });
      }
    });
  }
});
