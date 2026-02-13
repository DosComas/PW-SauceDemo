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

    // 1. Polling Phase
    const { pass } = await poll(
      async () => {
        const rawValue = await page.evaluate((k) => window.localStorage.getItem(k), key);

        // Validation Logic
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

    // 2. Reporting Phase
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

    // 1. Polling Phase
    const { pass } = await poll(
      async () => {
        actualValues = await locator.evaluateAll((elements, attr) => {
          return elements.map((el) => {
            if (attr === 'price') {
              // Parse "$9.99" -> 9.99
              const text = el.querySelector('.inventory_item_price')?.textContent || '0';
              return parseFloat(text.replace('$', ''));
            }
            return el.querySelector('.inventory_item_name')?.textContent?.trim() || '';
          });
        }, attribute);
        return actualValues;
      },
      (values) => {
        // Validation Logic
        return values.every((val, i) => {
          if (i === 0) return true;
          const prev = values[i - 1];
          // Number comparison or String comparison
          return typeof prev === 'number' && typeof val === 'number'
            ? isDescending
              ? prev >= val
              : prev <= val
            : isDescending
              ? String(prev).localeCompare(String(val)) >= 0
              : String(prev).localeCompare(String(val)) <= 0;
        });
      },
      options?.timeout
    );

    // 2. Reporting Phase
    const message = () => {
      const matcherHint = this.utils.matcherHint(assertionName, 'locator', `'${attribute}', '${order}'`, {
        isNot: this.isNot,
      });

      const details: string[] = [];
      details.push(`Attribute: ${this.utils.printExpected(attribute)}`);
      details.push(`Order:     ${this.utils.printExpected(order)}`);

      if (pass) {
        // Pass case (only shown if .not is used)
        details.push(`Received:  ${this.utils.printReceived(actualValues)}`);
      } else {
        // Fail case: Find and highlight the specific violation
        let violationIndex = -1;
        for (let i = 1; i < actualValues.length; i++) {
          const prev = actualValues[i - 1];
          const curr = actualValues[i];

          const isCorrect =
            typeof prev === 'number' && typeof curr === 'number'
              ? isDescending
                ? prev >= curr
                : prev <= curr
              : isDescending
                ? String(prev).localeCompare(String(curr)) >= 0
                : String(prev).localeCompare(String(curr)) <= 0;

          if (!isCorrect) {
            violationIndex = i;
            break;
          }
        }

        if (violationIndex !== -1) {
          const prev = actualValues[violationIndex - 1];
          const curr = actualValues[violationIndex];
          const operator = isDescending ? '>=' : '<=';

          details.push(
            `Violation: ${this.utils.printReceived(prev)} ${operator} ${this.utils.printReceived(curr)} at index [${violationIndex - 1}→${violationIndex}]`
          );
        }

        // Show relevant slice of the array
        const sliceEnd = Math.min(violationIndex + 2, actualValues.length);
        const relevantSlice = actualValues.slice(0, sliceEnd);
        details.push(
          `Received:  ${this.utils.printReceived(relevantSlice)}${actualValues.length > sliceEnd ? ' ...' : ''}`
        );
      }

      return matcherHint + '\n\n' + details.join('\n');
    };

    return { message, pass };
  },
});
