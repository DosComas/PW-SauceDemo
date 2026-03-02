import type { Page, Locator } from '@playwright/test';
import type * as d from '@data';

// ==========================================
// 🏛️ FRAGMENTS LOCATORS
// ==========================================

/** Reusable item fragment: name, price, desc, add/remove buttons */
export const _itemFragment = (root: Page | Locator) =>
  ({
    name: root.getByTestId('inventory-item-name'),
    price: root.getByTestId('inventory-item-price'),
    desc: root.getByTestId('inventory-item-desc'),
  }) as const satisfies d.ItemLocators;

export const _itemCard = (page: Page) => page.getByTestId('inventory-item');
