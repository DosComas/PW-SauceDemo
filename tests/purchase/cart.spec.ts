import { test, expect } from '@fixtures';
import { t, ACCESS_USERS } from '@data';

const SCOPE = 'Cart';

// CASES?:
// Cases: add product to cart, check sync? data? badge? local?

// remove from cart and go back to... inventory, pdp? to chceck sync. how about data? badge? local?
// -- go to pdp, scrape, go back, check item and cart
const CART_CONTEXT = {
  firstItem: 0,
  middleItem: 1,
  itemIndexes: [0, 1, 2],
  listSize: 3,
} as const;
const { firstItem, middleItem, itemIndexes, listSize } = CART_CONTEXT;

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of ACCESS_USERS) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test.use({ storageState: persona.storageState });

    // TODO
    test.only(`${SCOPE}: Items match PLP data`, async ({ page, loc, action }) => {
      const expected = await test.step('⬜ Scrape items data', async () => {
        return action.plp.scrape({ index: itemIndexes });
      });

      await test.step('⬜ Add items and navigate to cart', async () => {
        await action.plp.add({ index: itemIndexes });
        await action.cart.open();
      });

      for (const index of itemIndexes) {
        const cartItemLoc = loc.cart.item(index);
        const expectedItem = expected[index];

        // ideas to make this easy to read.
        // less than 3 items (2).
        // check the 3 properties at once.
        // message diff than just 0 1 2.
        await expect.soft(cartItemLoc.name, `🟧 UI: Item ${index} name matches`).toHaveText(expectedItem.name);
        await expect.soft(cartItemLoc.price, `🟧 UI: Item ${index} price matches`).toHaveText(expectedItem.price);
        await expect.soft(cartItemLoc.desc, `🟧 UI: Item ${index} description matches`).toHaveText(expectedItem.desc);
      }
    });

    // TODO
    test.skip(`${SCOPE}: remove from cart, check sync?`, async ({ page }) => {
      await test.step('⬜ Arrange: prepare state', async () => {});

      await test.step('🟦 Action: perform interaction', async () => {});

      await expect.soft(page, '🟧 UI: verify outcome').toHaveURL('d');
    });
    // END

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page, action }) => {
        await test.step('⬜ Add an item and go to cart', async () => {
          await action.plp.add({ index: firstItem });
          await action.cart.open();
        });

        await test.step('⬜ Mock List', async () => {
          await action.cart.mockList({ size: listSize });
        });

        await expect(page, '🟧 UI: Cart layout visual check').toHaveScreenshot({ fullPage: true });
      });
    }
  });
}

/*
import { test, expect } from '@playwright/test';
import { getTranslation } from '../helpers/translationHelpers';
import { addProductsToCart } from '../helpers/productsHelpers';

test.beforeEach(async ({ page }) => {
  await test.step('Navigate to web page', async () => {
    await page.goto('/inventory.html');
  });
});

[
  { title: 'Single', addQuantity: 1, testID: '@TC-2.1' },
  { title: 'Five', addQuantity: 5, testID: '@TC-2.2' },
].forEach(({ title, addQuantity, testID }) => {
  test(`Add ${title} Product/s to Cart`, { tag: testID }, async ({ page }) => {
    await test.step(`Add ${addQuantity} product/s to the cart`, async () => {
      await addProductsToCart(page, addQuantity);
    });

    await test.step(`The cart badge updates to show ${addQuantity}`, async () => {
      await expect(
        page.getByTestId('shopping-cart-badge'),
        'Cart badge count mismatch or not displayed'
      ).toContainText(addQuantity.toString());

      await expect(
        page.getByTestId('shopping-cart-link'),
        'Shopping cart icon mismatch or missing'
      ).toHaveScreenshot();
    });
  });
});

[
  { title: 'Add 1 and Remove 1', addQuantity: 1, removeQuantity: 1 },
  { title: 'Add 4 and Remove 2', addQuantity: 4, removeQuantity: 2 },
].forEach(({ title, addQuantity, removeQuantity }) => {
  test(`${title} Products from Cart`, { tag: '@TC-4.1' }, async ({ page }) => {
    await test.step(`Add ${addQuantity} product/s to the cart`, async () => {
      await addProductsToCart(page, addQuantity);
    });

    await test.step(`Remove ${removeQuantity} product/s from the cart`, async () => {
      for (let i = 0; i < removeQuantity; i++) {
        await page
          .getByRole('button', { name: await getTranslation('remove') })
          .first()
          .click();
      }
    });

    await test.step(`The cart badge updates its count`, async () => {
      const expectedCartCount = addQuantity - removeQuantity;

      const cartBadge = page.getByTestId('shopping-cart-badge');

      if (expectedCartCount == 0) {
        await expect(
          cartBadge,
          'Cart badge should not be visible when empty'
        ).not.toBeVisible();
      } else {
        await expect(
          cartBadge,
          'Cart badge count mismatch or not displayed'
        ).toContainText(expectedCartCount.toString());
      }
    });
  });
});

*/

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
