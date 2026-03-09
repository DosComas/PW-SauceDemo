import { test } from '@fixtures';
import { BASELINE } from '@data';

const firstItem = 0;
const secondItem = 1;
const fourthItem = 3;

test.describe('Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('⬜ Go to inventory', async () => {
      await page.goto('/inventory.html');
    });
  });

  for (const persona of BASELINE) {
    test.describe(`${persona.role}`, { tag: persona.tag }, () => {
      test.use({ storageState: persona.storageState });

      test('finish order adding item from PDP', { tag: '@aria' }, async ({ act, aria }) => {
        await test.step('🟦 Sort items', async () => {
          await act.plp.sortGrid({ sortBy: 'loHi' });
        });

        await test.step('🟧 ARIA: PLP page milestone', async () => {
          await aria.plp({ itemCount: 0, sortBy: 'loHi', itemsInCart: [] });
        });

        await test.step('🟦 Navigate to PDP and add item', async () => {
          await act.plp.openItem({ index: secondItem, via: 'img' });
          await act.pdp.addToCart();
        });

        await test.step('🟧 ARIA: PDP page milestone', async () => {
          await aria.pdp({ itemCount: 1, inCart: true });
        });

        await test.step('🟦 Navigate to cart', async () => {
          await act.cart.openCart();
        });

        await test.step('🟧 ARIA: Cart page milestone', async () => {
          await aria.cart({ itemCount: 1 });
        });

        await test.step('🟦 Start checkout process', async () => {
          await act.cart.startCheckout();
        });

        await test.step('🟧 ARIA: Checkout info page milestone', async () => {
          await aria.checkout.info({ itemCount: 1 });
        });

        await test.step('🟦 Submit checkout info', async () => {
          await act.checkout.submitInfo();
        });

        await test.step('🟧 ARIA: Checkout Overview page milestone', async () => {
          await aria.checkout.overview({ itemCount: 1 });
        });

        await test.step('🟦 Complete the purchase', async () => {
          await act.checkout.completeOrder();
        });

        await test.step('🟧 ARIA: Checkout Complete page milestone', async () => {
          await aria.checkout.complete();
        });
      });

      test('finish order adding items from PLP', { tag: '@aria' }, async ({ act, aria }) => {
        await test.step('🟦 Add three items', async () => {
          await act.plp.addToCart({ indexes: [firstItem, secondItem, fourthItem] });
        });

        await test.step('🟧 ARIA: PLP page milestone', async () => {
          await aria.plp({ itemCount: 3, sortBy: 'az', itemsInCart: [firstItem, secondItem, fourthItem] });
        });

        await test.step('🟦 Navigate to cart and remove an item', async () => {
          await act.cart.openCart();
          await act.cart.removeFromCart({ indexes: [secondItem] });
        });

        await test.step('🟧 ARIA: Cart page milestone', async () => {
          await aria.cart({ itemCount: 2 });
        });

        await test.step('🟦 Start checkout process', async () => {
          await act.cart.startCheckout();
        });

        await test.step('🟧 ARIA: Checkout info page milestone', async () => {
          await aria.checkout.info({ itemCount: 2 });
        });

        await test.step('🟦 Submit checkout info', async () => {
          await act.checkout.submitInfo();
        });

        await test.step('🟧 ARIA: Checkout Overview page milestone', async () => {
          await aria.checkout.overview({ itemCount: 2 });
        });

        await test.step('🟦 Complete the purchase', async () => {
          await act.checkout.completeOrder();
        });

        await test.step('🟧 UI: Checkout Complete page milestone', async () => {
          await aria.checkout.complete();
        });
      });
    });
  }
});
