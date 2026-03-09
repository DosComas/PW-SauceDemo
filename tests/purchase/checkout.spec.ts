import { test, expect } from '@fixtures';
import type { CheckoutInfoData, CheckoutInfoError } from '@data';
import { t, AUTHENTICATED } from '@data';
import { createRandom } from '@utils';

type InfoScenario = { skipInput: keyof CheckoutInfoData; expectedError: CheckoutInfoError };

const random = createRandom();
const itemIndexes = random.basket(3);
const itemIndex = random.target(itemIndexes);

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
          await act.cart.startCheckout();
          await act.checkout.submitInfo();
        });

        await expect.soft(loc.header.cart.badge, '🟧 UI: Badge match selection').toHaveText(String(itemIndexes.length));

        await test.step('🟧 UI: Checkout summary match PLP source', async () => {
          const expectedTotals = query.checkout.calculateTotals({ items: expectedItems });

          expect.soft(await query.checkout.readItems(), 'Items match').toMatchObject(expectedItems);
          expect(await query.checkout.readTotals(), 'Totals match').toMatchObject(expectedTotals);
        });

        await test.step('🟦 Complete the purchase', async () => {
          await act.checkout.completeOrder();
        });

        await expect(loc.header.container.secondary, '🟧 UI: Page Title').toHaveText(t.checkout.complete.title);

        await expect(loc.checkout.successMsgTitle, '🟧 UI: Success Message Title').toHaveText(
          t.checkout.complete.success,
        );
      });

      test('Cart links to PDP', async ({ loc, act, query }) => {
        await test.step('⬜ Add items and submit checkout info', async () => {
          await act.plp.addToCart({ indexes: itemIndexes });
          await act.cart.openCart();
          await act.cart.startCheckout();
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
          expect(await query.pdp.readItem(), 'Match item object').toMatchObject(expected);
        });
      });

      (
        [
          { skipInput: 'firstName', expectedError: t.checkout.info.errors.firstName },
          { skipInput: 'lastName', expectedError: t.checkout.info.errors.lastName },
          { skipInput: 'zipCode', expectedError: t.checkout.info.errors.zipCode },
        ] as const satisfies InfoScenario[]
      ).forEach(({ skipInput, expectedError }) => {
        test(`Validation error when ${t.checkout.info.form[skipInput]} is missing`, async ({ loc, act }) => {
          await test.step('⬜ Add items and go to cart', async () => {
            await act.plp.addToCart({ indexes: itemIndexes });
            await act.cart.openCart();
          });

          await test.step('🟦 Submit checkout info', async () => {
            await act.cart.startCheckout();
            await act.checkout.submitInfo({ skip: [skipInput] });
          });

          await expect(loc.checkout.error, '🟧 UI: Error message matches').toHaveText(expectedError);
        });
      });

      if (persona.isBaseline) {
        test('Visual layout', { tag: '@visual' }, async ({ page, act }) => {
          await test.step('⬜ Add items and submit checkout info', async () => {
            await act.plp.addToCart({ indexes: [itemIndex] });
            await act.cart.openCart();
            await act.cart.startCheckout();
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
