import { test, expect } from '@fixtures';
import { toSnapshotName } from '@utils';
import { t, ACCESS_USERS } from '@data';

import { standardizeCartList } from '../../helpers/purchase.helpers';

const SCOPE = 'Cart';

// TODO add scrips to run each user
// TODO make snippets great again & add doc strings

// TODO are matcher over-engineered? how about the dictionary?

// TODO identity, 2 files should there only be 1? domian something methodology

// TODO make toSnapshotName better

// TODO config, projects name, can be better?

// TODO toSnapshotName import and object with things like that inside???

// CASES?:
// Cases add product to cart, check sync? data? badge? local?

// remove from cart and go back to... inventory, pdp? to chceck sync. how about data? badge? local?

// visual chcking- add 1 clone to have 3 total?

const CATALOG_CONTEXT = { firstProduct: 0, listSize: 3 } as const;
const { firstProduct, listSize } = CATALOG_CONTEXT;

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to login page', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of ACCESS_USERS) {
  test.describe(`${persona.role}`, () => {
    test.use({ storageState: persona.storageState });

    // TODO
    test.skip(`${SCOPE}: synct inventory to cart?`, async ({ page, loc, action }) => {
      const setup = {};

      await test.step('⬜ Arrange: prepare state', async () => {});

      await test.step('🟦 Action: perform interaction', async () => {});

      await expect.soft(page, '🟧 UI: verify outcome').toHaveURL('d');
    });

    // TODO
    test.skip(`${SCOPE}: remove from cart, check sync?`, async ({ page, loc, action }) => {
      const setup = {};

      await test.step('⬜ Arrange: prepare state', async () => {});

      await test.step('🟦 Action: perform interaction', async () => {});

      await expect.soft(page, '🟧 UI: verify outcome').toHaveURL('d');
    });
    // END

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page, loc, action }) => {
        await test.step('⬜ Add a product and go to cart', async () => {
          await action.plp.add({ index: firstProduct });
          await loc.header.cartBtn.click();
          await standardizeCartList(page, { size: listSize });
        });

        await expect(page, '🟧 UI: Cart layout visual check').toHaveScreenshot(
          `${toSnapshotName(persona.role)}-cart.png`,
          {
            fullPage: true,
          }
        );
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
