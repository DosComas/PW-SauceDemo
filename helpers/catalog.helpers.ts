import { type Page, type Locator } from '@playwright/test';
import { _appItem } from './common/app.locators';
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
        prices: _appItem(page).price,
        names: _appItem(page).name,
        imgs: _getImg(page),
      },
      item: (index: number) => {
        const root = _plpItems.nth(index);
        return {
          ..._appItem(root),
          img: _getImg(root),
        };
      },
    },
    pdp: {
      item: {
        ..._appItem(page),
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

  return {
    loc,
    action: {
      plp: {
        scrape: async ({ index }: { index: number }) => {
          await _ensureIndexExists(loc.plp.items.all, index);
          return _scrapeItemData(loc.plp.item(index));
        },
        open: async ({ index, via }: { index: number; via: 'name' | 'img' }) => {
          await _ensureIndexExists(loc.plp.items.all, index);
          const item = loc.plp.item(index);
          const target = via === 'img' ? item.img : item.name;
          await target.click();
        },
        add: async ({ index }: { index: number }) => {
          await _ensureIndexExists(loc.plp.items.all, index);
          await loc.plp.item(index).addBtn.click();
        },
        remove: async ({ index }: { index: number }) => {
          await _ensureIndexExists(loc.plp.items.all, index);
          await loc.plp.item(index).removeBtn.click();
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
        scrape: async () => await _scrapeItemData(loc.pdp.item),
        mockItem: async () => await _injectItemText(loc.pdp.item, VISUAL_MOCK.product),
        add: async () => await loc.pdp.item.addBtn.click(),
        remove: async () => await loc.pdp.item.removeBtn.click(),
        back: async () => await loc.pdp.backBtn.click(),
      },
    },
  };
};
