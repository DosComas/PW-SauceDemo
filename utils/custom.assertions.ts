import { type Page, type Locator, type ExpectMatcherState } from '@playwright/test';
import { StateKey } from '@data';

// --- TYPES ---
export type SortCriteria = { by: 'price' | 'name'; order: 'asc' | 'desc' };

// --- PRIVATE UTILITIES ---

/**
 * A progressive polling utility that retries a callback until a condition is met.
 * Handles transient UI errors and scales wait times to be efficient.
 */
async function pollUntil<T>(
  callback: () => Promise<T | null>,
  condition: (value: T) => boolean,
  timeout: number = 5000,
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
      // Transient errors are expected during polling.
    }

    // Progressive Polling: 100ms -> 250ms -> 500ms -> 1000ms
    await new Promise((res) => setTimeout(res, currentWait));

    if (currentWait < 1000) {
      currentWait = currentWait < 250 ? 250 : currentWait < 500 ? 500 : 1000;
    }
  }

  return { value, pass: false };
}

// --- MATCHERS ---
export const customMatchers = {
  async toHaveStorageLength(
    this: ExpectMatcherState,
    page: Page,
    key: StateKey,
    expected: number,
    options?: { timeout?: number },
  ) {
    const assertionName = 'toHaveStorageLength';

    let actualLength: number | null = null;
    let keyExists = false;
    let errorType: string | null = null;

    // Polling Phase
    const { pass } = await pollUntil(
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
      options?.timeout,
    );

    // Reporting Phase
    const message = () => {
      const matcherHint = this.utils.matcherHint(assertionName, `page.localStorage`, JSON.stringify(expected), {
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

  async toBeSortedBy(this: ExpectMatcherState, locator: Locator, sort: SortCriteria, options?: { timeout?: number }) {
    const assertionName = 'toBeSortedBy';
    const isDescending = sort.order === 'desc';

    // Polling Phase
    const { value: actualValues, pass } = await pollUntil(
      // CALLBACK: Data Extraction
      async () => {
        const texts = await locator.allTextContents();

        return texts.map((text, index) => {
          const raw = text.trim();

          // Case A: Name logic (String)
          if (sort.by === 'name') return raw;

          // Case B: Price logic (Number)
          const numericPart = raw.replace(/[^0-9.-]+/g, '');
          const price = parseFloat(numericPart);

          if (!numericPart || isNaN(price)) {
            // Throwing here triggers a retry in pollUntil
            throw new Error(`Price parsing failed at index ${index}. Received: "${raw}"`);
          }

          return price;
        });
      },

      // CONDITION: Sort Validation
      (values) => {
        if (!values || values.length < 2) return true;

        return values.every((curr, i) => {
          if (i === 0) return true;
          const prev = values[i - 1];

          // Comparison Logic: Numbers vs Strings
          const isOrdered =
            typeof prev === 'number' && typeof curr === 'number'
              ? isDescending
                ? prev >= curr
                : prev <= curr
              : isDescending
                ? String(prev).localeCompare(String(curr), undefined, { numeric: true }) >= 0
                : String(prev).localeCompare(String(curr), undefined, { numeric: true }) <= 0;

          return isOrdered;
        });
      },
      options?.timeout,
    );

    // Reporting Phase
    const message = () => {
      const matcherHint = this.utils.matcherHint(assertionName, 'locator', undefined, {
        isNot: this.isNot,
        promise: this.promise,
      });

      // Guard against null if polling completely failed/timed out
      const safeValues = actualValues || [];

      const expectedValues = [...safeValues].sort((a, b) => {
        const isNum = typeof a === 'number' && typeof b === 'number';
        if (isDescending) {
          return isNum ? (b as number) - (a as number) : String(b).localeCompare(String(a));
        }
        return isNum ? (a as number) - (b as number) : String(a).localeCompare(String(b));
      });

      if (pass) {
        return (
          matcherHint +
          '\n\n' +
          `Expected: not sorted by ${sort.by} ${sort.order}\n` +
          `Received: ${this.utils.printReceived(safeValues.slice(0, 3))}...`
        );
      }

      // Find the violation
      const vIndex = safeValues.findIndex((val, i) => {
        if (i === 0) return false;
        const prev = safeValues[i - 1];
        return typeof prev === 'number' && typeof val === 'number'
          ? isDescending
            ? prev < val
            : prev > val
          : isDescending
            ? String(prev).localeCompare(String(val)) < 0
            : String(prev).localeCompare(String(val)) > 0;
      });

      // Handle edge case where no violation is found but pass is false (e.g., empty list)
      if (vIndex === -1) {
        return `${matcherHint}\n\nError: Polling timed out or received empty data.`;
      }

      const prev = safeValues[vIndex - 1];
      const curr = safeValues[vIndex];
      const expectedOp = isDescending ? '≥' : '≤';
      const actualOp = isDescending ? '<' : '>';

      return (
        matcherHint +
        '\n\n' +
        `Expected: ${this.utils.printExpected(`${prev} ${expectedOp} ${curr}`)} (${sort.by} ${sort.order})\n` +
        `Received: ${this.utils.printReceived(`${prev} ${actualOp} ${curr}`)} at index ${vIndex - 1}\n\n` +
        `Diff:\n${this.utils.diff(expectedValues, safeValues)}`
      );
    };

    return { message, pass };
  },
};
