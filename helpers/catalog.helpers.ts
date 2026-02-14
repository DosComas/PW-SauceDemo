import { Page, Locator } from '@playwright/test';
import { productItem, pageHeader } from './shared.locators';
import { VISUAL_MOCK } from '@data';
import { t } from '@i18n';

// --- TYPES ---
type ProductSource = { from: 'inventory'; index: number } | { from: 'pdp' };

type ProductClick = {
  index: number;
  via: 'name' | 'img';
};

// --- LOCATORS legacy ---
export const catalogLocatorsLegacy = (page: Page) => ({
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

// --- LOCATORS ---
export const catalogLocators = (page: Page) => ({
  // HEADER: Global navigation and cart
  headerUI: {
    ...pageHeader(page),
  },

  // INVENTORY: The main product gallery
  inventoryUI: {
    cardsList: page.getByTestId('inventory-list'),
    allCards: page.getByTestId('inventory-item'),
    allCardImages: page.locator('.inventory_item_img').getByRole('img'),
    sortDropdown: page.getByTestId('product-sort-container'),
    // Clarity helper: Get the product logic for a specific card
    card: (index: number) => productItem(page.getByTestId('inventory-item').nth(index)),
  },

  // PDP: The product detail page
  pdpUI: {
    ...productItem(page),
    backButton: page.getByTestId('back-to-products'),
  },
});

// --- PRIVATE UTILITIES ---
async function getProductScope(page: Page, source: ProductSource) {
  const { inventoryUI, pdpUI } = catalogLocators(page);

  // PDP Context
  if (source.from === 'pdp') {
    return pdpUI;
  }

  // Inventory Context
  const count = await inventoryUI.allCards.count();
  if (count === 0) {
    throw new Error(`[catalog] Page Empty: No products found on Inventory.`);
  }
  if (source.index >= count) {
    throw new Error(`[catalog] Index Out of Range: Requested ${source.index}, only ${count} items exist.`);
  }

  // Return the pre-scoped object for that specific card
  return inventoryUI.card(source.index);
}

// --- ACTIONS ---
async function getProductData(page: Page, source: ProductSource) {
  const product = await getProductScope(page, source);

  const [name, description, price, image] = await Promise.all([
    product.name.innerText(),
    product.description.innerText(),
    product.price.innerText(),
    product.image.getAttribute('src'),
  ]);

  const cleaned = [name, description, price].map((val) => val.trim());
  const [cleanName, cleanDescription, cleanPrice] = cleaned;

  if (!cleanName || !cleanDescription || !cleanPrice || !image) {
    throw new Error(
      `[catalog] Content Missing: One or more product fields (including image) are blank on the ${source.from} page.`
    );
  }

  return {
    name: cleanName,
    description: cleanDescription,
    price: cleanPrice,
    image: image,
  };
}

async function openProductDetails(page: Page, { index, via }: ProductClick) {
  const product = await getProductScope(page, { from: 'inventory', index });

  const clickTargetMap = {
    name: product.name,
    img: product.image,
  };

  await clickTargetMap[via].click();
}

async function addProductToCart(page: Page, source: ProductSource) {
  const product = await getProductScope(page, source);

  await product.addToCartButton.click();
}

async function removeProductFromCart(page: Page, source: ProductSource) {
  const product = await getProductScope(page, source);

  await product.removeButton.click();
}

export async function standardizeProductCard(page: Page, source: ProductSource) {
  const product = await getProductScope(page, source);

  await product.name.evaluate((el, txt) => (el.textContent = txt), VISUAL_MOCK.product.name);
  await product.description.evaluate((el, txt) => (el.textContent = txt), VISUAL_MOCK.product.description);
  await product.price.evaluate((el, txt) => (el.textContent = txt), VISUAL_MOCK.product.price);
}

async function standardizeInventoryGrid(page: Page, { products }: { products: number }) {
  const { inventoryUI } = catalogLocators(page);

  // Fix the first card visually
  await standardizeProductCard(page, { from: 'inventory', index: 0 });

  // Clone it
  await inventoryUI.cardsList.evaluate(
    (listElement, { templateElement, n }) => {
      const cleanClone = templateElement.cloneNode(true) as HTMLElement;
      listElement.innerHTML = '';
      for (let i = 0; i < n; i++) {
        listElement.appendChild(cleanClone.cloneNode(true));
      }
    },
    {
      // Access the raw card locator directly from inventoryUI for the handle
      templateElement: await inventoryUI.allCards.first().elementHandle(),
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
