import type { Locator } from '@playwright/test';
import type { ItemData, ItemLocators } from '@data';

// ==========================================
// 🏛️ LOGIC TYPES
// ==========================================

export type IndexInput = number | readonly number[];
export type ReadResult<T extends IndexInput> = T extends number ? ItemData : ItemData[];

// ==========================================
// 🏛️ LOGIC ACTIONS
// ==========================================

/** Validates requested indexes exist in DOM, throws if any index out of bounds */
export async function _ensureIndexes(loc: Locator, input: IndexInput): Promise<number[]> {
  const list: number[] = Array.isArray(input) ? input : [input];
  if (list.length === 0) return [];

  const max = Math.max(...list);
  try {
    await loc.nth(max).waitFor();
  } catch {
    const count = await loc.count();
    throw new Error(`[_ensureIndexes] Index out of bounds, requested: ${max}, available: ${count}`);
  }

  return list;
}

export async function _injectItemText(itemLoc: ItemLocators, data: ItemData): Promise<void> {
  await itemLoc.name.waitFor();

  const mapping = [
    { loc: itemLoc.name, val: data.name },
    { loc: itemLoc.desc, val: data.desc },
    { loc: itemLoc.price, val: data.price },
  ];

  await Promise.all(mapping.map(({ loc, val }) => loc.evaluate((el, txt) => (el.textContent = txt), val)));
}

export async function _injectClones(containerLoc: Locator, blueprintLoc: Locator, count: number): Promise<void> {
  const handle = await blueprintLoc.elementHandle();
  if (!handle) throw new Error(`[_injectClones] Blueprint handle is null, locator: "${blueprintLoc.toString()}"`);

  await containerLoc.evaluate(
    (container, { blueprintNode, n }) => {
      // Identify anything before the first item
      const children = Array.from(container.children);
      const templateIndex = children.indexOf(blueprintNode);

      // Remove the template and all siblings that follow it
      children.slice(templateIndex).forEach((el) => el.remove());

      // Append the new mocked clones
      const cleanClone = blueprintNode.cloneNode(true);
      for (let i = 0; i < n; i++) container.appendChild(cleanClone.cloneNode(true));
    },
    { blueprintNode: handle, n: count },
  );
}

export async function _readItem(itemLoc: ItemLocators, imgSrc?: boolean): Promise<ItemData> {
  const itemData: ItemData = {
    name: ((await itemLoc.name.textContent()) || '').trim(),
    desc: ((await itemLoc.desc.textContent()) || '').trim(),
    price: ((await itemLoc.price.textContent()) || '').trim(),
  };
  if (imgSrc && itemLoc.img) itemData.imgSrc = (await itemLoc.img.getAttribute('src')) || '';

  const missing = Object.keys(itemData).filter((key) => !itemData[key as keyof ItemData]);
  if (missing.length > 0) throw new Error(`[_readItem] Missing item data: ${missing.join(', ')}`);

  return itemData;
}
