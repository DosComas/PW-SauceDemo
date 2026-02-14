import { Page, Locator } from '@playwright/test';
import { validateProductIndex, injectProductText } from './shared/actions';
import { productCard, pageHeader } from './shared/locators';
import { catalogLocators } from './catalog.helpers';
import { VISUAL_MOCK } from '@data';

// --- TYPES ---

// --- LOCATORS ---
export const purchaseLocators = (page: Page) => {
  const allCartItems = page.locator('.cart_item');

  return {
    // CART: The manage cart page
    cartUI: {
      cartList: page.getByTestId('cart-list'),
      allItems: allCartItems,
      productItem: (index: number) => {
        const { name, price, desc } = productCard(allCartItems.nth(index));
        return { name, price, desc };
      },
    },
  };
};

// --- PRIVATE UTILITIES ---

/**
 * Resolves the requested product based on context (PDP vs Inventory).
 * Handles index validation and routing to ensure the UI component is ready.
 */
async function resolveItemUI(page: Page, { index }: { index: number }) {
  const { cartUI } = purchaseLocators(page);

  await validateProductIndex(page, { from: 'cart', index });

  return cartUI.productItem(index);
}

async function standardizeItemText(page: Page, { index }) {
  const { name, price, desc } = await resolveItemUI(page, { index });

  await injectProductText({ name, price, desc }, VISUAL_MOCK.product);
}

// --- ACTIONS ---
async function standardizeCartList(page: Page, { listSize }: { listSize: number }) {
  const { cartUI } = purchaseLocators(page);
  const { headerUI } = catalogLocators(page);

  // 1. Standardize the first real item text
  await standardizeItemText(page, { index: 0 });

  const firstItem = cartUI.allItems.first();
  const templateHandle = await firstItem.elementHandle();

  // 2. Surgical update using the parent container
  await firstItem.locator('..').evaluate(
    (container, { template, n }) => {
      if (!template) return;

      // Identify the "Header" elements (anything before the first item)
      const children = Array.from(container.children);
      const templateIndex = children.indexOf(template);

      // Remove the template and all siblings that follow it
      children.slice(templateIndex).forEach((el) => el.remove());

      // Append the new standardized clones
      const cleanClone = template.cloneNode(true);
      for (let i = 0; i < n; i++) {
        container.appendChild(cleanClone.cloneNode(true));
      }
    },
    { template: templateHandle, n: listSize }
  );

  // 3. Update Badge
  if (await headerUI.cartBadge.isVisible()) {
    await headerUI.cartBadge.evaluate((el, val) => (el.textContent = val.toString()), listSize);
  }
}

// --- MODULE INTERFACE ---
export const purchase = {
  standardizeCartList,
} as const;

/*

export async function getAmount(page: Page, dataTestId: string) {
  const text = await page.getByTestId(dataTestId).textContent();
  return text ? parseFloat(text.replace(/[^\d.]/g, '')) : 'No amount found';
}

export async function gotoCheckout(page: Page) {
  await page.getByTestId('shopping-cart-link').click();
  await page.getByRole('button', { name: await getTranslation('checkout') }).click();
}

export async function submitCheckoutInfo(
  page: Page,
  firstName?: string,
  lastName?: string,
  zip?: string
) {
  if (firstName) {
    await page.getByPlaceholder(await getTranslation('firstName')).fill(firstName);
  }
  if (lastName) {
    await page.getByPlaceholder(await getTranslation('lastName')).fill(lastName);
  }
  if (zip) {
    await page.getByPlaceholder(await getTranslation('zipPostalCode')).fill(zip);
  }

  await page.getByRole('button', { name: await getTranslation('continue') }).click();
}

*/
