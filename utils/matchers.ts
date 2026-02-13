import { expect as baseExpect, Page, Locator } from '@playwright/test';

// --- TYPES ---
export type SortAttribute = 'name' | 'price';
export type SortOrder = 'asc' | 'desc';

// --- PRIVATE UTILITIES ---
async function poll<T>(
  callback: () => Promise<T | null>,
  condition: (value: T) => boolean,
  timeout: number = 5000
): Promise<{ value: T | null; pass: boolean }> {
  const start = Date.now();
  let currentWait = 100;
  let value: T | null = null;

  while (Date.now() - start < timeout) {
    try {
      value = await callback();

      // Ensure we have a value and it meets our business logic
      if (value !== null && condition(value)) {
        return { value, pass: true };
      }
    } catch (error) {
      // Transient errors are expected during polling (stale elements, timing issues).
      // Silently continue and retry—the UI may be in a loading or transitional state.
    }

    // Progressive Polling: 100ms → 250ms → 500ms → 1000ms
    await new Promise((res) => setTimeout(res, currentWait));

    // Step up the wait time: 100 -> 250 -> 500 -> 1000
    if (currentWait < 1000) {
      currentWait = currentWait < 250 ? 250 : currentWait < 500 ? 500 : 1000;
    }
  }

  return { value, pass: false };
}

// --- MATCHERS ---
export const expect = baseExpect.extend({
  async toHaveStorageLength(page: Page, key: string, expected: number, options?: { timeout?: number }) {
    const assertionName = 'toHaveStorageLength';

    let actualLength: number | null = null;
    let keyExists = false;
    let errorType: string | null = null;

    const { pass } = await poll(
      async () => {
        const rawValue = await page.evaluate((k) => window.localStorage.getItem(k), key);

        if (rawValue === null) {
          keyExists = false;
          actualLength = null;
          return null;
        }

        keyExists = true;
        try {
          const parsed = JSON.parse(rawValue);
          actualLength = Array.isArray(parsed) ? parsed.length : -1;
          if (actualLength === -1) {
            errorType = 'Not an array';
            return null;
          }
        } catch {
          errorType = 'Invalid JSON';
          actualLength = -2;
          return null;
        }

        return actualLength;
      },
      (value) => value === expected,
      options?.timeout
    );

    const message = () => {
      const matcherHint = this.utils.matcherHint(assertionName, `page.localeStorage`, JSON.stringify(expected), {
        isNot: this.isNot,
      });

      const details: string[] = [];

      if (!keyExists) {
        details.push(`Key "${key}" not found in localStorage`);
      } else if (errorType) {
        details.push(`Value error: ${errorType}`);
      } else if (actualLength !== null) {
        details.push(`Expected: ${this.utils.printExpected(expected)}`);
        details.push(`Received: ${this.utils.printReceived(actualLength)}`);
      }

      return matcherHint + '\n\n' + details.join('\n');
    };

    return { message, pass };
  },

  async toBeSortedBy(locator: Locator, attribute: SortAttribute, order: SortOrder, options?: { timeout?: number }) {
    const assertionName = 'toBeSortedBy';

    const isDescending = order === 'desc';
    let actualValues: (string | number)[] = [];

    const { pass } = await poll(
      // Action: Just get the raw data
      async () => {
        actualValues = await locator.evaluateAll((elements, attr) => {
          return elements.map((el) => {
            if (attr === 'price') {
              const text = el.querySelector('.inventory_item_price')?.textContent || '0';
              return parseFloat(text.replace('$', ''));
            }
            return el.querySelector('.inventory_item_name')?.textContent?.trim() || '';
          });
        }, attribute);
        return actualValues;
      },
      // Condition: Does the data meet our sorting requirement?
      (values) =>
        values.every((val, i) => {
          if (i === 0) return true;
          const prev = values[i - 1];
          return typeof prev === 'number' && typeof val === 'number'
            ? isDescending
              ? prev >= val
              : prev <= val
            : isDescending
              ? String(prev).localeCompare(String(val)) >= 0
              : String(prev).localeCompare(String(val)) <= 0;
        }),
      options?.timeout
    );

    const message = () => {
      const matcherHint = this.utils.matcherHint(assertionName, 'locator', `'${attribute}', '${order}'`, {
        isNot: this.isNot,
      });

      const valuesToShow = actualValues.length > 10 ? [...actualValues.slice(0, 10), '...'] : actualValues;

      const details: string[] = [];
      details.push(`Attribute: ${this.utils.printExpected(attribute)}`);
      details.push(`Order:     ${this.utils.printExpected(order)}`);
      details.push(`Received:  ${this.utils.printReceived(valuesToShow)}`);

      return matcherHint + '\n\n' + details.join('\n');
    };

    return { message, pass };
  },
});
