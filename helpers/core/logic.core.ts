import type { Locator } from '@playwright/test';
import type * as d from '@data';

// ==========================================
// 🏛️ LOGIC TYPES
// ==========================================

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
export type FormPartial<T> = Expand<Partial<T> & { skip?: (keyof T)[] }>;
export type FormOptions<T> = Expand<T & { skip?: (keyof T)[] }>;

// ==========================================
// 🏛️ LOGIC ACTIONS
// ==========================================

export async function _ensureIndexes(locator: Locator, indexes: number[]): Promise<void> {
  if (indexes.length === 0) return;

  const max = Math.max(...indexes);
  try {
    await locator.nth(max).waitFor();
  } catch {
    const count = await locator.count();
    throw new Error(`[_ensureIndexes] Index out of bounds, requested: ${max}, available: ${count}`);
  }
}

export async function _fillForm<T extends readonly d.ConfigSchema<d.InputMap>[]>(
  config: T,
  locators: d.LocatorsOf<d.InputMap, T>,
  data: Partial<d.DataOf<d.InputMap, T>>,
  skip: T[number]['key'][] = [],
): Promise<void> {
  for (const field of config) {
    const key = field.key as T[number]['key'];
    const locator = locators[key] as Locator;
    const value = data[key];

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

export async function _readTextFields<T extends readonly d.ConfigSchema<d.InjectMap>[]>(
  config: T,
  locators: d.LocatorsOf<d.InjectMap, T>,
): Promise<d.DataOf<d.InjectMap, T>> {
  const result = {} as d.DataOf<d.InjectMap, T>;

  for (const field of config) {
    const key = field.key as T[number]['key'];
    const locator = locators[key] as Locator;
    const textContent = ((await locator.textContent()) ?? '').trim();

    switch (field.type) {
      case 'textField':
        result[key] = textContent as d.DataOf<d.InjectMap, T>[typeof key];
        break;

      case 'priceField':
        result[key] = Number(textContent.replace(/^.*?\$/, '')) as d.DataOf<d.InjectMap, T>[typeof key];
        break;
    }
  }

  const missing = Object.keys(result).filter((key) => !result[key as keyof typeof result]);
  if (missing.length > 0) throw new Error(`[_readTextFields] Missing fields: ${missing.join(', ')}`);

  return result;
}

export async function _injectText<T extends readonly d.ConfigSchema<d.InjectMap>[]>(
  config: T,
  locators: d.LocatorsOf<d.InjectMap, T>,
  data: Partial<d.DataOf<d.InjectMap, T>>,
): Promise<void> {
  for (const field of config) {
    const key = field.key as T[number]['key'];
    const locator = locators[key] as Locator;
    const value = data[key];

    if (value === null) continue;

    await locator.waitFor();

    switch (field.type) {
      case 'textField':
        await locator.evaluate((el, val) => {
          el.textContent = val;
        }, String(value));
        break;

      case 'priceField':
        await locator.evaluate((el, val) => {
          const regex = /\$[\d,.]+/;
          const current = el.textContent || '';
          el.textContent = current.replace(regex, `$${val}`);
        }, Number(value).toFixed(2));
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
