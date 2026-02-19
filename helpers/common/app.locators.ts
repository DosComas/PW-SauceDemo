import { Page, Locator } from '@playwright/test';
import { type SocialPlatform, t } from '@data';

// ==========================================
// 🏛️ COMMON TYPES
// ==========================================

export type Header = ReturnType<typeof _getHeader>;

// ==========================================
// 🏛️ COMMON LOCATORS
// ==========================================

export const _getItem = (root: Page | Locator) => ({
  name: root.getByTestId('inventory-item-name'),
  price: root.getByTestId('inventory-item-price'),
  desc: root.getByTestId('inventory-item-desc'),
  addBtn: root.getByRole('button', { name: t.item.addToCart }),
  removeBtn: root.getByRole('button', { name: t.item.remove }),
});

export const _getHeader = (page: Page) => ({
  appLogo: page.locator('.login_logo').filter({ hasText: t.meta.storeName }),
  menu: {
    openBtn: page.getByRole('button', { name: t.menu.openMenu }),
    logoutBtn: page.getByRole('link', { name: t.menu.logout }),
    aboutBtn: page.getByRole('link', { name: t.menu.about.label }),
    panel: page.locator('.bm-menu-wrap'),
  },
  cart: {
    openBtn: page.getByTestId('shopping-cart-link'),
    badge: page.getByTestId('shopping-cart-badge'),
  },
});

export const _getFooter = (page: Page) => {
  const _social = page.locator('.social');

  return {
    social: {
      twitter: _social.getByRole('link', { name: t.footer.social.twitter.label }),
      facebook: _social.getByRole('link', { name: t.footer.social.facebook.label }),
      linkedin: _social.getByRole('link', { name: t.footer.social.linkedin.label }),
    } satisfies Record<SocialPlatform, Locator>,
  };
};
