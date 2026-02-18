import type { Page, Locator } from '@playwright/test';
import { _getItem } from './common/app.locators';
import * as c from './common/app.actions';
import { VISUAL_MOCK } from '@data';
import type { SortOption, ItemLocators, SortableLocators } from '@data';

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
        prices: _getItem(page).price,
        names: _getItem(page).name,
        imgs: _getImg(page),
      } satisfies SortableLocators & Record<string, Locator>,
      item: (index: number) => {
        const root = _cards.nth(index);
        return { ..._getItem(root), img: _getImg(root) };
      },
    },
    pdp: {
      item: {
        ..._getItem(page),
        img: page.locator('.inventory_details_img_container').getByRole('img'),
      },
      backBtn: page.getByTestId('back-to-products'),
    },
  };
};

// ==========================================
// 🏛️ DOMAIN ACTIONS
// ==========================================

export const catalog = (page: Page) => {
  const loc = catalogLocators(page);

  const _item = loc.pdp.item;
  const _cards = loc.plp.items.cards;
  const _getItem = (i: number) => loc.plp.item(i);
  const _ensure = async (i: c.IndexInput) => await c._ensureIndexes(_cards, i);

  return {
    loc,
    action: {
      plp: {
        scrape: async <T extends c.IndexInput>({ index, img = true }: { index: T; img?: boolean }) => {
          return _scrapeItems(_cards, _getItem, index, img);
        },
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
        scrape: async () => await c._scrapeItem(_item),
        add: async () => await _item.addBtn.click(),
        remove: async () => await _item.removeBtn.click(),
        back: async () => await loc.pdp.backBtn.click(),
        mockItem: async () => await c._injectItemText(_item, VISUAL_MOCK.product),
      },
    },
  };
};

// ==========================================
// 🏛️ DOMAIN PRIVATE ACTIONS
// ==========================================

async function _scrapeItems<T extends c.IndexInput>(
  cardsLoc: Locator,
  getItem: (i: number) => ItemLocators,
  index: T,
  imgSrc: boolean = true,
) {
  const indexes = await c._ensureIndexes(cardsLoc, index);
  const itemDataList = await Promise.all(indexes.map((i) => c._scrapeItem(getItem(i), imgSrc)));
  return (Array.isArray(index) ? itemDataList : itemDataList[0]) as c.ScrapeResult<T>;
}
