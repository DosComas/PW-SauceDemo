import { Page, Locator } from '@playwright/test';
import { t } from '../utils/i18n';
import { VISUAL_MOCK } from '../data/products.data';

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
    productList: page.getByTestId('inventory-list'),
    cartBadge: page.getByTestId('shopping-cart-badge'),
    inventoryImg: page.locator('.inventory_item_img'),
  },

  // --- Product Cards ---
  productUI: {
    name: (base: Page | Locator = page) => base.getByTestId('inventory-item-name'),
    desc: (base: Page | Locator = page) => base.getByTestId('inventory-item-desc'),
    price: (base: Page | Locator = page) => base.getByTestId('inventory-item-price'),
    picture: (base: Page | Locator = page) => base.getByRole('img'),
    addToCartButton: (base: Page | Locator = page) => base.getByRole('button', { name: t('product.addToCart') }),
    removeButton: (base: Page | Locator = page) => base.getByRole('button', { name: t('product.remove') }),
    pdpImg: page.locator('.inventory_details_img'),
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

export async function standardizeProductCard(page: Page, { from, index = 0 }: ProductSource) {
  const { productUI } = productLoc(page);

  const scope = getProductScope(page, { from, index });

  await productUI.name(scope).evaluate((el, name) => (el.textContent = name), VISUAL_MOCK.product.name);
  await productUI.desc(scope).evaluate((el, desc) => (el.textContent = desc), VISUAL_MOCK.product.desc);
  await productUI.price(scope).evaluate((el, price) => (el.textContent = price), VISUAL_MOCK.product.price);
}

export async function standardizeInventoryGrid(page: Page, { products }: { products: number }) {
  const { inventoryUI } = productLoc(page);

  await standardizeProductCard(page, { from: 'inventory', index: 0 });

  const listHandle = await inventoryUI.productList.elementHandle();
  const itemHandle = await inventoryUI.productCards.first().elementHandle();

  if (listHandle && itemHandle) {
    await page.evaluate(
      ({ list, item, n }) => {
        // Clear the current list
        list.innerHTML = '';

        // Re-populate with clones of the standardized item
        for (let i = 0; i < n; i++) {
          list.appendChild(item.cloneNode(true));
        }
      },
      { list: listHandle, item: itemHandle, n: products }
    );
  }
}

// --- MODULE INTERFACE ---
export const catalog = {
  getProductData,
  openProductDetails,
  addProductToCart,
  removeProductFromCart,
  standardizeProductCard,
  standardizeInventoryGrid,
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
