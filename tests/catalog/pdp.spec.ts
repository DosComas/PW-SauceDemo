import { test, expect } from '@fixtures';
import { AUTHENTICATED } from '@data';
import { createRandom } from '@utils';

const random = createRandom();
const itemIndexes = random.basket(3);
const itemIndex = random.target(itemIndexes);

test.describe('PDP', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('⬜ Go to inventory', async () => {
      await page.goto('/inventory.html');
    });
  });

  for (const persona of AUTHENTICATED) {
    test.describe(`${persona.role}`, { tag: persona.tag }, () => {
      test.use({ storageState: persona.storageState });

      test('Content matches PLP data', async ({ act, query }) => {
        const expected = await test.step('⬜ Scrape PLP Item data', async () => {
          return await query.plp.readItems({ index: itemIndex });
        });

        await test.step('🟦 Navigate to PDP', async () => {
          await act.plp.openItem({ index: itemIndex, via: 'name' });
        });

        await test.step('🟧 UI: PDP item match PLP source', async () => {
          expect(await query.pdp.readItem()).toMatchObject(expected);
        });
      });

      test('Add/Remove button toggles cart state', async ({ loc, act, query }) => {
        await test.step('🟦 Navigate to PDP and add item', async () => {
          await act.plp.openItem({ index: itemIndex, via: 'img' });
          await act.pdp.addToCart();
        });

        await expect.soft(loc.pdp.item.removeBtn, '🟧 UI: Remove button visible').toBeVisible();
        await expect.soft(loc.header.cart.badge, '🟧 UI: Cart Badge shows 1 item').toHaveText('1');
        await test.step('🟧 Data: Local storage has 1 item', async () => {
          expect(await query.session.readCart()).toHaveLength(1);
        });

        await test.step('🟦 Remove item from cart', async () => {
          await act.pdp.removeFromCart();
        });

        await expect.soft(loc.pdp.item.addBtn, '🟧 UI: Add button visible').toBeVisible();
        await expect.soft(loc.header.cart.badge, '🟧 UI: Cart Badge removed').not.toBeVisible();
        await test.step('🟧 Data: Local storage is empty', async () => {
          expect(await query.session.readCart()).toHaveLength(0);
        });
      });

      test('State persistence on PDP entry', async ({ loc, act, query }) => {
        await test.step('⬜ Add items to cart on PLP', async () => {
          await act.plp.addToCart({ index: itemIndexes });
        });

        await test.step('🟦 Navigate to PDP', async () => {
          await act.plp.openItem({ index: itemIndex, via: 'img' });
        });

        await expect.soft(loc.pdp.item.removeBtn, '🟧 UI: Remove button visible').toBeVisible();
        await expect.soft(loc.header.cart.badge, '🟧 UI: Cart Badge shows 3 items').toHaveText('3');
        await test.step('🟧 Data: Local storage has 3 items`', async () => {
          expect(await query.session.readCart()).toHaveLength(3);
        });
      });

      test('State persistence on PDP return', async ({ loc, act, query }) => {
        await test.step('⬜ Navigate to PLP', async () => {
          await act.plp.openItem({ index: itemIndex, via: 'name' });
        });

        await test.step('🟦 Add item and return to PDP', async () => {
          await act.pdp.addToCart();
          await act.pdp.goBack();
        });

        await expect.soft(loc.plp.item(itemIndex).removeBtn, '🟧 UI: Remove button visible').toBeVisible();
        await expect.soft(loc.header.cart.badge, '🟧 UI: Cart Badge shows 1 item').toHaveText('1');
        await test.step('🟧 Data: Local storage has 1 item', async () => {
          expect(await query.session.readCart()).toHaveLength(1);
        });
      });

      if (persona.isBaseline) {
        test('Visual layout', { tag: '@visual' }, async ({ page, loc, act }) => {
          await test.step('⬜ Navigate to PDP', async () => {
            await act.plp.openItem({ index: itemIndex, via: 'name' });
          });

          const img = await test.step('⬜ Mock grid', async () => {
            await act.pdp.mockItem();
            return loc.pdp.item.img;
          });

          await expect(page, '🟧 UI: Layout visual check').toHaveScreenshot({ mask: [img], fullPage: true });
        });
      }
    });
  }
});
