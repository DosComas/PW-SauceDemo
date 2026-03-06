import type { Page, Locator } from '@playwright/test';
import * as c from './core';
import type * as d from '@data';
import { t, sampleItem, checkoutInfo, checkoutTotals } from '@data';

// ==========================================
// 🏛️ DOMAIN SCHEMA
// ==========================================

type PurchaseSchema = {
  loc: ReturnType<typeof purchaseLocators>;
  act: {
    cart: {
      /** Performs the opening of the shopping cart page. */
      openCart: () => Promise<void>;

      /** Performs the navigation to an item's detail page from the cart. */
      openItem: (args: { index: number }) => Promise<void>;

      /** Performs the removal of items from the cart list. */
      removeFromCart: (args: { indexes: number[] }) => Promise<void>;

      /** Performs the navigation back to the PLP page. */
      goBack: () => Promise<void>;

      /** Performs the initiation of the checkout process. */
      startCheckout: () => Promise<void>;

      /** Performs the UI injection of mock items into the cart list. */
      mockList: (args?: { size?: number }) => Promise<void>;
    };
    checkout: {
      /** Performs the submission of the checkout user information form. */
      submitInfo: (args?: c.FormPartial<d.CheckoutInfoData>) => Promise<void>;

      /** Performs the navigation to an item's detail page from the checkout summary. */
      openItem: (args: { index: number }) => Promise<void>;

      /** Performs the final submission to complete the order. */
      completeOrder: () => Promise<void>;

      /** Performs the UI injection of mock items into the checkout summary. */
      mockList: (args?: { size?: number }) => Promise<void>;
    };
  };
  query: {
    cart: {
      /** Retrieves item data from the shopping cart list. */
      readItems: (args?: { index?: number }) => Promise<d.ItemData[]>;
    };
    checkout: {
      /** Retrieves item data from the checkout summary. */
      readItems: (args?: { index?: number }) => Promise<d.ItemData[]>;

      /** Retrieves price total data from the checkout summary. */
      readTotals: () => Promise<d.CheckoutTotalsData>;

      /** Retrieves the expected price totals based on a provided list of items. */
      calculateTotals: (args: { items: d.ItemData[] }) => d.CheckoutTotalsData;
    };
  };
};

// ==========================================
// 🏛️ DOMAIN LOCATORS
// ==========================================

const purchaseLocators = (page: Page) => {
  const _cardsLoc = c._cardFragment(page);
  const _listLoc = page.getByTestId('cart-list');

  return {
    cart: {
      list: _listLoc,
      items: {
        cards: _cardsLoc,
      },
      item: (index: number) => ({
        removeBtn: _cardsLoc.nth(index).getByRole('button', { name: t.item.remove }),
        ...c._itemFragment(_cardsLoc.nth(index)),
      }),
      backBtn: page.getByRole('button', { name: t.cart.continueShopping }),
      checkoutBtn: page.getByRole('button', { name: t.cart.checkout }),
    },
    checkout: {
      title: page.getByTestId('secondary-header'),
      infoInput: {
        firstName: page.getByPlaceholder(t.checkout.info.form.firstName),
        lastName: page.getByPlaceholder(t.checkout.info.form.lastName),
        zipCode: page.getByPlaceholder(t.checkout.info.form.zipCode),
      } satisfies d.CheckoutInfoLocators,
      infoError: page.getByTestId('error'),
      list: _listLoc,
      items: {
        cards: _cardsLoc,
      },
      item: (index: number) => ({
        ...c._itemFragment(_cardsLoc.nth(index)),
      }),
      price: {
        itemTotal: page.getByTestId('subtotal-label'),
        tax: page.getByTestId('tax-label'),
        total: page.getByTestId('total-label'),
      } satisfies d.CheckoutTotalsLocators,
      continueBtn: page.getByRole('button', { name: t.checkout.info.continue }),
      finishBtn: page.getByRole('button', { name: t.checkout.overview.finish }),
      complete: {
        container: page.getByTestId('checkout-complete-container'),
        header: page.getByTestId('complete-header'),
      },
    },
  } as const satisfies d.LocatorSchema;
};

