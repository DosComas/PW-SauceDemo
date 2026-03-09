import { type Page, type Locator, expect } from '@playwright/test';
import * as c from './core';
import type * as d from '@data';
import { t, sampleItem, catalogSnapshots } from '@data';

// ==========================================
// 🏛️ DOMAIN SCHEMA
// ==========================================

type CatalogSchema = {
  loc: ReturnType<typeof catalogLocators>;

  act: {
    plp: {
      /** Performs the addition of multiple items to the cart via the PLP grid. */
      addToCart: (args: { indexes: number[] }) => Promise<void>;

      /** Performs the removal of multiple items from the cart via the PLP grid. */
      removeFromCart: (args: { indexes: number[] }) => Promise<void>;

      /** Performs the navigation to an item's detail page via a specific element. */
      openItem: (args: { index: number; via: 'name' | 'img' }) => Promise<void>;

      /** Performs the selection of a sorting option for the PLP grid. */
      sortGrid: (args: { sortBy: d.SortOption }) => Promise<void>;

      /** Performs the UI injection of mock items into the PLP grid. */
      mockGrid: (args?: { size?: number }) => Promise<void>;
    };
    pdp: {
      /** Performs the addition of the current item to the cart via the PDP. */
      addToCart: () => Promise<void>;

      /** Performs the removal of the current item from the cart via the PDP. */
      removeFromCart: () => Promise<void>;

      /** Performs the navigation back to the PLP page. */
      goBack: () => Promise<void>;

      /** Performs the UI injection of mock data into the PDP item. */
      mockItem: () => Promise<void>;
    };
  };

  query: {
    plp: {
      /** Retrieves the data for specific items from the PLP grid. */
      readItems: (args: { indexes: number[]; imgSrc?: boolean }) => Promise<d.ItemData[]>;
    };
    pdp: {
      /** Retrieves the data for the currently displayed item on the PDP. */
      readItem: () => Promise<(d.ItemData & { imgSrc?: string })[]>;
    };
  };

  aria: {
    /** Performs ARIA snapshot validation for the full PLP page. */
    plp: (args: { itemCount: number; sortBy: d.SortOption; itemsInCart: readonly number[] }) => Promise<void>;

    /** Performs ARIA snapshot validation for the full PDP page. */
    pdp: (args: { itemCount: number; inCart: boolean }) => Promise<void>;
  };
};

// ==========================================
// 🏛️ DOMAIN LOCATORS
// ==========================================

const catalogLocators = (page: Page) => {
  const _cardsLoc = c._cardFragment(page);
  const _getImg = (root: Locator | Page) => root.locator('.inventory_item_img').getByRole('img');
  const _getAddBtn = (root: Locator | Page) => root.getByRole('button', { name: t.item.addToCart });
  const _getRemoveBtn = (root: Locator | Page) => root.getByRole('button', { name: t.item.remove });

  return {
    plp: {
      title: page.getByTestId('title'),
      grid: page.getByTestId('inventory-list'),
      sort: page.getByTestId('product-sort-container'),
      items: {
        cards: _cardsLoc,
        prices: c._itemFragment(page).price,
        names: c._itemFragment(page).name,
        imgs: _getImg(page),
      } satisfies d.SortableLocators & d.LocatorBundle,
      item: (index: number) => ({
        ...c._itemFragment(_cardsLoc.nth(index)),
        img: _getImg(_cardsLoc.nth(index)),
        addBtn: _getAddBtn(_cardsLoc.nth(index)),
        removeBtn: _getRemoveBtn(_cardsLoc.nth(index)),
      }),
    },
    pdp: {
      item: {
        card: _cardsLoc.first(),
        ...c._itemFragment(page),
        img: page.locator('.inventory_details_img_container').getByRole('img'),
        addBtn: _getAddBtn(page),
        removeBtn: _getRemoveBtn(page),
      },
      backBtn: page.getByRole('button', { name: t.pdp.goBackToProducts }),
    },
  } as const satisfies d.LocatorSchema;
};

