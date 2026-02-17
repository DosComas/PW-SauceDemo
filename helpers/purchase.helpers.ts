import { type Page, type Locator } from '@playwright/test';
import { type Header, _getItem } from './common/app.locators';
import { _ensureIndexes, _injectItemText, _injectClones } from './common/app.actions';
import { VISUAL_MOCK } from '@data';

// TYPES

// LOCATORS

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

// DOMAIN ACTIONS

export async function _injectBadgeNum(badgeLoc: Locator, count: number) {
  if (await badgeLoc.isVisible()) {
    await badgeLoc.evaluate((el, val) => (el.textContent = val.toString()), count);
  }
}

// DOMAIN INTERFACE

export const purchase = (page: Page, headerLocs: Header) => {
  const loc = purchaseLocators(page);

  return {
    loc,
    action: {
      cart: {
        open: async () => await headerLocs.cart.openBtn.click(),
        mockList: async ({ size }: { size: number }) => {
          const blueprint = loc.cart.items.cards.first();
          await _injectItemText(loc.cart.item(0), VISUAL_MOCK.product);
          await _injectClones(loc.cart.list, blueprint, size);
          await _injectBadgeNum(headerLocs.cart.badge, size);
        },
      },
    },
  };
};
