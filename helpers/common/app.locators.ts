import { Page, Locator } from '@playwright/test';
import { type SocialPlatform, t } from '@data';

export type Header = ReturnType<typeof _headerLocs>;

export const _itemLocs = (root: Page | Locator) => ({
  name: root.getByTestId('inventory-item-name'),
  price: root.getByTestId('inventory-item-price'),
  desc: root.getByTestId('inventory-item-desc'),
  addBtn: root.getByRole('button', { name: t.item.addToCart }),
  removeBtn: root.getByRole('button', { name: t.item.remove }),
});

export const _headerLocs = (page: Page) => ({
  menuBtn: page.getByRole('button', { name: t.header.openMenu }),
  logoutBtn: page.getByRole('link', { name: t.header.logout }),
  aboutBtn: page.getByRole('link', { name: t.header.about }),
  appLogo: page.locator('.login_logo').filter({ hasText: t.meta.storeName }),
  cartBtn: page.getByTestId('shopping-cart-link'),
  cartBadge: page.getByTestId('shopping-cart-badge'),
});

export const _footerLocs = (page: Page) => {
  const _social = page.locator('.social');

  return {
    social: {
      twitter: _social.getByRole('link', { name: t.footer.social.twitter.label }),
      facebook: _social.getByRole('link', { name: t.footer.social.facebook.label }),
      linkedin: _social.getByRole('link', { name: t.footer.social.linkedin.label }),
    } satisfies Record<SocialPlatform, Locator>,
  };
};
