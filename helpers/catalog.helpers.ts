import type { Page, Locator } from '@playwright/test';
import * as c from './core';
import type * as d from '@data';
import { t, sampleItem } from '@data';

// ==========================================
// 🏛️ DOMAIN TYPES
// ==========================================

type ItemDataExtended = d.ItemData & { imgSrc?: string };
type ReadResult<T extends c.IndexSet> = T extends number ? ItemDataExtended : ItemDataExtended[];

type CatalogSchema = {
  loc: ReturnType<typeof catalogLocators>;
  act: {
    plp: {
      addToCart: (args: { indexes: c.IndexSet }) => Promise<void>;
      removeFromCart: (args: { indexes: c.IndexSet }) => Promise<void>;
      openItem: (args: { index: number; via: 'name' | 'img' }) => Promise<void>;
      sortGrid: (args: { option: d.SortOption }) => Promise<void>;
      mockGrid: (args?: { size?: number }) => Promise<void>;
    };
    pdp: {
      addToCart: () => Promise<void>;
      removeFromCart: () => Promise<void>;
      goBack: () => Promise<void>;
      mockItem: () => Promise<void>;
    };
  };
  query: {
    plp: {
      readItems: <T extends c.IndexSet>(args: { indexes: T; imgSrc?: boolean }) => Promise<ReadResult<T>>;
    };
    pdp: {
      readItem: () => Promise<ItemDataExtended>;
    };
  };
};

// ==========================================
// 🏛️ DOMAIN LOCATORS
// ==========================================

const catalogLocators = (page: Page) => {
  const _cards = page.getByTestId('inventory-item');
  const _getImg = (root: Locator | Page) => root.locator('.inventory_item_img').getByRole('img');
  const _getAddBtn = (root: Locator | Page) => root.getByRole('button', { name: t.item.addToCart });
  const _getRemoveBtn = (root: Locator | Page) => root.getByRole('button', { name: t.item.remove });

  return {
    plp: {
      title: page.getByTestId('title'),
      grid: page.getByTestId('inventory-list'),
      sort: page.getByTestId('product-sort-container'),
      items: {
        cards: _cards,
        prices: c._itemFragment(page).price,
        names: c._itemFragment(page).name,
        imgs: _getImg(page),
      } satisfies d.SortableLocators & d.LocatorBundle,
      item: (index: number) => ({
        ...c._itemFragment(_cards.nth(index)),
        img: _getImg(_cards.nth(index)),
        addBtn: _getAddBtn(_cards.nth(index)),
        removeBtn: _getRemoveBtn(_cards.nth(index)),
      }),
    },
    pdp: {
      item: {
        ...c._itemFragment(page),
        img: page.locator('.inventory_details_img_container').getByRole('img'),
        addBtn: _getAddBtn(page),
        removeBtn: _getRemoveBtn(page),
      },
      backBtn: page.getByRole('button', { name: t.pdp.goBack }),
    },
  } as const satisfies d.LocatorSchema;
};

// ==========================================
// 🏛️ DOMAIN GATEWAY
// ==========================================

/** Catalog domain: plp/pdp locators, actions, and item queries */
export const catalog = (page: Page) => {
  const loc = catalogLocators(page);

  const _item = loc.pdp.item;
  const _cards = loc.plp.items.cards;
  const _getItem = (i: number) => loc.plp.item(i);
  const _ensure = async (i: c.IndexSet) => await c._ensureIndexes(_cards, i);

  return {
    loc,
    act: {
      plp: {
        addToCart: async ({ indexes }) => {
          const iis = await _ensure(indexes);
          for (const i of iis) await _getItem(i).addBtn.click();
        },
        removeFromCart: async ({ indexes }) => {
          const iis = await _ensure(indexes);
          for (const i of iis) await _getItem(i).removeBtn.click();
        },
        openItem: async ({ index, via }) => {
          const [i] = await _ensure(index);
          const item = _getItem(i);
          await (via === 'img' ? item.img : item.name).click();
        },
        sortGrid: async ({ option }) => {
          await loc.plp.sort.selectOption({ label: option });
        },
        mockGrid: async ({ size = 5 } = {}) => {
          const blueprint = _cards.first();
          await c._injectText(sampleItem.config, loc.plp.item(0), sampleItem.data);
          await c._injectClones(loc.plp.grid, blueprint, size);
        },
      },
      pdp: {
        addToCart: async () => await _item.addBtn.click(),
        removeFromCart: async () => await _item.removeBtn.click(),
        goBack: async () => await loc.pdp.backBtn.click(),
        mockItem: async () => await c._injectText(sampleItem.config, _item, sampleItem.data),
      },
    },
    query: {
      plp: {
        readItems: async ({ indexes, imgSrc = true }) => {
          return await _readGridItems(_cards, _getItem, indexes, imgSrc);
        },
      },
      pdp: {
        readItem: async () => {
          const itemData = await c._readItem(_item);
          const imgSrc = await _readImgSrc(_item.img);
          return { ...itemData, imgSrc };
        },
      },
    },
  } as const satisfies CatalogSchema;
};

// ==========================================
// 🏛️ DOMAIN PRIVATE ACTIONS
// ==========================================

async function _readGridItems<T extends c.IndexSet>(
  cardsLoc: Locator,
  getItem: (i: number) => d.ItemLocators & { img: Locator },
  indexes: T,
  imgSrc?: boolean,
): Promise<ReadResult<T>> {
  const iis = await c._ensureIndexes(cardsLoc, indexes);

  const items = await Promise.all(
    iis.map(async (i) => {
      const locators = getItem(i);
      const itemData = await c._readItem(locators);

      if (!imgSrc) return itemData;
      else return { ...itemData, imgSrc: await _readImgSrc(locators.img) };
    }),
  );

  return (Array.isArray(indexes) ? items : items[0]) as ReadResult<T>;
}

async function _readImgSrc(imgLoc: Locator): Promise<string> {
  const imgSrc = await imgLoc.getAttribute('src');

  if (!imgSrc) throw new Error(`[_readImgSrc] Missing image source attribute`);

  return imgSrc;
}
