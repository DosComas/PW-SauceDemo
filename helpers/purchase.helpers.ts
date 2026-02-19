import type { Page, Locator } from '@playwright/test';
import { _itemFragment } from './core/fragments.core';
import { layoutLocators } from './core/layout.core';
import * as c from './core/logic.core';
import { type ItemLocators, VISUAL_MOCK } from '@data';

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
        const { name, desc, price } = _itemFragment(root);
        return { name, desc, price };
      },
    },
  };
};

// ==========================================
// 🏛️ DOMAIN GATEWAY
// ==========================================

export const purchase = (page: Page) => {
  const loc = purchaseLocators(page);
  const { header } = layoutLocators(page);

  const _cards = loc.cart.items.cards;
  const _getItem = (i: number) => loc.cart.item(i);

  return {
    loc,
    action: {
      cart: {
        scrape: async () => _scrapeAllItems(_cards, _getItem),
        open: async () => await header.cart.openBtn.click(),
        mockList: async ({ size = 3 }: { size?: number } = {}) => {
          const blueprint = loc.cart.items.cards.first();
          await c._injectItemText(loc.cart.item(0), VISUAL_MOCK.product);
          await c._injectClones(loc.cart.list, blueprint, size);
          await _injectBadgeNum(header.cart.badge, size);
        },
      },
    },
  };
};

// ==========================================
// 🏛️ DOMAIN PRIVATE ACTIONS
// ==========================================

async function _scrapeAllItems(cardsLoc: Locator, getItem: (i: number) => ItemLocators) {
  await cardsLoc.first().waitFor();
  const count = await cardsLoc.count();
  const range = Array.from({ length: count }, (_, i) => i);
  return await Promise.all(range.map((i) => c._scrapeItem(getItem(i))));
}

async function _injectBadgeNum(badgeLoc: Locator, count: number) {
  if (await badgeLoc.isVisible()) await badgeLoc.evaluate((el, val) => (el.textContent = val.toString()), count);
}
