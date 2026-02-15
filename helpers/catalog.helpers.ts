import { Page, Locator } from '@playwright/test';
import { sharedProductCard, sharedHeader } from './shared/locators';
import { ensureIndexExists, injectProductText, UIContext } from './shared/actions';
import { VISUAL_MOCK, SortLabels } from '@data';

// --- TYPES ---
type CatalogContext = Exclude<UIContext, 'Cart'>;
type ProductCard = { name: Locator; desc: Locator; price: Locator; img: Locator };
type ProductGridSchema = { list: Locator; cards: Locator; card: (index: number) => ProductCard };
export type SortableKeys = keyof ReturnType<typeof catalogLocators>['plp']['all'];

// --- LOCATORS ---
const catalogLocators = (page: Page) => {
  const allCards = page.getByTestId('inventory-item');

  return {
    header: { ...sharedHeader(page) },
    plp: {
      title: page.getByTestId('title'),
      list: page.getByTestId('inventory-list'),
      cards: allCards,
      imgs: page.locator('.inventory_item_img').getByRole('img'),
      sort: page.getByTestId('product-sort-container'),
      all: {
        prices: sharedProductCard(page).price,
        names: sharedProductCard(page).name,
      },
      card: (index: number) => sharedProductCard(allCards.nth(index)),
    },
    pdp: {
      card: { ...sharedProductCard(page) },
      backBtn: page.getByTestId('back-to-products'),
    },
  };
};

// --- DOMAIN ACTIONS ---
async function scrapeProductData({ name, desc, price, img }: ProductCard, label: CatalogContext) {
  const [rawName, rawDesc, rawPrice, imgSrc] = await Promise.all([
    name.innerText(),
    desc.innerText(),
    price.innerText(),
    img.getAttribute('src'),
  ]);

  const [cleanName, cleanDesc, cleanPrice] = [rawName, rawDesc, rawPrice].map((val) => val.trim());

  if (!cleanName || !cleanDesc || !cleanPrice || !imgSrc) {
    throw new Error(`[${label}] Content Missing: One or more product fields are blank.`);
  }

  return {
    name: cleanName,
    desc: cleanDesc,
    price: cleanPrice,
    img: imgSrc,
  };
}

async function populateUniformGrid(plp: ProductGridSchema, gridSize: number) {
  const firstProduct = 0;

  await ensureIndexExists(plp.cards, firstProduct, 'PLP');

  const { name, price, desc } = plp.card(firstProduct);

  await injectProductText({ name, price, desc }, VISUAL_MOCK.product);

  await plp.list.evaluate(
    (listElement: Element, { templateElement, n }: { templateElement: any; n: number }) => {
      const cleanClone = templateElement.cloneNode(true);
      listElement.innerHTML = '';
      for (let i = 0; i < n; i++) {
        listElement.appendChild(cleanClone.cloneNode(true));
      }
    },
    {
      templateElement: await plp.cards.first().elementHandle(),
      n: gridSize,
    }
  );
}

// --- DOMAIN INTERFACE ---
export const catalog = (page: Page) => {
  const loc = catalogLocators(page);

  return {
    loc,
    action: {
      plp: {
        scrape: async ({ index }: { index: number }) => {
          await ensureIndexExists(loc.plp.cards, index, 'PLP');
          return scrapeProductData(loc.plp.card(index), 'PLP');
        },
        open: async ({ index, via }: { index: number; via: 'name' | 'img' }) => {
          await ensureIndexExists(loc.plp.cards, index, 'PLP');
          const card = loc.plp.card(index);
          const target = via === 'img' ? card.img : card.name;
          await target.click();
        },
        add: async ({ index }: { index: number }) => {
          await ensureIndexExists(loc.plp.cards, index, 'PLP');
          await loc.plp.card(index).addBtn.click();
        },
        remove: async ({ index }: { index: number }) => {
          await ensureIndexExists(loc.plp.cards, index, 'PLP');
          await loc.plp.card(index).removeBtn.click();
        },
        sort: async ({ label }: { label: SortLabels }) => {
          await loc.plp.sort.selectOption(label);
        },
        populateGrid: ({ size }: { size: number }) => populateUniformGrid(loc.plp, size),
      },
      pdp: {
        scrape: () => scrapeProductData(loc.pdp.card, 'PDP'),
        normalize: () => injectProductText(loc.pdp.card, VISUAL_MOCK.product),
        add: () => loc.pdp.card.addBtn.click(),
        remove: () => loc.pdp.card.removeBtn.click(),
        back: () => loc.pdp.backBtn.click(),
      },
    },
  };
};
