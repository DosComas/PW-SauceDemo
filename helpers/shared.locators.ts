import { Page, Locator } from '@playwright/test';
import { t } from '@i18n';

export const productItem = (base: Page | Locator) => ({
  name: base.getByTestId('inventory-item-name'),
  price: base.getByTestId('inventory-item-price'),
  description: base.getByTestId('inventory-item-desc'),
  addToCartButton: base.getByRole('button', { name: t.catalog.addToCart }),
  removeButton: base.getByRole('button', { name: t.catalog.remove }),
  image: base.locator('.inventory_item_img, .inventory_details_img_container').getByRole('img'),
});

export const pageHeader = (page: Page) => ({
  cartBadge: page.getByTestId('shopping-cart-badge'),
  cartButton: page.getByTestId('shopping-cart-link'),
  menuButton: page.getByRole('button', { name: 'Open Menu' }),
  logoutButton: page.getByTestId('logout-sidebar-link'),
});
