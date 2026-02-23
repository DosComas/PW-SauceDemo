import type { Page, Locator } from '@playwright/test';
import * as c from './core';
import type * as d from '@data';
import { t, SAMPLE_ITEM } from '@data';

// ==========================================
// 🏛️ DOMAIN LOCATORS
// ==========================================

export const purchaseLocators = (page: Page) => {
  const _cards = page.locator('.cart_item');

  return {
    cart: {
      list: page.getByTestId('cart-list'),
      items: {
        cards: _cards,
      },
      item: (index: number) => ({
        ...c._itemFragment(_cards.nth(index)),
      }),
      backBtn: page.getByRole('button', { name: t.cart.goBack }),
    } as const satisfies d.LocSchema,
  };
};

// ==========================================
// 🏛️ DOMAIN GATEWAY
// ==========================================

/** Purchase domain: cart locators, actions, and item queries */
export const purchase = (page: Page) => {
  const loc = purchaseLocators(page);
  const { header } = c.layoutLocators(page);

  const _cards = loc.cart.items.cards;
  const _getItem = (i: number) => loc.cart.item(i);

  return {
    loc,
    act: {
      cart: {
        openCart: async () => await header.cart.openBtn.click(),
        openItem: async ({ index }: { index: number }) => {
          await _getItem(index).name.click();
        },
        removeFromCart: async ({ index }: { index: c.IndexInput }) => {
          const indexes = await c._ensureIndexes(_cards, index);
          for (const i of indexes) await _getItem(i).removeBtn.click();
        },
        goBack: async () => await loc.cart.backBtn.click(),
        mockList: async ({ size = 3 }: { size?: number } = {}) => {
          const blueprint = loc.cart.items.cards.first();
          await c._injectItemText(loc.cart.item(0), SAMPLE_ITEM);
          await c._injectClones(loc.cart.list, blueprint, size);
          await _injectBadgeNum(header.cart.badge, size);
        },
      },
    } as const satisfies d.ActSchema,
    query: {
      cart: {
        items: async <T extends number | undefined = undefined>({ index }: { index?: T } = {}) => {
          return _readCartItems(_cards, _getItem, index);
        },
      },
    } as const satisfies d.QuerySchema,
  };
};

// ==========================================
// 🏛️ DOMAIN PRIVATE ACTIONS
// ==========================================

async function _injectBadgeNum(badgeLoc: Locator, count: number): Promise<void> {
  if (await badgeLoc.isVisible()) await badgeLoc.evaluate((el, val) => (el.textContent = val.toString()), count);
}

async function _readCartItems<T extends number | undefined>(
  cardsLoc: Locator,
  getItem: (i: number) => d.ItemLocators,
  index?: T,
): Promise<T extends number ? d.ItemData : d.ItemData[]> {
  // Scrape ALL if index is missing
  if (index === undefined) {
    await cardsLoc.first().waitFor();
    const range = Array.from({ length: await cardsLoc.count() }, (_, i) => i);
    const items = await Promise.all(range.map((i) => c._readItem(getItem(i))));
    return items as T extends number ? d.ItemData : d.ItemData[];
  }

  // Scrape single item if index is number
  const [i] = await c._ensureIndexes(cardsLoc, index);
  const item = await c._readItem(getItem(i));
  return item as T extends number ? d.ItemData : d.ItemData[];
}
