import { type Page, type Locator } from '@playwright/test';
import { type Header, _appHeader, _appItem } from './common/app.locators';
import { _ensureIndexExists, _injectItemText, _injectClones } from './common/app.actions';
import { VISUAL_MOCK } from '@data';

// TYPES

// LOCATORS

export const purchaseLocators = (page: Page) => {
  const _cartItems = page.locator('.cart_item');

  return {
    cart: {
      list: page.getByTestId('cart-list'),
      items: {
        all: _cartItems,
      },
      item: (index: number) => {
        const { name, desc, price } = _appItem(_cartItems.nth(index));
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
        mockList: async ({ size }: { size: number }) => {
          const blueprint = loc.cart.items.all.first();
          await _ensureIndexExists(blueprint, 0);
          await _injectItemText(loc.cart.item(0), VISUAL_MOCK.product);
          await _injectClones(loc.cart.list, blueprint, size);
          await _injectBadgeNum(headerLocs.cartBadge, size);
        },
      },
    },
  };
};
