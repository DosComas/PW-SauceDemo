import type { Page, Locator } from '@playwright/test';
import * as c from './core';
import type { SortOption, ItemLocators, SortableLocators } from '@data';
import { VISUAL_MOCK } from '@data';

// ==========================================
// 🏛️ DOMAIN LOCATORS
// ==========================================

const catalogLocators = (page: Page) => {
  const _cards = page.getByTestId('inventory-item');
  const _getImg = (root: Locator | Page) => root.locator('.inventory_item_img').getByRole('img');

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
      } satisfies SortableLocators & Record<string, Locator>,
      item: (index: number) => {
        const root = _cards.nth(index);
        return { ...c._itemFragment(root), img: _getImg(root) };
      },
    },
    pdp: {
      item: {
        ...c._itemFragment(page),
        img: page.locator('.inventory_details_img_container').getByRole('img'),
      },
      backBtn: page.getByTestId('back-to-products'),
    },
  } as const;
};

// ==========================================
// 🏛️ DOMAIN GATEWAY
// ==========================================

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
        add: async ({ index }: { index: c.IndexInput }) => {
          const indexes = await _ensure(index);
          for (const i of indexes) await _getItem(i).addBtn.click();
        },
        remove: async ({ index }: { index: c.IndexInput }) => {
          const indexes = await _ensure(index);
          for (const i of indexes) await _getItem(i).removeBtn.click();
        },
        open: async ({ index, via }: { index: number; via: 'name' | 'img' }) => {
          const [i] = await _ensure(index);
          const item = _getItem(i);
          await (via === 'img' ? item.img : item.name).click();
        },
        sort: async ({ label }: { label: SortOption }) => {
          await loc.plp.sort.selectOption(label);
        },
        mockGrid: async ({ size = 5 }: { size?: number } = {}) => {
          const blueprint = _cards.first();
          await c._injectItemText(loc.plp.item(0), VISUAL_MOCK.product);
          await c._injectClones(loc.plp.grid, blueprint, size);
        },
      },
      pdp: {
        add: async () => await _item.addBtn.click(),
        remove: async () => await _item.removeBtn.click(),
        goBack: async () => await loc.pdp.backBtn.click(),
        mockItem: async () => await c._injectItemText(_item, VISUAL_MOCK.product),
      },
    },
    query: {
      plp: {
        items: async <T extends c.IndexInput>({ index, imgSrc = true }: { index: T; imgSrc?: boolean }) => {
          return _readItems(_cards, _getItem, index, { imgSrc });
        },
      },
      pdp: {
        item: async () => await c._readItem(_item),
      },
    },
  } as const;
};

// ==========================================
// 🏛️ DOMAIN PRIVATE ACTIONS
// ==========================================

async function _readItems<T extends c.IndexInput>(
  cardsLoc: Locator,
  getItem: (i: number) => ItemLocators,
  index: T,
  options?: { imgSrc?: boolean },
): Promise<c.ReadResult<T>> {
  const indexes = await c._ensureIndexes(cardsLoc, index);
  const items = await Promise.all(indexes.map((i) => c._readItem(getItem(i), options)));

  return (Array.isArray(index) ? items : items[0]) as c.ReadResult<T>;
}
