import type { Page, Locator } from '@playwright/test';
import { t } from '@data';

// ==========================================
// 🏛️ FRAGMENTS LOCATORS
// ==========================================

export const _itemFragment = (root: Page | Locator) =>
  ({
    name: root.getByTestId('inventory-item-name'),
    price: root.getByTestId('inventory-item-price'),
    desc: root.getByTestId('inventory-item-desc'),
    addBtn: root.getByRole('button', { name: t.item.addToCart }),
    removeBtn: root.getByRole('button', { name: t.item.remove }),
  }) as const;
