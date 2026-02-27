import type { Locator } from '@playwright/test';
import type * as d from '@data';
import { sampleItem } from '@data';

// ==========================================
// 🏛️ LOGIC TYPES
// ==========================================

export type IndexInput = number | readonly number[];
export type FormOptions<T> = { data?: Partial<T>; skip?: (keyof T)[] };

// ==========================================
// 🏛️ LOGIC ACTIONS
// ==========================================

/** Validates requested indexes exist in DOM, throws if any index out of bounds */
export async function _ensureIndexes(locator: Locator, input: IndexInput): Promise<number[]> {
  const list: number[] = Array.isArray(input) ? input : [input];
  if (list.length === 0) return [];

  const max = Math.max(...list);
  try {
    await locator.nth(max).waitFor();
  } catch {
    const count = await locator.count();
    throw new Error(`[_ensureIndexes] Index out of bounds, requested: ${max}, available: ${count}`);
  }

  return list;
}

export async function _injectItemText(itemLoc: d.ItemLocators, data: d.ItemData): Promise<void> {
  for (const field of sampleItem.config) {
    if (field.type !== 'text') continue;
    await itemLoc[field.key].waitFor();
    await itemLoc[field.key].evaluate((el, txt) => (el.textContent = txt), data[field.key]);
  }
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

export async function _readItem(itemLoc: d.ItemLocators): Promise<d.ItemData> {
  const itemData: d.ItemData = { name: '', desc: '', price: '' };

  for (const field of sampleItem.config) {
    if (field.type !== 'text') continue;
    itemData[field.key] = ((await itemLoc[field.key].textContent()) || '').trim();
  }

  const missingData = Object.keys(itemData).filter((key) => !itemData[key as keyof d.ItemData]);
  if (missingData.length > 0) throw new Error(`[_readItem] Missing item data: ${missingData.join(', ')}`);

  return itemData;
}

export async function _fillForm<T extends Record<string, string | boolean>>(
  config: readonly { key: keyof T; type: string }[],
  locators: Record<keyof T, Locator>,
  data: Partial<T>,
  skip?: (keyof T)[],
): Promise<void> {
  for (const field of config) {
    const locator = locators[field.key];
    const value = data[field.key];

    if (skip?.includes(field.key) || value == null) continue;

    switch (field.type) {
      case 'text':
        await locator.fill(String(value));
        break;
      case 'checkbox':
        await locator.setChecked(Boolean(value));
        break;
      case 'select':
        await locator.selectOption(String(value));
        break;
      default:
        throw new Error(`[_fillForm] Unsupported field type: ${field.type}`);
    }
  }
}