// ==========================================
// 🏛️ DOMAIN GATEWAY
// ==========================================

export const purchase = (page: Page): PurchaseSchema => {
  const loc = purchaseLocators(page);
  const headerLoc = c.layoutLocators(page).header;

  const _cartCardsLoc = loc.cart.items.cards;
  const _getCartItem = (i: number) => loc.cart.item(i);

  const _checkoutCardsLoc = loc.checkout.items.cards;
  const _getCheckoutItem = (i: number) => loc.checkout.item(i);

  return {
    loc,
    act: {
      cart: {
        openCart: async () => await headerLoc.cart.openBtn.click(),
        openItem: async ({ index }) => await _getCartItem(index).name.click(),
        removeFromCart: async ({ indexes }) => {
          await c._ensureIndexes(_cartCardsLoc, indexes);
          for (const i of indexes) await _getCartItem(i).removeBtn.click();
        },
        goBack: async () => await loc.cart.backBtn.click(),
        startCheckout: async () => await loc.cart.checkoutBtn.click(),
        mockList: async ({ size = 3 } = {}) => {
          const blueprint = _cartCardsLoc.first();
          await c._injectText(sampleItem.config, loc.cart.item(0), sampleItem.data);
          await c._injectClones(loc.cart.list, blueprint, size);
          await _injectBadgeNumber(headerLoc.cart.badge, size);
        },
      },
      checkout: {
        submitInfo: async (args = {}) => {
          const { skip, ...data } = args;
          const formData = { ...checkoutInfo.generate(), ...data };
          await c._fillForm(checkoutInfo.config, loc.checkout.infoInput, formData, skip);
          await loc.checkout.continueBtn.click();
        },
        openItem: async ({ index }) => await _getCheckoutItem(index).name.click(),
        completeOrder: async () => loc.checkout.finishBtn.click(),
        mockList: async ({ size = 3 } = {}) => {
          const blueprint = _checkoutCardsLoc.first();
          await c._injectText(
            [...sampleItem.config, ...checkoutTotals.config],
            { ...loc.checkout.item(0), ...loc.checkout.price },
            { ...sampleItem.data, ...checkoutTotals.data },
          );
          await c._injectClones(loc.checkout.list, blueprint, size);
          await _injectBadgeNumber(headerLoc.cart.badge, size);
        },
      },
    },
    query: {
      cart: {
        readItems: async ({ index } = {}) => await _readPurchaseItems(_cartCardsLoc, _getCartItem, index),
      },
      checkout: {
        readItems: async ({ index } = {}) => await _readPurchaseItems(_checkoutCardsLoc, _getCheckoutItem, index),
        readTotals: async () => await c._readTextFields(checkoutTotals.config, loc.checkout.price),
        calculateTotals: ({ items }) => {
          const itemTotal = items.reduce((sum, item) => sum + item.price, 0);
          const tax = Number((itemTotal * 0.08).toFixed(2)); // Assuming 8% (not hard coded)
          return { itemTotal, tax, total: Number((itemTotal + tax).toFixed(2)) };
        },
      },
    },
  } as const;
};

// ==========================================
// 🏛️ DOMAIN PRIVATE ACTIONS
// ==========================================

async function _injectBadgeNumber(badgeLoc: Locator, count: number): Promise<void> {
  if (await badgeLoc.isVisible()) await badgeLoc.evaluate((el, val) => (el.textContent = val.toString()), count);
}

async function _readPurchaseItems(
  cardsLoc: Locator,
  getItem: (i: number) => d.ItemLocators,
  index?: number,
): Promise<d.ItemData[]> {
  const readItem = async (i: number) => await c._readTextFields(sampleItem.config, getItem(i));

  if (index == null) {
    await cardsLoc.first().waitFor();
    const range = Array.from({ length: await cardsLoc.count() }, (_, i) => i);
    return await Promise.all(range.map((i) => readItem(i)));
  }

  await c._ensureIndexes(cardsLoc, [index]);
  return [await readItem(index)];
}
