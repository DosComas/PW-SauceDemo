import { Page } from '@playwright/test';
import { t } from './i18n';

export const productLoc = (page: Page) => ({
  // --- Inventory Screen ---
  inventoryUI: {
    productSortDropdown: page.getByTestId('product-sort-container'),
  },
});

/*
export async function addProductsToCart(page: Page, quantity: number) {
  for (let i = 0; i < quantity; i++) {
    await page
      .getByRole('button', { name: await getTranslation('addToCart') })
      .first()
      .click();
  }
}

export async function getItemsPrices(page: Page, dataTestId: string) {
  const pricesText = await page.getByTestId(dataTestId).allTextContents();
  return pricesText.map((price) => parseFloat(price.replace('$', '').trim()));
}
*/
