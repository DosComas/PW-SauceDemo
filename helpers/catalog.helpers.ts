import { Page, Locator } from '@playwright/test';
import { t } from '@utils';
import { VISUAL_MOCK } from '@data';

// --- TYPES ---
type ProductSource = { from: 'inventory'; index: number } | { from: 'pdp' };

type ProductClick = {
  index: number;
  via: 'name' | 'img';
};

// --- LOCATORS ---
export const catalogLoc = (page: Page) => ({
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
async function getProductScope(page: Page, source: ProductSource) {
  const { inventoryUI } = catalogLoc(page);

  if (source.from === 'pdp') return page;

  const count = await inventoryUI.productCards.count();
  if (count === 0) {
    throw new Error(`Scraper Error: No products found on the ${source.from} page. UI might be empty.`);
  }
  if (source.index >= count) {
    throw new Error(`Index Out of Bounds: Requested product index ${source.index}, but only ${count} products exist.`);
  }

  return inventoryUI.productCards.nth(source.index);
}

// --- ACTIONS ---
export async function getProductData(page: Page, source: ProductSource) {
  const { productUI } = catalogLoc(page);

  const scope = await getProductScope(page, source);

  const rawData = await Promise.all([
    productUI.name(scope).innerText(),
    productUI.desc(scope).innerText(),
    productUI.price(scope).innerText(),
  ]);

  const [name, desc, price] = rawData.map((val) => val.trim());

  if (!name || !desc || !price) {
    throw new Error(`Scraper Error: Missing data on ${source.from} page.`);
  }

  return { name: name, desc: desc, price: price };
}

export async function openProductDetails(page: Page, { index, via }: ProductClick) {
  const { productUI } = catalogLoc(page);

  const scope = (await getProductScope(page, { from: 'inventory', index })) as Locator;

  const clickTargetMap: Record<ProductClick['via'], (base: Locator) => Locator> = {
    name: productUI.name,
    img: productUI.picture,
  };

  await clickTargetMap[via](scope).click();
}

export async function addProductToCart(page: Page, source: ProductSource) {
  const { productUI } = catalogLoc(page);

  const scope = await getProductScope(page, source);

  await productUI.addToCartButton(scope).click();
}

export async function removeProductFromCart(page: Page, source: ProductSource) {
  const { productUI } = catalogLoc(page);

  const scope = await getProductScope(page, source);

  await productUI.removeButton(scope).click();
}

export async function standardizeProductCard(page: Page, source: ProductSource) {
  const { productUI } = catalogLoc(page);

  const scope = await getProductScope(page, source);

  await productUI.name(scope).evaluate((el, name) => (el.textContent = name), VISUAL_MOCK.product.name);
  await productUI.desc(scope).evaluate((el, desc) => (el.textContent = desc), VISUAL_MOCK.product.desc);
  await productUI.price(scope).evaluate((el, price) => (el.textContent = price), VISUAL_MOCK.product.price);
}

export async function standardizeInventoryGrid(page: Page, { products }: { products: number }) {
  const { inventoryUI } = catalogLoc(page);

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
