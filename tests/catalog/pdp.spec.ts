import { test, expect } from '@fixtures';
import { ACCESS_USERS, STATE_KEYS } from '@data';

const SCOPE = 'PDP';

const PDP_CONTEXT = { firstItem: 0, itemIndexes: [0, 1, 2], middleItem: 1 } as const;
const { firstItem, itemIndexes, middleItem } = PDP_CONTEXT;

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory page', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of ACCESS_USERS) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test.use({ storageState: persona.storageState });

    test(`${SCOPE}: Content matches inventory data`, async ({ loc, action }) => {
      const item = await test.step('⬜ Scrape Item data', async () => {
        return await action.plp.scrape({ index: firstItem });
      });

      await test.step('🟦 Navigate to PDP', async () => {
        await action.plp.open({ index: firstItem, via: 'name' });
      });

      await expect.soft(loc.pdp.item.name, '🟧 UI: Item name matches').toHaveText(item.name);
      await expect.soft(loc.pdp.item.desc, '🟧 UI: Item description matches').toHaveText(item.desc);
      await expect.soft(loc.pdp.item.price, '🟧 UI: Item price matches').toHaveText(item.price);
      await expect(loc.pdp.item.img, '🟧 UI: Item image source matches').toHaveAttribute('src', item.imgSrc);
    });

    test(`${SCOPE}: Add/Remove button toggles cart state`, async ({ page, loc, action }) => {
      await test.step('🟦 Navigate to PDP and add item', async () => {
        await action.plp.open({ index: firstItem, via: 'img' });
        await action.pdp.add();
      });

      await expect.soft(loc.pdp.item.removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(loc.header.cartBadge, `🟧 UI: Cart Badge shows 1 item`).toHaveText('1');
      await expect(page, `🟧 Data: Local storage has 1 item`).toHaveStorageLength(STATE_KEYS.cart, 1);

      await test.step('🟦 Remove item from cart', async () => {
        await action.pdp.remove();
      });

      await expect.soft(loc.pdp.item.addBtn, '🟧 UI: Add button visible').toBeVisible();
      await expect.soft(loc.header.cartBadge, `🟧 UI: Cart Badge removed`).not.toBeVisible();
      await expect(page, `🟧 Data: Local storage is empty`).toHaveStorageLength(STATE_KEYS.cart, 0);
    });

    test(`${SCOPE}: State persistence on PDP entry`, async ({ page, loc, action }) => {
      await test.step('⬜ Add items to cart on inventory', async () => {
        for (const productIndex of itemIndexes) {
          await action.plp.add({ index: productIndex });
        }
      });

      await test.step('🟦 Navigate to PDP', async () => {
        await action.plp.open({ index: middleItem, via: 'img' });
      });

      await expect.soft(loc.pdp.item.removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(loc.header.cartBadge, `🟧 UI: Cart Badge shows 3 items`).toHaveText('3');
      await expect(page, `🟧 Data: Local storage has 3 items`).toHaveStorageLength(STATE_KEYS.cart, 3);
    });

    test(`${SCOPE}: State persistence on PDP return`, async ({ page, loc, action }) => {
      await test.step('⬜ Navigate to PLP', async () => {
        await action.plp.open({ index: firstItem, via: 'name' });
      });

      await test.step('🟦 Add item and return to PDP', async () => {
        await action.pdp.add();
        await loc.pdp.backBtn.click();
      });

      await expect.soft(loc.plp.item(firstItem).removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(loc.header.cartBadge, `🟧 UI: Cart Badge shows 1 item`).toHaveText('1');
      await expect(page, `🟧 Data: Local storage has 1 item`).toHaveStorageLength(STATE_KEYS.cart, 1);
    });

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page, loc, action }) => {
        await test.step('⬜ Navigate to PDP and mock grid', async () => {
          await action.plp.open({ index: firstItem, via: 'name' });
          await action.pdp.mockItem();
        });

        await expect(page, '🟧 UI: PDP layout visual check').toHaveScreenshot({
          mask: [loc.pdp.item.img],
          fullPage: true,
        });
      });
    }
  });
}
