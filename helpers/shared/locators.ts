import { Page, Locator } from '@playwright/test';
import { t } from '@i18n';

export const sharedProductCard = (base: Page | Locator) => ({
  name: base.getByTestId('inventory-item-name'),
  price: base.getByTestId('inventory-item-price'),
  desc: base.getByTestId('inventory-item-desc'),
  addToCartBtn: base.getByRole('button', { name: t.catalog.addToCart }),
  removeBtn: base.getByRole('button', { name: t.catalog.remove }),
  img: base.locator('.inventory_item_img, .inventory_details_img_container').getByRole('img'),
});

export const sharedHeader = (page: Page) => ({
  cartBadge: page.getByTestId('shopping-cart-badge'),
  cartBtn: page.getByTestId('shopping-cart-link'),
  menuBtn: page.getByRole('button', { name: 'Open Menu' }),
  logoutBtn: page.getByTestId('logout-sidebar-link'),
});
