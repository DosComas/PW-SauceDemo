import { test, expect } from '@fixtures';
import { AUTHENTICATED } from '@data';
import { createRandom } from '@utils';

const random = createRandom();
const itemIndexes = random.basket(3);
const itemIndex = random.target(itemIndexes);

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('⬜ Go to inventory', async () => {
      await page.goto('/inventory.html');
    });
  });

  for (const persona of AUTHENTICATED) {
    test.describe(`${persona.role}`, { tag: persona.tag }, () => {
      test.use({ storageState: persona.storageState });

      test('Items match PLP data', async ({ loc, act, query }) => {
        const expected = await test.step('⬜ Scrape PLP items data', async () => {
          return await query.plp.readItems({ index: itemIndexes, imgSrc: false });
        });

        await test.step('🟦 Add items and navigate to cart', async () => {
          await act.plp.addToCart({ index: itemIndexes });
          await act.cart.openCart();
        });

        await expect.soft(loc.cart.items.cards, '🟧 UI: Cart count matches selection').toHaveCount(expected.length);
        await test.step('🟧 UI: Cart items match PLP source', async () => {
          expect(await query.cart.items()).toMatchObject(expected);
        });
      });

      test('Cart links to PDP', async ({ loc, act, query }) => {
        await test.step('⬜ Add items and navigate to cart', async () => {
          await act.plp.addToCart({ index: itemIndexes });
          await act.cart.openCart();
        });

        const expected = await test.step('⬜ Scrape Cart item data', async () => {
          return await query.cart.items({ index: 1 });
        });

        await test.step('🟦 Navigate from Cart to PDP', async () => {
          await act.cart.openItem({ index: 1 });
        });

        await expect.soft(loc.pdp.item.removeBtn, '🟧 UI: Remove button visible').toBeVisible();
        await test.step('🟧 UI: PDP item match Cart source', async () => {
          expect(await query.pdp.readItem()).toMatchObject(expected);
        });
      });

      test('State persistence on Cart return', async ({ loc, act, query }) => {
        await test.step('⬜ Add item to cart from PDP', async () => {
          await act.plp.openItem({ index: itemIndex, via: 'img' });
          await act.pdp.addToCart();
          await act.cart.openCart();
        });

        await test.step('⬜ Remove item from Cart and continue shopping', async () => {
          await act.cart.removeFromCart({ index: 0 });
          await act.cart.goBack();
        });

        await expect.soft(loc.plp.item(itemIndex).addBtn, '🟧 UI: Add button visible').toBeVisible();
        await expect.soft(loc.header.cart.badge, '🟧 UI: Badge removed').not.toBeVisible();
        await test.step('🟧 Data: Local storage has 0 items', async () => {
          expect(await query.session.readCart()).toHaveLength(0);
        });
      });

      test('Remove button toggles Cart state', async ({ loc, act, query }) => {
        await test.step('⬜ Add items and navigate to cart', async () => {
          await act.plp.addToCart({ index: itemIndex });
          await act.cart.openCart();
        });

        await test.step('🟦 Remove item from cart', async () => {
          await act.cart.removeFromCart({ index: 0 });
        });

        await expect.soft(loc.header.cart.badge, '🟧 UI: Badge removed').not.toBeVisible();
        await test.step('🟧 Data: Local storage has 0 items', async () => {
          expect(await query.session.readCart()).toHaveLength(0);
        });
      });

      if (persona.isBaseline) {
        test('Visual layout', { tag: '@visual' }, async ({ page, act }) => {
          await test.step('⬜ Add an item and go to cart', async () => {
            await act.plp.addToCart({ index: itemIndex });
            await act.cart.openCart();
          });

          await test.step('⬜ Mock List', async () => {
            await act.cart.mockList();
          });

          await expect(page, '🟧 UI: Layout visual check').toHaveScreenshot({ fullPage: true });
        });
      }
    });
  }
});
