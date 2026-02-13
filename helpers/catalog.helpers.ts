import { Page, Locator } from '@playwright/test';
import { VISUAL_MOCK } from '@data';
import { t } from '@i18n';

// --- TYPES ---
type ProductSource = { from: 'inventory'; index: number } | { from: 'pdp' };

type ProductClick = {
  index: number;
  via: 'name' | 'img';
};

// --- LOCATORS ---
export const catalogLocators = (page: Page) => ({
  // --- Inventory Screen ---
  inventoryUI: {
    productSortDropdown: page.getByTestId('product-sort-container'),
    productCards: page.getByTestId('inventory-item'),
    productList: page.getByTestId('inventory-list'),
    cartBadge: page.getByTestId('shopping-cart-badge'),
    inventoryImg: page.locator('.inventory_item_img'),
    cartButton: page.getByTestId('shopping-cart-link'),
  },

  // --- Product Cards ---
  productUI: {
    name: (base: Page | Locator = page) => base.getByTestId('inventory-item-name'),
    desc: (base: Page | Locator = page) => base.getByTestId('inventory-item-desc'),
    price: (base: Page | Locator = page) => base.getByTestId('inventory-item-price'),
    picture: (base: Page | Locator = page) => base.getByRole('img'),
    addToCartButton: (base: Page | Locator = page) => base.getByRole('button', { name: t.catalog.addToCart }),
    removeButton: (base: Page | Locator = page) => base.getByRole('button', { name: t.catalog.remove }),
    pdpImg: page.locator('.inventory_details_img'),
  },
});

// --- PRIVATE UTILITIES ---
async function getProductScope(page: Page, source: ProductSource) {
  const { inventoryUI } = catalogLocators(page);

  if (source.from === 'pdp') return page;

  const count = await inventoryUI.productCards.count();
  if (count === 0) {
    throw new Error(`[catalog] Page Empty: No products were found on the ${source.from} page.`);
  }
  if (source.index >= count) {
    throw new Error(
      `[catalog] Index Out of Range: Requested product ${source.index}, but only ${count} exist on the page.`
    );
  }

  return inventoryUI.productCards.nth(source.index);
}

// --- ACTIONS ---
async function getProductData(page: Page, source: ProductSource) {
  const { productUI } = catalogLocators(page);

  const scope = await getProductScope(page, source);

  const rawData = await Promise.all([
    productUI.name(scope).innerText(),
    productUI.desc(scope).innerText(),
    productUI.price(scope).innerText(),
  ]);

  const [name, desc, price] = rawData.map((val) => val.trim());

  if (!name || !desc || !price) {
    throw new Error(`[catalog] Content Missing: One or more product fields are blank on the ${source.from} page.`);
  }

  return { name: name, desc: desc, price: price };
}

async function openProductDetails(page: Page, { index, via }: ProductClick) {
  const { productUI } = catalogLocators(page);

  const scope = (await getProductScope(page, { from: 'inventory', index })) as Locator;

  const clickTargetMap: Record<ProductClick['via'], (base: Locator) => Locator> = {
    name: productUI.name,
    img: productUI.picture,
  };

  await clickTargetMap[via](scope).click();
}

async function addProductToCart(page: Page, source: ProductSource) {
  const { productUI } = catalogLocators(page);

  const scope = await getProductScope(page, source);

  await productUI.addToCartButton(scope).click();
}

async function removeProductFromCart(page: Page, source: ProductSource) {
  const { productUI } = catalogLocators(page);

  const scope = await getProductScope(page, source);

  await productUI.removeButton(scope).click();
}

export async function standardizeProductCard(page: Page, source: ProductSource) {
  const { productUI } = catalogLocators(page);

  const scope = await getProductScope(page, source);

  await productUI.name(scope).evaluate((el, name) => (el.textContent = name), VISUAL_MOCK.product.name);
  await productUI.desc(scope).evaluate((el, desc) => (el.textContent = desc), VISUAL_MOCK.product.desc);
  await productUI.price(scope).evaluate((el, price) => (el.textContent = price), VISUAL_MOCK.product.price);
}

async function standardizeInventoryGrid(page: Page, { products }: { products: number }) {
  const { inventoryUI } = catalogLocators(page);

  await standardizeProductCard(page, { from: 'inventory', index: 0 });

  // Pass the first card locator as an argument
  await inventoryUI.productList.evaluate(
    (listElement, { templateElement, n }) => {
      // templateElement is now a REAL DOM node, not a locator string!
      const cleanClone = templateElement.cloneNode(true) as HTMLElement;

      listElement.innerHTML = '';

      for (let i = 0; i < n; i++) {
        listElement.appendChild(cleanClone.cloneNode(true));
      }
    },
    {
      templateElement: await inventoryUI.productCards.first().elementHandle(),
      n: products,
    }
  );
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
