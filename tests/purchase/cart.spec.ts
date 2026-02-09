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
