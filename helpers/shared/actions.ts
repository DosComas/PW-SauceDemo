import { Locator } from '@playwright/test';
import { ProductTextFields } from '@data';

// --- TYPES ---
export type UIContext = 'PLP' | 'PDP' | 'Cart';

// --- ACTIONS ---

/**
 * A simple utility to provide better error messages for index-based actions.
 */
export async function ensureIndexExists(locator: Locator, index: number, label: UIContext) {
  const count = await locator.count();

  if (count === 0) {
    throw new Error(`[${label}] Page Empty: No items found.`);
  }

  if (index >= count) {
    throw new Error(`[${label}] Index Out of Bounds: Requested index ${index}, but only ${count} items exist.`);
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
  const mapping = [
    { loc: locators.name, val: data.name },
    { loc: locators.desc, val: data.desc },
    { loc: locators.price, val: data.price },
  ];

  await Promise.all(mapping.map(({ loc, val }) => loc.evaluate((el, txt) => (el.textContent = txt), val)));
}
