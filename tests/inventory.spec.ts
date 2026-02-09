/*
import { test, expect } from '@playwright/test';
import { getTranslation } from '../helpers/translationHelpers';
import { getItemsPrices } from '../helpers/productsHelpers';

test.beforeEach(async ({ page }) => {
  await test.step('Navigate to web page', async () => {
    await page.goto('/inventory.html');
  });
});

[
  { title: 'low to high', sortBy: 'priceLowToHigh', isAscending: true },
  { title: 'high to low', sortBy: 'priceHighToLow', isAscending: false },
].forEach(({ title, sortBy, isAscending }) => {
  test(`Sort Products Price by ${title}`, { tag: '@TC-5.1' }, async ({ page }) => {
    await test.step('Sort products by price', async () => {
      await page
        .getByTestId('product-sort-container')
        .selectOption(await getTranslation(sortBy));
    });

    await test.step('Products are displayed in the correct order', async () => {
      const actualPrices = await getItemsPrices(page, 'inventory-item-price');

      const expectedPrices = [...actualPrices].sort((a, b) =>
        isAscending ? a - b : b - a
      );

      expect(actualPrices, `Prices are not sorted from ${title}`).toEqual(
        expectedPrices
      );
    });
  });
});
*/
