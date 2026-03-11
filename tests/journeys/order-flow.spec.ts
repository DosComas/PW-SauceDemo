import { test } from '@fixtures';
import { BASELINE } from '@data';
import { createRandom } from '@utils';

const random = createRandom();
const itemIndexes = random.basket(3);
const itemIndex = random.target(itemIndexes);

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of BASELINE) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test.use({ storageState: persona.storageState });

    test('purchase via pdp', { tag: '@aria' }, async ({ act, aria }) => {
      let itemCount: number = 0;

      await test.step('🟦 Sort items', async () => {
        await act.plp.sortGrid({ sortBy: 'hiLo' });
      });

      await test.step('🟧 ARIA: PLP page milestone', async () => {
        await aria.plp({ itemCount, sortBy: 'hiLo', itemsInCart: [] });
      });

      await test.step('🟦 Navigate to PDP and add item', async () => {
        await act.plp.openItem({ index: itemIndex, via: 'img' });
        await act.pdp.addToCart();
        itemCount += 1;
      });

      await test.step('🟧 ARIA: PDP page milestone', async () => {
        await aria.pdp({ itemCount, inCart: true });
      });

      await test.step('🟦 Navigate to cart', async () => {
        await act.cart.openCart();
      });

      await test.step('🟧 ARIA: Cart page milestone', async () => {
        await aria.cart({ itemCount });
      });

      await test.step('🟦 Start checkout process', async () => {
        await act.cart.startCheckout();
      });

      await test.step('🟧 ARIA: Checkout info page milestone', async () => {
        await aria.checkout.info({ itemCount });
      });

      await test.step('🟦 Submit checkout info', async () => {
        await act.checkout.submitInfo();
      });

      await test.step('🟧 ARIA: Checkout Overview page milestone', async () => {
        await aria.checkout.overview({ itemCount });
      });

      await test.step('🟦 Complete the purchase', async () => {
        await act.checkout.completeOrder();
      });

      await test.step('🟧 ARIA: Checkout Complete page milestone', async () => {
        await aria.checkout.complete();
      });
    });

    test('bulk plp purchase', { tag: '@aria' }, async ({ act, aria }) => {
      let itemCount: number = 0;

      await test.step('🟦 Add three items', async () => {
        await act.plp.addToCart({ indexes: itemIndexes });
        itemCount += 3;
      });

      await test.step('🟧 ARIA: PLP page milestone', async () => {
        await aria.plp({ itemCount, sortBy: 'az', itemsInCart: itemIndexes });
      });

      await test.step('🟦 Navigate to cart and remove an item', async () => {
        await act.cart.openCart();
        await act.cart.removeFromCart({ indexes: [random.target(itemCount)] });
        itemCount -= 1;
      });

      await test.step('🟧 ARIA: Cart page milestone', async () => {
        await aria.cart({ itemCount });
      });

      await test.step('🟦 Start checkout process', async () => {
        await act.cart.startCheckout();
      });

      await test.step('🟧 ARIA: Checkout info page milestone', async () => {
        await aria.checkout.info({ itemCount });
      });

      await test.step('🟦 Submit checkout info', async () => {
        await act.checkout.submitInfo();
      });

      await test.step('🟧 ARIA: Checkout Overview page milestone', async () => {
        await aria.checkout.overview({ itemCount });
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
