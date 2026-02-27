import type { Page, Locator } from '@playwright/test';
import * as c from './core';
import type * as d from '@data';
import { t, sampleItem } from '@data';

type FullItemData = d.ItemData & { imgSrc?: string };
type ReadResult<T extends c.IndexInput> = T extends number ? FullItemData : FullItemData[];

// ==========================================
// 🏛️ DOMAIN LOCATORS
// ==========================================

const catalogLocators = (page: Page) => {
  const _cards = page.getByTestId('inventory-item');
  const _getImg = (root: Locator | Page) => root.locator('.inventory_item_img').getByRole('img');
  const _getAddBtn = (root: Locator | Page) => root.getByRole('button', { name: t.item.addToCart });

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
      }),
    },
    pdp: {
      item: {
        ...c._itemFragment(page),
        img: page.locator('.inventory_details_img_container').getByRole('img'),
        addBtn: _getAddBtn(page),
      },
      backBtn: page.getByRole('button', { name: t.pdp.goBack }),
    },
  } as const satisfies d.LocSchema;
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
  const _ensure = async (i: c.IndexInput) => await c._ensureIndexes(_cards, i);

  return {
    loc,
    act: {
      plp: {
        addToCart: async ({ index }: { index: c.IndexInput }) => {
          const indexes = await _ensure(index);
          for (const i of indexes) await _getItem(i).addBtn.click();
        },
        removeFromCart: async ({ index }: { index: c.IndexInput }) => {
          const indexes = await _ensure(index);
          for (const i of indexes) await _getItem(i).removeBtn.click();
        },
        openItem: async ({ index, via }: { index: number; via: 'name' | 'img' }) => {
          const [i] = await _ensure(index);
          const item = _getItem(i);
          await (via === 'img' ? item.img : item.name).click();
        },
        sortGrid: async ({ option }: { option: d.SortOption }) => {
          await loc.plp.sort.selectOption(option);
        },
        mockGrid: async ({ size = 5 }: { size?: number } = {}) => {
          const blueprint = _cards.first();
          await c._injectItemText(loc.plp.item(0), sampleItem.data);
          await c._injectClones(loc.plp.grid, blueprint, size);
        },
      },
      pdp: {
        addToCart: async () => await _item.addBtn.click(),
        removeFromCart: async () => await _item.removeBtn.click(),
        goBack: async () => await loc.pdp.backBtn.click(),
        mockItem: async () => await c._injectItemText(_item, sampleItem.data),
      },
    } as const satisfies d.ActSchema,
    query: {
      plp: {
        readItems: async <T extends c.IndexInput>({ index, imgSrc = true }: { index: T; imgSrc?: boolean }) => {
          return await _readGridItems(_cards, _getItem, index, imgSrc);
        },
      },
      pdp: {
        readItem: async () => {
          const itemData = await c._readItem(_item);
          const imgSrc = await _readImgSrc(_item.img);
          return { ...itemData, imgSrc } satisfies FullItemData;
        },
      },
    } as const satisfies d.QuerySchema,
  };
};

// ==========================================
// 🏛️ DOMAIN PRIVATE ACTIONS
// ==========================================

async function _readGridItems<T extends c.IndexInput>(
  cardsLoc: Locator,
  getItem: (i: number) => d.ItemLocators & { img: Locator },
  index: T,
  imgSrc?: boolean,
): Promise<ReadResult<T>> {
  const indexes = await c._ensureIndexes(cardsLoc, index);

  const items = await Promise.all(
    indexes.map(async (i) => {
      const locators = getItem(i);
      const itemData = await c._readItem(locators);

      if (!imgSrc) return itemData;
      else return { ...itemData, imgSrc: await _readImgSrc(locators.img) };
    }),
  );

  return (Array.isArray(index) ? items : items[0]) as ReadResult<T>;
}

async function _readImgSrc(imgLoc: Locator): Promise<string> {
  const imgSrc = await imgLoc.getAttribute('src');

  if (!imgSrc) throw new Error(`[_readImgSrc] Missing image source attribute`);

  return imgSrc;
}
