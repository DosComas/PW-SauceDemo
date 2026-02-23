import { test, expect } from '@fixtures';
import { AUTHENTICATED } from '@data';
import { createRandom } from '@utils';

// CASES?:
// Cases: add product to cart, check sync? data? badge? local?

// remove from cart and go back to... inventory, pdp? to chceck sync. how about data? badge? local?
// -- go to pdp, scrape, go back, check item and cart

// test buttons, sync buttons, states

// how about addin items form the PDP to cart?

// test remove from cart? test going back?

const random = createRandom();
const itemIndexes = random.basket(3);
const itemIndex = random.target(itemIndexes);
const secondItem = 1;

test.describe.parallel('Cart', () => {
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

      test('PDP matches Cart data', async ({ loc, act, query }) => {
        await test.step('⬜ Add items and navigate to cart', async () => {
          await act.plp.addToCart({ index: itemIndexes });
          await act.cart.openCart();
        });

        const expected = await test.step('⬜ Scrape Cart item data', async () => {
          return await query.cart.items({ index: secondItem });
        });

        await test.step('🟦 Navigate from Cart to PDP', async () => {
          await act.cart.openItem({ index: secondItem });
        });

        await expect.soft(loc.pdp.item.removeBtn, '🟧 UI: Remove button visible').toBeVisible();
        await test.step('🟧 UI: PDP item match Cart source', async () => {
          expect(await query.pdp.readItem()).toMatchObject(expected);
        });
      });

      // TODO
      test.skip('A: from cart remove item, go to pdp (state)', async ({ act }) => {
        // go to PDP
        // add item PDP
        // go to cart
        // check data only? or remove item and check it is empy the list, badge, and local storage?

        await test.step('⬜ Add items and navigate to cart', async () => {
          await act.plp.addToCart({ index: itemIndexes });
          await act.cart.openCart();
        });

        await test.step('🟦 Remove one item and go to PDP', async () => {});

        // await expect.soft(page, '🟧 UI: button, badge and LS').toHaveURL('d');
      });

      test.skip('B: from cart remove item, go to plp, check (state)', async ({ act }) => {
        // add items PLP
        // remove 1 cart
        // go back to shopping cart
        // check PLP item

        await test.step('⬜ Add items and navigate to cart', async () => {
          await act.plp.addToCart({ index: itemIndexes });
          await act.cart.openCart();
        });

        await test.step('🟦 Remove one item and go to PLP', async () => {});

        // await expect.soft(page, '🟧 UI: button, badge and LS').toHaveURL('d');
      });

      // END

      test('Remove button toggles cart state', async ({ loc, act, query }) => {
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
