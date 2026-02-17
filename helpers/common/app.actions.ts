import { Locator } from '@playwright/test';
import { ItemTextFields } from '@data';

// TYPES

export type IndexInput = number | readonly number[];
export type ItemTextLocators = { name: Locator; desc: Locator; price: Locator };

// COMMON ACTIONS

export async function _ensureIndexes(loc: Locator, input: IndexInput) {
  const list = Array.isArray(input) ? input : [input];
  if (list.length === 0) return [];

  const min = Math.min(...list);
  if (min < 0) throw new Error(`[_ensureIndexes] Negative index: ${min}`);

  const max = Math.max(...list);
  await loc.nth(max).waitFor();

  return list;
}

export async function _injectItemText(itemLoc: ItemTextLocators, data: ItemTextFields) {
  await itemLoc.name.waitFor();

  const mapping = [
    { loc: itemLoc.name, val: data.name },
    { loc: itemLoc.desc, val: data.desc },
    { loc: itemLoc.price, val: data.price },
  ];

  await Promise.all(mapping.map(({ loc, val }) => loc.evaluate((el, txt) => (el.textContent = txt), val)));
}

export async function _injectClones(containerLoc: Locator, blueprintLoc: Locator, count: number) {
  const handle = await blueprintLoc.elementHandle();
  if (!handle) {
    throw new Error(`[_injectClones] Blueprint handle is null, locator: "${blueprintLoc.toString()}"`);
  }

  await containerLoc.evaluate(
    (container, { blueprintNode, n }) => {
      // Identify anything before the first item
      const children = Array.from(container.children);
      const templateIndex = children.indexOf(blueprintNode);

      // Remove the template and all siblings that follow it
      children.slice(templateIndex).forEach((el) => el.remove());

      // Append the new mocked clones
      const cleanClone = blueprintNode.cloneNode(true);
      for (let i = 0; i < n; i++) {
        container.appendChild(cleanClone.cloneNode(true));
      }
    },
    { blueprintNode: handle, n: count },
  );
}
