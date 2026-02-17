import { type Page, type Locator } from '@playwright/test';
import { _getItem } from './common/app.locators';
import type { IndexInput, ItemTextLocators } from './common/app.actions';
import { _ensureIndexes, _injectItemText, _injectClones } from './common/app.actions';
import { type ItemTextFields, VISUAL_MOCK, SortLabels } from '@data';

// TYPES

export type ItemSortAttribute = Pick<ReturnType<typeof catalogLocators>['plp']['items'], 'names' | 'prices'>;
type ItemLocators = ItemTextLocators & { img: Locator };
type ItemData = ItemTextFields & { imgSrc: string };
type ItemDataMap = Record<number, ItemData>;
type ScrapeResult<T extends IndexInput> = T extends number ? ItemData : ItemDataMap;

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

async function _scrapeItems<T extends IndexInput>(cardsLoc: Locator, getItem: (i: number) => ItemLocators, index: T) {
  const indexes = await _ensureIndexes(cardsLoc, index);
  const itemDataList = await Promise.all(indexes.map((i) => _scrapeItem(getItem(i))));

  if (typeof index === 'number') return itemDataList[0] as ScrapeResult<T>;

  const indexedData: ItemDataMap = {};
  indexes.forEach((originalIndex, arrayPos) => (indexedData[originalIndex] = itemDataList[arrayPos]));

  return indexedData as ScrapeResult<T>;
}

async function _scrapeItem(itemLoc: ItemLocators): Promise<ItemData> {
  const itemData = {
    name: (await itemLoc.name.innerText()).trim(),
    desc: (await itemLoc.desc.innerText()).trim(),
    price: (await itemLoc.price.innerText()).trim(),
    imgSrc: (await itemLoc.img.getAttribute('src')) || '',
  };

  const missing = Object.keys(itemData).filter((k) => !itemData[k as keyof ItemData]);
  if (missing.length > 0) {
    throw new Error(`[_scrapeItem] Missing item data: ${missing.join(', ')}`);
  }

  return itemData;
}

// DOMAIN INTERFACE

export const catalog = (page: Page) => {
  const loc = catalogLocators(page);

  const item = loc.pdp.item;
  const cards = loc.plp.items.cards;
  const getItem = (i: number) => loc.plp.item(i);
  const ensure = async (i: IndexInput) => await _ensureIndexes(cards, i);

  return {
    loc,
    action: {
      plp: {
        scrape: async <T extends IndexInput>({ index }: { index: T }) => {
          return _scrapeItems(cards, getItem, index);
        },
        add: async ({ index }: { index: IndexInput }) => {
          const indexes = await ensure(index);
          for (const i of indexes) await getItem(i).addBtn.click();
        },
        remove: async ({ index }: { index: IndexInput }) => {
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
          await _injectItemText(loc.plp.item(0), VISUAL_MOCK.product);
          await _injectClones(loc.plp.grid, blueprint, size);
        },
      },
      pdp: {
        scrape: async () => await _scrapeItem(item),
        add: async () => await item.addBtn.click(),
        remove: async () => await item.removeBtn.click(),
        back: async () => await loc.pdp.backBtn.click(),
        mockItem: async () => await _injectItemText(item, VISUAL_MOCK.product),
      },
    },
  };
};
