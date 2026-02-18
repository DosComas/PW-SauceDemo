import type { Locator, ExpectMatcherState } from '@playwright/test';
import { pollUntil } from './poll.utils';
import type { SortCriteria } from '@data';

// ==========================================
// 🏛️ CUSTOM MATCHERS
// ==========================================

export const customMatchers = {
  async toBeSortedBy(
    this: ExpectMatcherState,
    locator: Locator,
    by: SortCriteria['by'],
    order: SortCriteria['order'],
    options?: { timeout?: number },
  ) {
    const assertionName = 'toBeSortedBy';
    const isDescending = order === 'desc';

    // Polling Phase
    const { value: actualValues, pass } = await pollUntil(
      // CALLBACK: Data Extraction
      async () => {
        const texts = await locator.allTextContents();

        return texts.map((text, index) => {
          const raw = text.trim();

          // Case A: Name logic (String)
          if (by === 'name') return raw;

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
          `Expected: not sorted by ${by} ${order}\n` +
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
        `Expected: ${this.utils.printExpected(`${prev} ${expectedOp} ${curr}`)} (${by} ${order})\n` +
        `Received: ${this.utils.printReceived(`${prev} ${actualOp} ${curr}`)} at index ${vIndex - 1}\n\n` +
        `Diff:\n${this.utils.diff(expectedValues, safeValues)}`
      );
    };

    return { message, pass };
  },
};
