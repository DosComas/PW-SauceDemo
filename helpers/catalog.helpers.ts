import { type Page, type Locator } from '@playwright/test';
import { _getItem } from './common/app.locators';
import * as c from './common/app.actions';
import { VISUAL_MOCK, SortLabels } from '@data';

// TYPES

export type ItemSortAttribute = Pick<ReturnType<typeof catalogLocators>['plp']['items'], 'names' | 'prices'>;

// LOCATORS

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
      },
      item: (index: number) => {
        const root = _cards.nth(index);
        return {
          ..._getItem(root),
          img: _getImg(root),
        };
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

// DOMAIN ACTIONS

async function _scrapeItems<T extends c.IndexInput>(
  cardsLoc: Locator,
  getItem: (i: number) => c.ItemLocators,
  index: T,
  img: boolean = true,
) {
  const indexes = await c._ensureIndexes(cardsLoc, index);
  const itemDataList = await Promise.all(indexes.map((i) => c._scrapeItem(getItem(i), img)));
  return (Array.isArray(index) ? itemDataList : itemDataList[0]) as c.ScrapeResult<T>;
}

// DOMAIN INTERFACE

export const catalog = (page: Page) => {
  const loc = catalogLocators(page);

  const item = loc.pdp.item;
  const cards = loc.plp.items.cards;
  const getItem = (i: number) => loc.plp.item(i);
  const ensure = async (i: c.IndexInput) => await c._ensureIndexes(cards, i);

  return {
    loc,
    action: {
      plp: {
        scrape: async <T extends c.IndexInput>({ index, img = true }: { index: T; img?: boolean }) => {
          return _scrapeItems(cards, getItem, index, img);
        },
        add: async ({ index }: { index: c.IndexInput }) => {
          const indexes = await ensure(index);
          for (const i of indexes) await getItem(i).addBtn.click();
        },
        remove: async ({ index }: { index: c.IndexInput }) => {
          const indexes = await ensure(index);
          for (const i of indexes) await getItem(i).removeBtn.click();
        },
        open: async ({ index, via }: { index: number; via: 'name' | 'img' }) => {
          const [i] = await ensure(index);
          const item = getItem(i);
          await (via === 'img' ? item.img : item.name).click();
        },
        sort: async ({ label }: { label: SortLabels }) => {
          await loc.plp.sort.selectOption(label);
        },
        mockGrid: async ({ size }: { size: number }) => {
          const blueprint = cards.first();
          await c._injectItemText(loc.plp.item(0), VISUAL_MOCK.product);
          await c._injectClones(loc.plp.grid, blueprint, size);
        },
      },
      pdp: {
        scrape: async () => await c._scrapeItem(item),
        add: async () => await item.addBtn.click(),
        remove: async () => await item.removeBtn.click(),
        back: async () => await loc.pdp.backBtn.click(),
        mockItem: async () => await c._injectItemText(item, VISUAL_MOCK.product),
      },
    },
  };
};
