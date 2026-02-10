import { Page, Locator } from '@playwright/test';
import { t } from './i18n';

export const productLoc = (page: Page) => ({
  // --- Inventory Screen ---
  inventoryUI: {
    productSortDropdown: page.getByTestId('product-sort-container'),
  },

  // --- Product Cards ---
  productUI: {
    productCards: page.getByTestId('inventory-item'),
    name: (base: Page | Locator = page) => base.getByTestId('inventory-item-name'),
    desc: (base: Page | Locator = page) => base.getByTestId('inventory-item-desc'),
    price: (base: Page | Locator = page) => base.getByTestId('inventory-item-price'),
  },
});

export async function getProductData(page: Page, { productIndex }: { productIndex: number }) {
  const { productUI } = productLoc(page);

  const productCard = productUI.productCards.nth(productIndex);

  const rawData = {
    name: await productUI.name(productCard).textContent(),
    desc: await productUI.desc(productCard).textContent(),
    price: await productUI.price(productCard).textContent(),
  };

  const cleanData: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawData)) {
    if (!value || value.trim() === '') {
      throw new Error(`Scraper Error: Could not find ${key} for product at index ${productIndex}.`);
    } else {
      cleanData[key as keyof typeof cleanData] = value.trim();
    }
  }

  return cleanData as { name: string; desc: string; price: string };
}

export const navToProduct = async (page: Page, { productName }: { productName: string }) => {
  const { productUI } = productLoc(page);

  const exactNameRegex = new RegExp(`^${productName}$`);
  await productUI.name().filter({ hasText: exactNameRegex }).click();
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
