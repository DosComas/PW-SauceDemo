import type { Page, Locator } from '@playwright/test';
import * as c from './core';
import type * as d from '@data';
import { VISUAL_MOCK } from '@data';

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
      item: (index: number) => {
        const root = _cards.nth(index);
        const { name, desc, price } = c._itemFragment(root);
        return { name, desc, price };
      },
    } as const satisfies d.LocSchema,
  };
};

// ==========================================
// 🏛️ DOMAIN GATEWAY
// ==========================================

export const purchase = (page: Page) => {
  const loc = purchaseLocators(page);
  const { header } = c.layoutLocators(page);

  const _cards = loc.cart.items.cards;
  const _getItem = (i: number) => loc.cart.item(i);

  return {
    loc,
    act: {
      cart: {
        open: async () => await header.cart.openBtn.click(),
        mockList: async ({ size = 3 }: { size?: number } = {}) => {
          const blueprint = loc.cart.items.cards.first();
          await c._injectItemText(loc.cart.item(0), VISUAL_MOCK.item);
          await c._injectClones(loc.cart.list, blueprint, size);
          await _injectBadgeNum(header.cart.badge, size);
        },
      },
    } as const satisfies d.ActSchema,
    query: {
      cart: {
        items: async () => await _readItems(_cards, _getItem),
      },
    } as const satisfies d.QuerySchema,
  };
};

// ==========================================
// 🏛️ DOMAIN PRIVATE ACTIONS
// ==========================================

async function _readItems(cardsLoc: Locator, getItem: (i: number) => d.ItemLocators): Promise<d.ItemData[]> {
  await cardsLoc.first().waitFor();
  const count = await cardsLoc.count();
  const range = Array.from({ length: count }, (_, i) => i);
  return await Promise.all(range.map((i) => c._readItem(getItem(i))));
}

async function _injectBadgeNum(badgeLoc: Locator, count: number): Promise<void> {
  if (await badgeLoc.isVisible()) await badgeLoc.evaluate((el, val) => (el.textContent = val.toString()), count);
}
