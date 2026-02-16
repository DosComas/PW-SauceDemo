import { Page, Locator } from '@playwright/test';
import { t } from '@data';

export const _appItem = (root: Page | Locator) => ({
  name: root.getByTestId('inventory-item-name'),
  price: root.getByTestId('inventory-item-price'),
  desc: root.getByTestId('inventory-item-desc'),
  addBtn: root.getByRole('button', { name: t.item.addToCart }),
  removeBtn: root.getByRole('button', { name: t.item.remove }),
});

export const _appHeader = (page: Page) => ({
  cartBadge: page.getByTestId('shopping-cart-badge'),
  cartBtn: page.getByTestId('shopping-cart-link'),
  menuBtn: page.getByRole('button', { name: t.header.openMenu }),
  logoutBtn: page.getByTestId('logout-sidebar-link'),
});

export type Header = ReturnType<typeof _appHeader>;
