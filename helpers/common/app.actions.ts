import { Locator } from '@playwright/test';
import { ItemTextFields } from '@data';

// TYPES

export type ItemTextLocators = { name: Locator; desc: Locator; price: Locator };

// COMMON ACTIONS

export async function _ensureIndexExists(loc: Locator, index: number) {
  await loc.first().waitFor();

  const count = await loc.count();

  if (count === 0) {
    throw new Error(`[_ensureIndexExists] Page empty, no items found`);
  }

  if (index >= count) {
    throw new Error(`[_ensureIndexExists] Index out of bounds, requested: ${index}, actual: ${count}`);
  }
}

export async function _injectItemText(itemLoc: ItemTextLocators, data: ItemTextFields) {
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
    throw new Error(`[_injectClones] Blueprint handle is null. Locator: "${blueprintLoc.toString()}"`);
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
