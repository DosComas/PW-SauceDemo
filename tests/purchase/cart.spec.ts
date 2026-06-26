import { test, expect } from '@fixtures';
import { AUTHENTICATED } from '@data';
import { createRandom } from '@utils';

const random = createRandom();
const itemIndexes = random.basket(3);
const itemIndex = random.target(itemIndexes);

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of AUTHENTICATED) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test.use({ storageState: persona.storageState });

    test('item data consistency', async ({ loc, act, query }) => {
      let itemCount: number = 0;

      const expected = await test.step('⬜ Scrape PLP items data', async () => {
        return await query.plp.readItems({ indexes: itemIndexes, imgSrc: false });
      });

      await test.step('🟦 Add items and navigate to cart', async () => {
        await act.plp.addToCart({ indexes: itemIndexes });
        itemCount += itemIndexes.length;
        await act.cart.openCart();
      });

      await expect.soft(loc.header.cart.badge, '🟧 UI: Cart Badge match selection').toHaveText(String(itemCount));

      await test.step('🟧 UI: Cart items match PLP source', async () => {
        expect(await query.cart.readItems(), 'Items match').toMatchObject(expected);
      });
    });

    test('pdp link navigation', async ({ loc, act, query }) => {
      const cartItemIndex = random.target(itemIndexes.length);

      await test.step('⬜ Add items and navigate to cart', async () => {
        await act.plp.addToCart({ indexes: itemIndexes });
        await act.cart.openCart();
      });

      const expected = await test.step('⬜ Scrape Cart item data', async () => {
        return await query.cart.readItems({ index: cartItemIndex });
      });

      await test.step('🟦 Navigate from Cart to PDP', async () => {
        await act.cart.openItem({ index: cartItemIndex });
      });

      await expect.soft(loc.pdp.item.removeBtn, '🟧 UI: Remove button visible').toBeVisible();

      await test.step('🟧 UI: PDP item match Cart source', async () => {
        expect(await query.pdp.readItem(), 'Local storage match').toMatchObject(expected);
      });
    });

    test('plp persistence: on return', async ({ loc, act, query }) => {
      await test.step('⬜ Add item to cart from PDP', async () => {
        await act.plp.openItem({ index: itemIndex, via: 'img' });
        await act.pdp.addToCart();
        await act.cart.openCart();
      });

      await test.step('🟦 Remove item from Cart and continue shopping', async () => {
        await act.cart.removeFromCart({ indexes: [0] });
        await act.cart.goBack();
      });

      await expect.soft(loc.plp.item(itemIndex).addBtn, '🟧 UI: Add button visible').toBeVisible();

      await expect.soft(loc.header.cart.badge, '🟧 UI: Cart Badge removed').not.toBeVisible();

      await test.step('🟧 Data: Local storage has 0 items', async () => {
        expect(await query.session.readCart(), 'Local storage match').toHaveLength(0);
      });
    });

    test('remove item logic', async ({ loc, act, query }) => {
      let itemCount: number = 0;

      await test.step('⬜ Add items and navigate to cart', async () => {
        await act.plp.addToCart({ indexes: itemIndexes });
        itemCount += itemIndexes.length;
        await act.cart.openCart();
      });

      await test.step('🟦 Remove item from cart', async () => {
        await act.cart.removeFromCart({ indexes: [random.target(itemCount)] });
        itemCount -= 1;
      });

      await expect.soft(loc.header.cart.badge, '🟧 UI: Cart Badge match selection').toHaveText(String(itemCount));

      await test.step(`🟧 Data: Local storage has ${itemCount} items`, async () => {
        expect(await query.session.readCart(), 'Local storage match').toHaveLength(itemCount);
      });
    });

    test('persistence: session logout', async ({ loc, act, query }) => {
      let itemCount: number = 0;

      const expected = await test.step('⬜ Scrape PLP item data', async () => {
        return await query.plp.readItems({ indexes: itemIndexes, imgSrc: false });
      });

      await test.step('🟦 Add items and logout', async () => {
        await act.plp.addToCart({ indexes: itemIndexes });
        itemCount += itemIndexes.length;
        await act.menu.logout();
      });

      await test.step('🟦 Login and navigate to cart', async () => {
        await act.login.submitCredentials({ username: persona.user, password: persona.pass });
        await act.cart.openCart();
      });

      await expect.soft(loc.header.cart.badge, '🟧 UI: Cart Badge still match selection').toHaveText(String(itemCount));

      await test.step('🟧 UI: Cart items still match PLP source', async () => {
        expect.soft(await query.cart.readItems(), 'Items match').toMatchObject(expected);
      });

      await test.step(`🟧 Data: Local storage still has ${itemCount} items`, async () => {
        expect(await query.session.readCart(), 'Local storage match').toHaveLength(itemCount);
      });
    });

    if (persona.isBaseline) {
      test('visual: cart', { tag: '@visual' }, async ({ page, act }) => {
        await test.step('⬜ Add an item and navigate to cart', async () => {
          await act.plp.addToCart({ indexes: [itemIndex] });
          await act.cart.openCart();
        });

        await test.step('⬜ Mock Cart List', async () => {
          await act.cart.mockList();
        });

        await expect(page, '🟧 UI: Layout visual check').toHaveScreenshot('cart-page.png', { fullPage: true });
      });
    }
  });
}
