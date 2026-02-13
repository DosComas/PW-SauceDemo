import { test, expect } from '@playwright/test';
import { catalog, catalogLocators } from '../../helpers/catalog.helpers';
import { VALID_USERS } from '../../data/users.data';
import { toSnapshotName } from '../../utils/string.utils';

const SCOPE = 'Cart';

// TODO add login test cases? test on webkit?

// Cases add product to cart, check sync? data? badge? local?

// remove from cart and go back to... inventory, pdp? to chceck sync. how about data? badge? local?

// visual chcking- add 1 clone to have 3 total?

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to login page', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of VALID_USERS) {
  test.describe(`${persona.role}`, () => {
    test.use({ storageState: persona.storageState });

    test.skip(`${SCOPE}: test description`, async ({ page }) => {
      const { productUI } = catalogLocators(page);

      const setup = {};

      await test.step('⬜ Arrange: prepare state', async () => {});

      await test.step('🟦 Action: perform interaction', async () => {});

      await expect.soft(page, '🟧 UI: verify outcome').toHaveURL('d');
    });
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
