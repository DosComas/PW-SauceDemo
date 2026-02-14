import { Page, Locator } from '@playwright/test';
import { ProductTextFields } from '@data';
import { catalogLocators } from './../catalog.helpers';
import { purchaseLocators } from '../purchase.helpers';

// --- TYPES ---
export type ProductSource =
  | {
      from: 'inventory' | 'cart';
      index: number;
    }
  | {
      from: 'pdp';
    };

/**
 * Ensures the requested product exists on the page before interaction.
 */
export async function validateProductIndex(page: Page, source: ProductSource) {
  const { inventoryUI } = catalogLocators(page);
  const { cartUI } = purchaseLocators(page);

  if (source.from === 'pdp') {
    return;
  }

  const list = source.from === 'cart' ? cartUI.allItems : inventoryUI.allProductCards;
  const count = await list.count();

  if (count === 0) {
    throw new Error(`[${source.from}] Page Empty: No products found.`);
  }
  if (source.index >= count) {
    throw new Error(`[${source.from}] Index Out of Bounds: Requested ${source.index}, but only ${count} items exist.`);
  }
}

/**
 * Generic utility to inject specific text into product locators.
 * Highly reusable across different pages and test types.
 */
export async function injectProductText(
  locators: { name: Locator; desc: Locator; price: Locator },
  data: ProductTextFields
) {
  await Promise.all([
    locators.name.evaluate((el, txt) => (el.textContent = txt), data.name),
    locators.desc.evaluate((el, txt) => (el.textContent = txt), data.desc),
    locators.price.evaluate((el, txt) => (el.textContent = txt), data.price),
  ]);
}
