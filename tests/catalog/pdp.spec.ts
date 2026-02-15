import { test, expect } from '@fixtures';
import { ACCESS_USERS, STATE_KEYS } from '@data';

const SCOPE = 'PDP';

const CATALOG_CONTEXT = { firstProduct: 0, productIndexes: [0, 1, 2], middleProduct: 1 } as const;
const { firstProduct, productIndexes, middleProduct } = CATALOG_CONTEXT;

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory page', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of ACCESS_USERS) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test.use({ storageState: persona.storageState });

    test(`${SCOPE}: Content matches inventory data`, async ({ loc, action }) => {
      const product = await test.step('⬜ Scrape product data', async () => {
        return await action.plp.scrape({ index: firstProduct });
      });

      await test.step('🟦 Navigate to PDP', async () => {
        await action.plp.open({ index: firstProduct, via: 'name' });
      });

      await expect.soft(loc.pdp.card.name, '🟧 UI: Product name matches').toHaveText(product.name);
      await expect.soft(loc.pdp.card.desc, '🟧 UI: Product description matches').toHaveText(product.desc);
      await expect.soft(loc.pdp.card.price, '🟧 UI: Product price matches').toHaveText(product.price);
      await expect(loc.pdp.card.img, '🟧 UI: Product image source matches').toHaveAttribute('src', product.img);
    });

    test(`${SCOPE}: Add/Remove button toggles cart state`, async ({ page, loc, action }) => {
      await test.step('🟦 Navigate to PDP and add product', async () => {
        await action.plp.open({ index: firstProduct, via: 'img' });
        await action.pdp.add();
      });

      await expect.soft(loc.pdp.card.removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(loc.header.cartBadge, `🟧 UI: Cart Badge shows 1 item`).toHaveText('1');
      await expect(page, `🟧 Data: Local storage has 1 item`).toHaveStorageLength(STATE_KEYS.cart, 1);

      await test.step('🟦 Remove product from cart', async () => {
        await action.pdp.remove();
      });

      await expect.soft(loc.pdp.card.addBtn, '🟧 UI: Add button visible').toBeVisible();
      await expect.soft(loc.header.cartBadge, `🟧 UI: Cart Badge removed`).not.toBeVisible();
      await expect(page, `🟧 Data: Local storage is empty`).toHaveStorageLength(STATE_KEYS.cart, 0);
    });

    test(`${SCOPE}: State persistence on PDP entry`, async ({ page, loc, action }) => {
      await test.step('⬜ Add products to cart on inventory', async () => {
        for (const productIndex of productIndexes) {
          await action.plp.add({ index: productIndex });
        }
      });

      await test.step('🟦 Navigate to PDP', async () => {
        await action.plp.open({ index: middleProduct, via: 'img' });
      });

      await expect.soft(loc.pdp.card.removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(loc.header.cartBadge, `🟧 UI: Cart Badge shows 3 items`).toHaveText('3');
      await expect(page, `🟧 Data: Local storage has 3 items`).toHaveStorageLength(STATE_KEYS.cart, 3);
    });

    test(`${SCOPE}: State persistence on Inventory return`, async ({ page, loc, action }) => {
      await test.step('⬜ Navigate to PDP', async () => {
        await action.plp.open({ index: firstProduct, via: 'name' });
      });

      await test.step('🟦 Add item and return to inventory', async () => {
        await action.pdp.add();
        await loc.pdp.backBtn.click();
      });

      await expect.soft(loc.plp.card(firstProduct).removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(loc.header.cartBadge, `🟧 UI: Cart Badge shows 1 item`).toHaveText('1');
      await expect(page, `🟧 Data: Local storage has 1 item`).toHaveStorageLength(STATE_KEYS.cart, 1);
    });

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page, loc, action }) => {
        await test.step('⬜ Navigate to PDP and standardize data', async () => {
          await action.plp.open({ index: firstProduct, via: 'name' });
          await action.pdp.normalize();
        });

        await expect(page, '🟧 UI: PDP layout visual check').toHaveScreenshot({
          mask: [loc.pdp.card.img],
          fullPage: true,
        });
      });
    }
  });
}
