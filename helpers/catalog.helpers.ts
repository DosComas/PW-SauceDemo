import { Page } from '@playwright/test';
import { sharedProductCard, sharedHeader } from './shared/locators';
import { validateProductIndex, injectProductText, ProductSource } from './shared/actions';
import { VISUAL_MOCK } from '@data';

// --- TYPES ---
type ProductClick = {
  index: number;
  via: 'name' | 'img';
};

// --- LOCATORS ---
export const catalogLocators = (page: Page) => {
  const allCards = page.getByTestId('inventory-item');

  return {
    // HEADER: Global navigation and cart
    headerUI: {
      ...sharedHeader(page),
    },

    // INVENTORY: The main product gallery
    inventoryUI: {
      cardsList: page.getByTestId('inventory-list'),
      allProductCards: allCards,
      allProductCardImgs: page.locator('.inventory_item_img').getByRole('img'),
      sortDropdown: page.getByTestId('product-sort-container'),
      allProductPrices: sharedProductCard(page).price,
      allProductNames: sharedProductCard(page).name,
      // Clarity helper: Get the product logic for a specific card
      productCard: (index: number) => sharedProductCard(allCards.nth(index)),
    },

    // PDP: The product detail page
    pdpUI: {
      productCard: { ...sharedProductCard(page) },
      backToProductsBtn: page.getByTestId('back-to-products'),
    },
  };
};

// --- PRIVATE UTILITIES ---

/**
 * Resolves the requested product based on context (PDP vs Inventory).
 * Handles index validation and routing to ensure the UI component is ready.
 */
async function resolveProductUI(page: Page, source: ProductSource) {
  const { inventoryUI, pdpUI } = catalogLocators(page);

  if (source.from === 'pdp') {
    return pdpUI.productCard;
  }

  await validateProductIndex(page, source);
  return inventoryUI.productCard(source.index);
}

// --- ACTIONS ---
async function scrapeCatalogProduct(page: Page, source: ProductSource) {
  const product = await resolveProductUI(page, source);

  const [name, desc, price, img] = await Promise.all([
    product.name.innerText(),
    product.desc.innerText(),
    product.price.innerText(),
    product.img.getAttribute('src'),
  ]);

  const cleaned = [name, desc, price].map((val) => val.trim());
  const [cleanName, cleanDesc, cleanPrice] = cleaned;

  if (!cleanName || !cleanDesc || !cleanPrice || !img) {
    throw new Error(
      `[catalog] Content Missing: One or more product fields (including image) are blank on the ${source.from} page.`
    );
  }

  return {
    name: cleanName,
    desc: cleanDesc,
    price: cleanPrice,
    img,
  };
}

async function openProductDetails(page: Page, { index, via }: ProductClick) {
  const product = await resolveProductUI(page, { from: 'inventory', index });

  const clickTargetMap = {
    name: product.name,
    img: product.img,
  };

  await clickTargetMap[via].click();
}

async function addProductToCart(page: Page, source: ProductSource) {
  const product = await resolveProductUI(page, source);

  await product.addToCartBtn.click();
}

async function removeProductFromCart(page: Page, source: ProductSource) {
  const product = await resolveProductUI(page, source);

  await product.removeBtn.click();
}

async function standardizeProductText(page: Page, source: ProductSource) {
  const { name, price, desc } = await resolveProductUI(page, source);

  await injectProductText({ name, price, desc }, VISUAL_MOCK.product);
}

async function standardizeInventoryGridText(page: Page, { gridSize }: { gridSize: number }) {
  const { inventoryUI } = catalogLocators(page);

  // Fix the first card visually
  await standardizeProductText(page, { from: 'inventory', index: 0 });

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
      templateElement: await inventoryUI.allProductCards.first().elementHandle(),
      n: gridSize,
    }
  );
}

// --- MODULE INTERFACE ---
export const catalog = {
  scrapeCatalogProduct,
  openProductDetails,
  addProductToCart,
  removeProductFromCart,
  standardizeProductText,
  standardizeInventoryGridText,
} as const;
