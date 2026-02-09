/*
import { test, expect } from '@playwright/test';
import { getTranslation } from '../helpers/translationHelpers';
import { addProductsToCart, getItemsPrices } from '../helpers/productsHelpers';
import { gotoCheckout, getAmount, submitCheckoutInfo } from '../helpers/checkoutHelpers';

const productQty = 3;
const taxRate = 0.08;
const customer = { firstName: 'Test1', lastName: 'Test2', zip: '1234' };

test.beforeEach(async ({ page }) => {
  await test.step('Navigate to web page', async () => {
    await page.goto('/inventory.html');
  });

  await test.step(`Add 3 product/s to the cart`, async () => {
    await addProductsToCart(page, productQty);
  });

  await test.step('Go to checkout', async () => {
    await gotoCheckout(page);
  });
});

test('Successful Checkout', { tag: '@TC-4.1' }, async ({ page }) => {
  await test.step('Submit required details', async () => {
    await submitCheckoutInfo(page, customer.firstName, customer.lastName, customer.zip);
  });

  await test.step('Validate price', async () => {
    const actualPrices = await getItemsPrices(page, 'inventory-item-price');

    const expectedSubtotal = actualPrices.reduce((acc, num) => acc + num, 0);
    const expectedTax = parseFloat((expectedSubtotal * taxRate).toFixed(2));
    const expectedTotal = expectedSubtotal + expectedTax;

    const actualSubtotal = await getAmount(page, 'subtotal-label');
    const actualTax = await getAmount(page, 'tax-label');
    const actualTotal = await getAmount(page, 'total-label');

    expect(actualSubtotal).toEqual(expectedSubtotal);

    expect(actualTax).toEqual(expectedTax);

    expect(actualTotal).toEqual(expectedTotal);
  });

  await test.step('Finish order', async () => {
    await page.getByRole('button', { name: await getTranslation('finish') }).click();

    await expect(page).toHaveURL('/checkout-complete.html');

    await expect(page).toHaveScreenshot();
  });
});

[
  { title: 'First Name', firstName: '', lastName: customer.lastName, zip: customer.zip },
  { title: 'Last Name', firstName: customer.firstName, lastName: '', zip: customer.zip },
  { title: 'Postal Code', firstName: customer.firstName, lastName: customer.lastName, zip: '' },
].forEach(({ title, firstName, lastName, zip }) => {
  test(`Checkout with Missing ${title}`, { tag: '@TC-4.2' }, async ({ page }) => {
    await test.step('Submit required details', async () => {
      await submitCheckoutInfo(page, firstName, lastName, zip);
    });

    await test.step('A validation error is displayed', async () => {
      await expect(page.getByTestId('error')).toContainText(`Error: ${title} is required`);
    });
  });
});
*/
