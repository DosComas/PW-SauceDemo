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
          return await query.plp.items({ index: itemIndexes, imgSrc: false });
        });

        await test.step('⬜ Add items and navigate to cart', async () => {
          await act.plp.add({ index: itemIndexes });
          await act.cart.open();
        });

        await expect.soft(loc.cart.items.cards, '🟧 UI: Cart count matches selection').toHaveCount(expected.length);

        const actual = await test.step('🟧 UI: Scrape Cart items data', async () => {
          return await query.cart.items();
        });

        expect(actual, '🟧 Data: Cart items match PLP source').toMatchObject(expected);
      });

      // TODO
      test.skip('remove from cart, check sync?', async ({ page }) => {
        await test.step('⬜ Arrange: prepare state', async () => {});

        await test.step('🟦 Action: perform interaction', async () => {});

        await expect.soft(page, '🟧 UI: verify outcome').toHaveURL('d');
      });
      // END

      if (persona.isBaseline) {
        test('Visual layout', { tag: '@visual' }, async ({ page, act }) => {
          await test.step('⬜ Add an item and go to cart', async () => {
            await act.plp.add({ index: itemIndex });
            await act.cart.open();
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

/*
for (const persona of BASELINE_USERS) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test.use({ storageState: persona.storageState });

    test(`${SCOPE}: Remove item syncs with Badge and Inventory`, async ({ page, loc, action }) => {
      const { removedItemIndex, retainedItemIndex } = CART_CONTEXT;

      await test.step('🟦 Remove item from cart list', async () => {
        await expect(loc.cart.items).toHaveCount(2);
        await action.cart.remove({ index: removedItemIndex });
      });

      // 🏛️ Verification 1: Immediate Cart State
      await expect.soft(loc.cart.item(removedItemIndex).component, '🟧 UI: Item removed').toBeHidden();
      await expect.soft(loc.header.cart.badge, '🟧 UI: Badge updates to 1').toHaveText('1');
      await expect(page, '🟧 Data: Local storage has 1 item').toHaveStorageLength(STATE_KEYS.cart, 1);

      await test.step('🟦 Return to Inventory to check Sync', async () => {
        await action.cart.continueShopping();
      });

      // 🏛️ Verification 2: Cross-Page Sync (The "Grounded" Check)
      await expect.soft(loc.plp.item(removedItemIndex).addBtn, '🟧 Sync: Removed item is reset').toBeVisible();
      await expect.soft(loc.plp.item(retainedItemIndex).removeBtn, '🟧 Sync: Retained item is still active').toBeVisible();
    });

    test(`${SCOPE}: Checkout navigation flow`, async ({ page, loc, action }) => {
      await test.step('🟦 Proceed to checkout', async () => {
        await action.cart.checkout();
      });

      await expect(page, '🟧 Nav: Redirected to Checkout Step One').toHaveURL(/checkout-step-one/);
    });
  });
}*/
