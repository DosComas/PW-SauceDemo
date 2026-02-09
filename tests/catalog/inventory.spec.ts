import { test, expect } from '@playwright/test';
import { productLoc } from '../../helpers/catalog-helpers';
import { t } from '../../helpers/i18n';
import { VALID_USERS } from '../../data/users';

test.beforeEach(async ({ page }) => {
  await test.step('🟦 Navigate', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of VALID_USERS) {
  test.describe(`${persona.role}`, () => {
    test.use({ storageState: persona.storageState });

    const CASES = [
      { title: 'low to high price', sortBy: 'priceLowHigh' },
      { title: 'high to low price', sortBy: 'priceHighLow' },
      { title: 'name A to Z', sortBy: 'nameAZ' },
      { title: 'name Z to A', sortBy: 'nameZA' },
    ] as const;

    CASES.forEach(({ title, sortBy }) => {
      test(`Verify sorting by ${title}`, async ({ page }) => {
        const { inventoryUI } = productLoc(page);

        await test.step('🟦 Sort', async () => {
          await inventoryUI.productSortDropdown.selectOption(t(`product.sort.${sortBy}`));
        });
      });
    });
  });
}

/* sorting test case
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

// TODO: inventory, visual check for normal user only (maybe add a flag to normal to indicate that?)
// What bout a e2e test, log in add item, temove, and check out?

/* ANOTER TEST CASE (visual test case)
test('Valid login', { tag: '@visual' }, async ({ page }) => {
  await test.step('Enter valid username and password', async () => {
    await doLogin(page, validUsername, validPassword);
  });

  await test.step('User logs in and lands on the products page', async () => {
    await page.evaluate(() => {
      // Get all inventory items
      const inventoryItems = document.querySelectorAll('[data-test="inventory-item"]');

      // Loop through each inventory item and apply the changes, but only for the first 3 items
      inventoryItems.forEach((item: Element, index: number) => {
        const htmlItem = item as HTMLElement; // Cast to HTMLElement

        if (index >= 5) {
          htmlItem.style.display = 'none'; // Hide the items beyond the first 3
        } else {
          // Modify image to broken image
          const img = item.querySelector('img') as HTMLImageElement | null;
          if (img) {
            img.src = 'invalid-image.jpg'; // Set broken image
            img.setAttribute('alt', `Test Alt Text ${index + 1}`); // Update alt text with unique value
          }

          // Modify the title text
          const title = item.querySelector('[data-test="inventory-item-name"]') as HTMLElement | null;
          if (title) {
            title.textContent = `Product Test Title ${index + 1}`; // Update title with unique value
          }

          // Modify the description text
          const desc = item.querySelector('[data-test="inventory-item-desc"]') as HTMLElement | null;
          if (desc) {
            desc.textContent =
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod ' +
              'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim ' +
              'veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea ' +
              'commodo consequat.'; // Update description with unique value
          }

          // Modify the price
          const price = item.querySelector('[data-test="inventory-item-price"]') as HTMLElement | null;
          if (price) {
            price.textContent = '$99.99'; // Update price
          }
        }
      });
    });

    await expect(page, 'User should be logged into the landing page').toHaveURL('/inventory.html');

    await expect(page, 'Visual issue with landing page').toHaveScreenshot({
      fullPage: true,
    });
  });
});
*/
