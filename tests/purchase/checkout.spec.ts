import { test, expect } from '@fixtures';
import { AUTHENTICATED } from '@data';
import { createRandom } from '@utils';

const random = createRandom();
const itemIndexes = random.basket(3);
// const itemIndex = random.target(itemIndexes);

// test data integrity (items plp match checkout)
// test checkout link to pdp
// test financial data tax, total, etc
// test checkout form validation (parameterize missing fields)
// test finish
// test visutal?

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('⬜ Go to inventory', async () => {
      await page.goto('/inventory.html');
    });
  });

  for (const persona of AUTHENTICATED) {
    test.describe(`${persona.role}`, { tag: persona.tag }, () => {
      test.use({ storageState: persona.storageState });

      test.skip('Items match PLP data', async ({ loc, act, query }) => {
        const expected = await test.step('⬜ Scrape PLP items data', async () => {
          return await query.plp.readItems({ index: itemIndexes, imgSrc: false });
        });

        await test.step('🟦 Add items and complete checkout', async () => {
          await act.plp.addToCart({ index: itemIndexes });
          await act.cart.openCart();
          await act.checkout.submitInfo();
        });

        await expect.soft(loc.cart.items.cards, '🟧 UI: Cart count matches selection').toHaveCount(expected.length);
        await test.step('🟧 UI: Cart items match PLP source', async () => {
          expect(await query.cart.items()).toMatchObject(expected);
        });
      });

      if (persona.isBaseline) {
        test.skip('Visual layout', { tag: '@visual' }, async ({ page }) => {
          await expect(page, '🟧 Visual').toHaveScreenshot({ fullPage: true });
        });
      }
    });
  }
});
