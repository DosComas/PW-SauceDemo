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
  menuBtn: page.getByRole('button', { name: t.header.openMenu }),
  logoutBtn: page.getByTestId('logout-sidebar-link'),
  appLogo: page.locator('.login_logo').filter({ hasText: t.meta.storeName }),
  cartBtn: page.getByTestId('shopping-cart-link'),
  cartBadge: page.getByTestId('shopping-cart-badge'),
});

export const _appFooter = (page: Page) => ({
  social: {
    twitter: page.getByTestId('social-twitter'),
    facebook: page.getByTestId('social-facebook'),
    linkedin: page.getByTestId('social-linkedin'),
  },
});

export type Header = ReturnType<typeof _appHeader>;
