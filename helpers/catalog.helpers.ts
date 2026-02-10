import { Page, Locator } from '@playwright/test';
import { t } from '../utils/i18n';

// --- TYPES ---
interface ProductSource {
  from: 'inventory' | 'pdp';
  index?: number;
}

interface ProductClick {
  index: number;
  via: 'name' | 'img';
}

// --- LOCATORS ---
export const productLoc = (page: Page) => ({
  // --- Inventory Screen ---
  inventoryUI: {
    productSortDropdown: page.getByTestId('product-sort-container'),
    productCards: page.getByTestId('inventory-item'),
    cartBadge: page.getByTestId('shopping-cart-badge'),
  },

  // --- Product Cards ---
  productUI: {
    name: (base: Page | Locator = page) => base.getByTestId('inventory-item-name'),
    desc: (base: Page | Locator = page) => base.getByTestId('inventory-item-desc'),
    price: (base: Page | Locator = page) => base.getByTestId('inventory-item-price'),
    picture: (base: Page | Locator = page) => base.getByRole('img'),
    addToCartButton: (base: Page | Locator = page) =>
      base.getByRole('button', { name: t('product.addToCart') }),
    removeButton: (base: Page | Locator = page) => base.getByRole('button', { name: t('product.remove') }),
  },
});

// --- PRIVATE UTILITIES ---
function getProductScope(page: Page, { from, index = 0 }: ProductSource) {
  const { inventoryUI } = productLoc(page);
  return from === 'pdp' ? page : inventoryUI.productCards.nth(index);
}

// --- ACTIONS ---
export async function getProductData(page: Page, { from, index = 0 }: ProductSource) {
  const { productUI } = productLoc(page);

  const scope = getProductScope(page, { from, index });

  const [name, desc, price] = await Promise.all([
    productUI.name(scope).innerText(),
    productUI.desc(scope).innerText(),
    productUI.price(scope).innerText(),
  ]);

  if (!name || !desc || !price) {
    throw new Error(`Scraper Error: Missing data on ${from} page`);
  }

  return { name: name.trim(), desc: desc.trim(), price: price.trim() };
}

export async function openProductDetails(page: Page, { index, via }: ProductClick) {
  const { productUI } = productLoc(page);

  const scope = getProductScope(page, { from: 'inventory', index });

  const clickTargetMap = {
    name: productUI.name,
    img: productUI.picture,
  } as const;

  await clickTargetMap[via](scope).click();
}

export async function addProductToCart(page: Page, { from, index = 0 }: ProductSource) {
  const { productUI } = productLoc(page);

  const scope = getProductScope(page, { from, index });

  await productUI.addToCartButton(scope).click();
}

export async function removeProductFromCart(page: Page, { from, index = 0 }: ProductSource) {
  const { productUI } = productLoc(page);

  const scope = getProductScope(page, { from, index });

  await productUI.removeButton(scope).click();
}

// --- MODULE INTERFACE ---
export const catalog = {
  getProductData,
  openProductDetails,
  addProductToCart,
  removeProductFromCart,
} as const;

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