// ==========================================
// 🏛️ DOMAIN GATEWAY
// ==========================================

export const catalog = (page: Page): CatalogSchema => {
  const loc = catalogLocators(page);
  const aria = c.layout(page).aria;

  const _itemLoc = loc.pdp.item;
  const _cardsLoc = loc.plp.items.cards;
  const _getItem = (i: number) => loc.plp.item(i);
  const _ensure = async (i: number[]) => await c._ensureIndexes(_cardsLoc, i);

  return {
    loc,
    act: {
      plp: {
        addToCart: async ({ indexes }) => {
          await _ensure(indexes);
          for (const i of indexes) await _getItem(i).addBtn.click();
        },
        removeFromCart: async ({ indexes }) => {
          await _ensure(indexes);
          for (const i of indexes) await _getItem(i).removeBtn.click();
        },
        openItem: async ({ index, via }) => {
          await _ensure([index]);
          const itemLoc = _getItem(index);
          await (via === 'img' ? itemLoc.img : itemLoc.name).click();
        },
        sortGrid: async ({ sortBy }) => {
          await loc.plp.sort.selectOption({ label: t.plp.sort[sortBy] });
        },
        mockGrid: async ({ size = 5 } = {}) => {
          const blueprint = _cardsLoc.first();
          await c._injectText(sampleItem.config, loc.plp.item(0), sampleItem.data);
          await c._injectClones(loc.plp.grid, blueprint, size);
        },
      },
      pdp: {
        addToCart: async () => await _itemLoc.addBtn.click(),
        removeFromCart: async () => await _itemLoc.removeBtn.click(),
        goBack: async () => await loc.pdp.backBtn.click(),
        mockItem: async () => await c._injectText(sampleItem.config, _itemLoc, sampleItem.data),
      },
    },
    query: {
      plp: {
        readItems: async ({ indexes, imgSrc = true }) => {
          await c._ensureIndexes(_cardsLoc, indexes);
          return await Promise.all(indexes.map(async (i) => await _readCatalogItem(_getItem(i), imgSrc)));
        },
      },
      pdp: {
        readItem: async () => {
          return [await _readCatalogItem(_itemLoc, true)];
        },
      },
    },
    aria: {
      plp: async ({ itemCount, sortBy, itemsInCart }) => {
        const content = catalogSnapshots.plp;
        await aria.expectPrimary({ itemCount });
        await aria.expectSecondary({ snapshot: content.titleAndSort({ sortBy }) });
        for (const [i, card] of (await _cardsLoc.all()).entries()) {
          const inCart = itemsInCart.includes(i);
          await expect(card, `PLP item ${i} ARIA snapshot`).toMatchAriaSnapshot(content.item({ inCart }));
        }
        await aria.expectFooter();
      },
      pdp: async ({ itemCount, inCart }) => {
        const content = catalogSnapshots.pdp;
        await aria.expectPrimary({ itemCount });
        await aria.expectSecondary({ snapshot: content.goBack });
        await expect(_itemLoc.card, 'PDP item ARIA snapshot').toMatchAriaSnapshot(content.item({ inCart }));
        await aria.expectFooter();
      },
    },
  } as const;
};

// ==========================================
// 🏛️ DOMAIN PRIVATE ACTIONS
// ==========================================

async function _readCatalogItem(
  locators: d.ItemLocators & { img: Locator },
  imgSrc?: boolean,
): Promise<d.ItemData & { imgSrc?: string }> {
  const item = await c._readTextFields(sampleItem.config, locators);

  if (!imgSrc) return item;
  return { ...item, imgSrc: await _readImgSrc(locators.img) };
}

async function _readImgSrc(imgLoc: Locator): Promise<string> {
  const imgSrc = await imgLoc.getAttribute('src');

  if (!imgSrc) throw new Error(`[_readImgSrc] Missing image source attribute`);
  return imgSrc;
}
