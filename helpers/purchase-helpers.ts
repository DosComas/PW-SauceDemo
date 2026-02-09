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
