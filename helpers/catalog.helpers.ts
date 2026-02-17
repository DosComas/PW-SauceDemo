import { type Page, type Locator } from '@playwright/test';
import { _itemLocs } from './common/app.locators';
import { type ItemTextLocators, _ensureIndexExists, _injectItemText, _injectClones } from './common/app.actions';
import { VISUAL_MOCK, SortLabels } from '@data';

// TYPES

export type ItemSortAttribute = Pick<ReturnType<typeof catalogLocators>['plp']['items'], 'names' | 'prices'>;

// LOCATORS

const catalogLocators = (page: Page) => {
  const _plpItems = page.getByTestId('inventory-item');
  const _getImg = (root: Locator | Page) => root.locator('.inventory_item_img').getByRole('img');

  return {
    plp: {
      title: page.getByTestId('title'),
      list: page.getByTestId('inventory-list'),
      sort: page.getByTestId('product-sort-container'),
      items: {
        all: _plpItems,
        prices: _itemLocs(page).price,
        names: _itemLocs(page).name,
        imgs: _getImg(page),
      },
      item: (index: number) => {
        const root = _plpItems.nth(index);
        return {
          ..._itemLocs(root),
          img: _getImg(root),
        };
      },
    },
    pdp: {
      item: {
        ..._itemLocs(page),
        img: page.locator('.inventory_details_img_container').getByRole('img'),
      },
      backBtn: page.getByTestId('back-to-products'),
    },
  };
};

// DOMAIN ACTIONS

async function _scrapeItemData(itemLoc: ItemTextLocators & { img: Locator }) {
  const values = {
    name: (await itemLoc.name.innerText()).trim(),
    desc: (await itemLoc.desc.innerText()).trim(),
    price: (await itemLoc.price.innerText()).trim(),
    imgSrc: (await itemLoc.img.getAttribute('src')) || '',
  };

  const missingKeys = Object.keys(values).filter((key) => !values[key as keyof typeof values]);
  if (missingKeys.length > 0) {
    throw new Error(`[_scrapeItemData] Item content missing values: ${missingKeys.join(', ')}`);
  }

  return values;
}

// DOMAIN INTERFACE

export const catalog = (page: Page) => {
  const loc = catalogLocators(page);
  const _plpItem = (i: number) => loc.plp.item(i);
  const _plpEnsure = async (i: number) => await _ensureIndexExists(loc.plp.items.all, i);
  const _pdpItem = loc.pdp.item;

  return {
    loc,
    action: {
      plp: {
        scrape: async ({ index }: { index: number }) => {
          await _plpEnsure(index);
          return _scrapeItemData(_plpItem(index));
        },
        open: async ({ index, via }: { index: number; via: 'name' | 'img' }) => {
          await _plpEnsure(index);
          const item = _plpItem(index);
          const target = via === 'img' ? item.img : item.name;
          await target.click();
        },
        add: async ({ index }: { index: number }) => {
          await _plpEnsure(index);
          await _plpItem(index).addBtn.click();
        },
        remove: async ({ index }: { index: number }) => {
          await _plpEnsure(index);
          await _plpItem(index).removeBtn.click();
        },
        sort: async ({ label }: { label: SortLabels }) => {
          await loc.plp.sort.selectOption(label);
        },
        mockGrid: async ({ size }: { size: number }) => {
          const blueprint = loc.plp.items.all.first();
          await _ensureIndexExists(blueprint, 0);
          await _injectItemText(loc.plp.item(0), VISUAL_MOCK.product);
          await _injectClones(loc.plp.list, blueprint, size);
        },
      },
      pdp: {
        scrape: async () => await _scrapeItemData(_pdpItem),
        mockItem: async () => await _injectItemText(_pdpItem, VISUAL_MOCK.product),
        add: async () => await _pdpItem.addBtn.click(),
        remove: async () => await _pdpItem.removeBtn.click(),
        back: async () => await loc.pdp.backBtn.click(),
      },
    },
  };
};
