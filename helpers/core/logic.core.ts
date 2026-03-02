import type { Locator } from '@playwright/test';
import type * as d from '@data';
import { sampleItem } from '@data';

// ==========================================
// 🏛️ LOGIC TYPES
// ==========================================

export type IndexSet = number | readonly number[];
export type FormPartial<T> = Partial<T> & { skip?: (keyof T)[] };
export type FormOptions<T> = T & { skip?: (keyof T)[] };

// ==========================================
// 🏛️ LOGIC ACTIONS
// ==========================================

/** Validates requested indexes exist in DOM, throws if any index out of bounds */
export async function _ensureIndexes(locator: Locator, input: IndexSet): Promise<number[]> {
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

export async function _injectText<T extends readonly d.ConfigSchema<d.InjectMap>[]>(
  config: T,
  locators: d.LocatorsOf<d.InjectMap, T>,
  data: Partial<d.DataOf<d.InjectMap, T>>,
): Promise<void> {
  for (const field of config) {
    const key = field.key as keyof d.LocatorsOf<d.InjectMap, T>;
    const locator = locators[key] as Locator;
    const value = data[key as keyof d.DataOf<d.InjectMap, T>];

    if (value === undefined || value === null) continue;
    await locator.waitFor();

    switch (field.type) {
      case 'textField':
        await locator.evaluate((el, txt) => {
          el.textContent = String(txt);
        }, value);
        break;

      case 'priceField':
        await locator.evaluate((el, txt) => {
          // Note: regex must be inside evaluate to exist in browser scope
          const regex = /\$[\d,.]+/;
          const current = el.textContent || '';
          el.textContent = current.replace(regex, String(txt));
        }, value);
        break;

      default: {
        const _exhaustiveCheck: never = field.type;
        throw new Error(`[_injectText] Forgot to handle type: ${_exhaustiveCheck}`);
      }
    }
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
    if (field.type !== 'textField') continue;
    itemData[field.key] = ((await itemLoc[field.key].textContent()) || '').trim();
  }

  const missingData = Object.keys(itemData).filter((key) => !itemData[key as keyof d.ItemData]);
  if (missingData.length > 0) throw new Error(`[_readItem] Missing item data: ${missingData.join(', ')}`);

  return itemData;
}

export async function _fillForm<T extends readonly d.ConfigSchema<d.InputMap>[]>(
  config: T,
  locators: d.LocatorsOf<d.InputMap, T>,
  data: Partial<d.DataOf<d.InputMap, T>>,
  skip: T[number]['key'][] = [],
): Promise<void> {
  for (const field of config) {
    const key = field.key as keyof d.LocatorsOf<d.InputMap, T>;
    const locator = locators[key] as Locator;
    const value = data[key as keyof d.DataOf<d.InputMap, T>];

    if (skip.includes(field.key) || value === undefined || value === null) continue;

    switch (field.type) {
      case 'textInput':
        await locator.fill(String(value));
        break;

      case 'checkbox':
        await locator.setChecked(Boolean(value));
        break;

      case 'select':
        await locator.selectOption(String(value));
        break;

      default: {
        const _exhaustiveCheck: never = field.type;
        throw new Error(`[_fillForm] Forgot to handle type: ${_exhaustiveCheck}`);
      }
    }
  }
}
