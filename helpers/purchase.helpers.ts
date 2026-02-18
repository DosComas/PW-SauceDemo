import type { Page, Locator } from '@playwright/test';
import { type Header, _getItem } from './common/app.locators';
import * as c from './common/app.actions';
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
        const { name, desc, price } = _getItem(root);
        return { name, desc, price };
      },
    },
  };
};

// ==========================================
// 🏛️ DOMAIN ACTIONS
// ==========================================

export const purchase = (page: Page, headerLocs: Header) => {
  const loc = purchaseLocators(page);

  const cards = loc.cart.items.cards;
  const getItem = (i: number) => loc.cart.item(i);

  return {
    loc,
    action: {
      cart: {
        scrape: async () => _scrapeAllItems(cards, getItem),
        open: async () => await headerLocs.cart.openBtn.click(),
        mockList: async ({ size = 3 }: { size?: number } = {}) => {
          const blueprint = loc.cart.items.cards.first();
          await c._injectItemText(loc.cart.item(0), VISUAL_MOCK.product);
          await c._injectClones(loc.cart.list, blueprint, size);
          await _injectBadgeNum(headerLocs.cart.badge, size);
        },
      },
    },
  };
};

// ==========================================
// 🏛️ DOMAIN PRIVATE ACTIONS
// ==========================================

async function _scrapeAllItems(cardsLoc: Locator, getItem: (i: number) => c.ItemLocators) {
  await cardsLoc.first().waitFor();
  const count = await cardsLoc.count();
  const range = Array.from({ length: count }, (_, i) => i);
  return await Promise.all(range.map((i) => c._scrapeItem(getItem(i))));
}

async function _injectBadgeNum(badgeLoc: Locator, count: number) {
  if (await badgeLoc.isVisible()) {
    await badgeLoc.evaluate((el, val) => (el.textContent = val.toString()), count);
  }
}
