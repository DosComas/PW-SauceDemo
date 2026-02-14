import { Page, Locator } from '@playwright/test';
import { standardizeProductCard, catalogLocators } from '../helpers/catalog.helpers';
import { t } from '@i18n';

// --- TYPES ---
interface moduleSource {
  index?: number;
}

// --- LOCATORS ---
export const purchaseLocators = (page: Page) => ({
  cartUI: {
    container: page.getByTestId('module-container'),
    cartList: page.getByTestId('cart-list'),
    cartItem: page.locator('.cart_item'),
  },
});

// --- PRIVATE UTILITIES ---
function getmoduleScope(page: Page, index = 0) {
  const { cartUI } = purchaseLocators(page);
  return cartUI.container.nth(index);
}

// --- ACTIONS ---
async function standardizeCartList(page: Page, { products }: { products: number }) {
  const { cartUI } = purchaseLocators(page);
  const { headerUI } = catalogLocators(page);

  await standardizeProductCard(page, { from: 'inventory', index: 0 });

  const templateHandle = await cartUI.cartList.first().elementHandle();

  // Perform the evaluation
  await cartUI.cartItem.evaluate(
    (list, { template, n }) => {
      if (!template) return;

      const cleanClone = template.cloneNode(true) as HTMLElement;

      // Identify the item class (e.g., .cart_item) to remove siblings surgically
      const itemClass = `.${template.className.split(' ').join('.')}`;
      list.querySelectorAll(itemClass).forEach((el) => el.remove());

      for (let i = 0; i < n; i++) {
        list.appendChild(cleanClone.cloneNode(true));
      }
    },
    { template: templateHandle, n: products }
  );

  if (await headerUI.cartBadge.isVisible()) {
    await headerUI.cartBadge.evaluate((el, n) => (el.textContent = n.toString()), products);
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
