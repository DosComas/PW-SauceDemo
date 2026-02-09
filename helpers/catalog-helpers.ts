import { Page } from '@playwright/test';
import { t } from './i18n';

export const productLoc = (page: Page) => ({
  // --- Inventory Screen ---
  inventoryUI: {
    productSortDropdown: page.getByTestId('product-sort-container'),
    productCards: page.getByTestId('inventory-item'),
  },

  productUI: {
    name: page.getByTestId('inventory-item-name'),
    desc: page.getByTestId('inventory-item-desc'),
    price: page.getByTestId('inventory-item-price'),
  },
});

export const getProductData = async (page: Page, { productIndex = 0 }: { productIndex?: number } = {}) => {
  const { inventoryUI } = productLoc(page);

  const productCard = inventoryUI.productCards.nth(productIndex);

  const name = await productCard.getByTestId('inventory-item-name').innerText();
  const desc = await productCard.getByTestId('inventory-item-desc').innerText();
  const price = await productCard.getByTestId('inventory-item-price').innerText();

  return {
    name,
    desc,
    price,
  };
};

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
