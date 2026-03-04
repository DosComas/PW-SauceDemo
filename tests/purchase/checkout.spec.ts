import { test, expect } from '@fixtures';
import { t, AUTHENTICATED } from '@data';
import { createRandom } from '@utils';

const random = createRandom();
const itemIndexes = random.basket(3);
const itemIndex = random.target(itemIndexes);

// test checkout form validation (parameterize missing fields)

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('⬜ Go to inventory', async () => {
      await page.goto('/inventory.html');
    });
  });

  for (const persona of AUTHENTICATED) {
    test.describe(`${persona.role}`, { tag: persona.tag }, () => {
      test.use({ storageState: persona.storageState });

      test('Complete order and items match PLP data', async ({ loc, act, query }) => {
        const expectedItems = await test.step('⬜ Scrape PLP items data', async () => {
          return await query.plp.readItems({ indexes: itemIndexes, imgSrc: false });
        });

        await test.step('🟦 Add items and complete checkout', async () => {
          await act.plp.addToCart({ indexes: itemIndexes });
          await act.cart.openCart();
          await act.checkout.submitInfo();
        });

        await expect.soft(loc.header.cart.badge, '🟧 UI: Badge match selection').toHaveText(String(itemIndexes.length));

        await test.step('🟧 UI: Checkout summary match PLP source', async () => {
          expect.soft(await query.checkout.readItems(), 'Items match').toMatchObject(expectedItems);

          const expectedTotals = query.checkout.calculateTotals({ items: expectedItems });
          expect(await query.checkout.readTotals(), 'Totals match').toMatchObject(expectedTotals);
        });

        await test.step('🟦 Complete the purchase', async () => {
          await act.checkout.completeOrder();
        });

        await expect(loc.checkout.title, '🟧 UI: Page Title').toHaveText(t.checkout.complete.title);

        await expect(loc.checkout.complete.header, '🟧 UI: Success Heading').toHaveText(t.checkout.complete.success);
      });

      test('Cart links to PDP', async ({ loc, act, query }) => {
        await test.step('⬜ Add items and submit checkout info', async () => {
          await act.plp.addToCart({ indexes: itemIndexes });
          await act.cart.openCart();
          await act.checkout.submitInfo();
        });

        const expected = await test.step('⬜ Scrape Checkout item data', async () => {
          return await query.checkout.readItems({ index: 2 });
        });

        await test.step('🟦 Navigate from Checkout to PDP', async () => {
          await act.checkout.openItem({ index: 2 });
        });

        await expect.soft(loc.pdp.item.removeBtn, '🟧 UI: Remove button visible').toBeVisible();

        await test.step('🟧 UI: PDP item match Checkout source', async () => {
          expect(await query.pdp.readItem()).toMatchObject(expected);
        });
      });

      if (persona.isBaseline) {
        test('Visual layout', { tag: '@visual' }, async ({ page, act }) => {
          await test.step('⬜ Add items and submit checkout info', async () => {
            await act.plp.addToCart({ indexes: [itemIndex] });
            await act.cart.openCart();
            await act.checkout.submitInfo();
          });

          await test.step('⬜ Mock Checkout List', async () => {
            await act.checkout.mockList();
          });

          await expect(page, '🟧 UI: Layout visual check').toHaveScreenshot({ fullPage: true });

          await test.step('🟦 Complete the purchase', async () => {
            await act.checkout.completeOrder();
          });

          await expect(page, '🟧 UI: Layout visual check').toHaveScreenshot({ fullPage: true });
        });
      }
    });
  }
});
