import { test, expect } from '@fixtures';
import { ACCESS_USERS, STATE_KEYS } from '@data';
import { createRandom } from '@utils';

const SCOPE = 'PDP';

const random = createRandom();
const itemIndexes = random.basket(3);
const itemIndex = random.target(itemIndexes);

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of ACCESS_USERS) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test.use({ storageState: persona.storageState });

    test(`${SCOPE}: Content matches PLP data`, async ({ action }) => {
      const expected = await test.step('⬜ Scrape PLP Item data', async () => {
        return await action.plp.scrape({ index: itemIndex });
      });

      await test.step('🟦 Navigate to PDP', async () => {
        await action.plp.open({ index: itemIndex, via: 'name' });
      });

      const actual = await test.step('🟧 UI: Scrape PDP item data', async () => {
        return await action.pdp.scrape();
      });

      await test.step('🟧 Data: PDP item match PLP source', async () => {
        expect(actual).toMatchObject(expected);
      });
    });

    test(`${SCOPE}: Add/Remove button toggles cart state`, async ({ page, loc, action }) => {
      await test.step('🟦 Navigate to PDP and add item', async () => {
        await action.plp.open({ index: itemIndex, via: 'img' });
        await action.pdp.add();
      });

      await expect.soft(loc.pdp.item.removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(loc.header.cart.badge, `🟧 UI: Cart Badge shows 1 item`).toHaveText('1');
      await expect(page, `🟧 Data: Local storage has 1 item`).toHaveStorageLength(STATE_KEYS.cart, 1);

      await test.step('🟦 Remove item from cart', async () => {
        await action.pdp.remove();
      });

      await expect.soft(loc.pdp.item.addBtn, '🟧 UI: Add button visible').toBeVisible();
      await expect.soft(loc.header.cart.badge, `🟧 UI: Cart Badge removed`).not.toBeVisible();
      await expect(page, `🟧 Data: Local storage is empty`).toHaveStorageLength(STATE_KEYS.cart, 0);
    });

    test(`${SCOPE}: State persistence on PDP entry`, async ({ page, loc, action }) => {
      await test.step('⬜ Add items to cart on inventory', async () => {
        await action.plp.add({ index: itemIndexes });
      });

      await test.step('🟦 Navigate to PDP', async () => {
        await action.plp.open({ index: itemIndex, via: 'img' });
      });

      await expect.soft(loc.pdp.item.removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(loc.header.cart.badge, `🟧 UI: Cart Badge shows 3 items`).toHaveText('3');
      await expect(page, `🟧 Data: Local storage has 3 items`).toHaveStorageLength(STATE_KEYS.cart, 3);
    });

    test(`${SCOPE}: State persistence on PDP return`, async ({ page, loc, action }) => {
      await test.step('⬜ Navigate to PLP', async () => {
        await action.plp.open({ index: itemIndex, via: 'name' });
      });

      await test.step('🟦 Add item and return to PDP', async () => {
        await action.pdp.add();
        await loc.pdp.backBtn.click();
      });

      await expect.soft(loc.plp.item(itemIndex).removeBtn, '🟧 UI: Remove button visible').toBeVisible();
      await expect.soft(loc.header.cart.badge, `🟧 UI: Cart Badge shows 1 item`).toHaveText('1');
      await expect(page, `🟧 Data: Local storage has 1 item`).toHaveStorageLength(STATE_KEYS.cart, 1);
    });

    if (persona.isBaselineUser) {
      test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page, loc, action }) => {
        await test.step('⬜ Navigate to PDP', async () => {
          await action.plp.open({ index: itemIndex, via: 'name' });
        });

        const img = await test.step('⬜ Mock grid', async () => {
          await action.pdp.mockItem();
          return loc.pdp.item.img;
        });

        await expect(page, '🟧 UI: PDP layout visual check').toHaveScreenshot({ mask: [img], fullPage: true });
      });
    }
  });
}
