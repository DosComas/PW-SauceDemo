import type { Page, Locator } from '@playwright/test';
import * as c from './core';
import * as d from '@data';
import { t, sampleItem, checkoutInfo } from '@data';

// ==========================================
// 🏛️ DOMAIN TYPES
// ==========================================

type ReadResult<T> = T extends number ? d.ItemData : d.ItemData[];
type PurchaseReadFn = <T extends number | undefined = undefined>(args?: { index?: T }) => Promise<ReadResult<T>>;

type PurchaseSchema = {
  loc: ReturnType<typeof purchaseLocators>;
  act: {
    cart: {
      openCart: () => Promise<void>;
      openItem: (args: { index: number }) => Promise<void>;
      removeFromCart: (args: { indexes: c.IndexSet }) => Promise<void>;
      goBack: () => Promise<void>;
      mockList: (args?: { size?: number }) => Promise<void>;
    };
    checkout: {
      submitInfo: (args?: c.FormPartial<d.CheckoutInfoData>) => Promise<void>;
      openItem: (args: { index: number }) => Promise<void>;
      mockList: (args?: { size?: number }) => Promise<void>;
    };
  };
  query: {
    cart: {
      readItems: PurchaseReadFn;
    };
    checkout: {
      readItems: PurchaseReadFn;
    };
  };
};

// ==========================================
// 🏛️ DOMAIN LOCATORS
// ==========================================

const purchaseLocators = (page: Page) => {
  const _cards = c._itemCard(page);
  const _list = page.getByTestId('cart-list');

  return {
    cart: {
      list: _list,
      items: {
        cards: _cards,
      },
      item: (index: number) => ({
        removeBtn: _cards.nth(index).getByRole('button', { name: t.item.remove }),
        ...c._itemFragment(_cards.nth(index)),
      }),
      backBtn: page.getByRole('button', { name: t.cart.goBack }),
    },
    checkout: {
      checkoutBtn: page.getByRole('button', { name: t.cart.checkout }),
      input: {
        firstName: page.getByPlaceholder(t.checkout.firstName),
        lastName: page.getByPlaceholder(t.checkout.lastName),
        zipCode: page.getByPlaceholder(t.checkout.zipCode),
      } satisfies d.CheckoutInfoLocators,
      list: _list,
      items: {
        cards: _cards,
      },
      item: (index: number) => ({
        ...c._itemFragment(_cards.nth(index)),
      }),
      price: {
        itemTotal: page.getByTestId('subtotal-label'),
        tax: page.getByTestId('tax-label'),
        total: page.getByTestId('total-label'),
      } satisfies d.CheckoutPriceLocators,
      continueBtn: page.getByRole('button', { name: t.checkout.continue }),
      finishBtn: page.getByRole('button', { name: t.checkout.finish }),
    },
  } as const satisfies d.LocatorSchema;
};

// ==========================================
// 🏛️ DOMAIN GATEWAY
// ==========================================

/** Purchase domain: cart locators, actions, and item queries */
export const purchase = (page: Page) => {
  const loc = purchaseLocators(page);
  const { header } = c.layoutLocators(page);

  const _cartCards = loc.cart.items.cards;
  const _getCartItem = (i: number) => loc.cart.item(i);

  const _checkoutCards = loc.checkout.items.cards;
  const _getCheckoutItem = (i: number) => loc.checkout.item(i);

  return {
    loc,
    act: {
      cart: {
        openCart: async () => await header.cart.openBtn.click(),
        openItem: async ({ index }) => await _getCartItem(index).name.click(),
        removeFromCart: async ({ indexes }) => {
          const iis = await c._ensureIndexes(_cartCards, indexes);
          for (const i of iis) await _getCartItem(i).removeBtn.click();
        },
        goBack: async () => await loc.cart.backBtn.click(),
        mockList: async ({ size = 3 } = {}) => {
          const blueprint = _cartCards.first();
          await c._injectText(sampleItem.config, loc.cart.item(0), sampleItem.data);
          await c._injectClones(loc.cart.list, blueprint, size);
          await _injectBadgeNumber(header.cart.badge, size);
        },
      },
      checkout: {
        submitInfo: async (args = {}) => {
          const { skip, ...data } = args;
          const formData = { ...checkoutInfo.generate(), ...data };
          await loc.checkout.checkoutBtn.click();
          await c._fillForm(checkoutInfo.config, loc.checkout.input, formData, skip);
          await loc.checkout.continueBtn.click();
        },
        openItem: async ({ index }) => await _getCheckoutItem(index).name.click(),
        mockList: async ({ size = 3 } = {}) => {
          const blueprint = _checkoutCards.first();
          await c._injectText(
            [...sampleItem.config, ...d.checkoutPrice.config],
            { ...loc.checkout.item(0), ...loc.checkout.price },
            { ...sampleItem.data, ...d.checkoutPrice.data },
          );
          await c._injectClones(loc.checkout.list, blueprint, size);
          await _injectBadgeNumber(header.cart.badge, size);
        },
      },
    },
    query: {
      cart: {
        readItems: async ({ index } = {}) => await _readPurchaseItems(_cartCards, _getCartItem, index),
      },
      checkout: {
        readItems: async ({ index } = {}) => await _readPurchaseItems(_checkoutCards, _getCheckoutItem, index),
      },
    },
  } as const satisfies PurchaseSchema;
};

// ==========================================
// 🏛️ DOMAIN PRIVATE ACTIONS
// ==========================================

async function _injectBadgeNumber(badgeLoc: Locator, count: number): Promise<void> {
  if (await badgeLoc.isVisible()) await badgeLoc.evaluate((el, val) => (el.textContent = val.toString()), count);
}

async function _readPurchaseItems<T extends number | undefined>(
  cardsLoc: Locator,
  getItem: (i: number) => d.ItemLocators,
  index?: T,
): Promise<ReadResult<T>> {
  if (index === undefined) {
    await cardsLoc.first().waitFor();
    const range = Array.from({ length: await cardsLoc.count() }, (_, i) => i);
    const items: d.ItemData[] = await Promise.all(range.map((i) => c._readItem(getItem(i))));
    return items as ReadResult<T>;
  }

  const [i] = await c._ensureIndexes(cardsLoc, index);
  const item: d.ItemData = await c._readItem(getItem(i));
  return item as ReadResult<T>;
}
