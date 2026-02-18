import { test, FullConfig } from '@playwright/test';

// ==========================================
// 🏛️ POLLING UTILITY
// ==========================================

/**
 * A progressive polling utility that retries a callback until a condition is met.
 * Handles transient UI errors and scales wait times to be efficient.
 */
export async function pollUntil<T>(
  callback: () => Promise<T | null>,
  condition: (value: T) => boolean,
  timeout?: number,
): Promise<{ value: T | null; pass: boolean; lastError?: unknown }> {
  const config = test.info().config as FullConfig & { expect?: { timeout?: number } };
  const finalTimeout = timeout ?? config.expect?.timeout ?? 5_000;

  const start = Date.now();
  const INTERVALS = [100, 250, 500, 1_000] as const;

  let value: T | null = null;
  let attempt = 0;
  let lastError: unknown;

  while (Date.now() - start < finalTimeout) {
    try {
      value = await callback();
      if (value !== null && condition(value)) {
        return { value, pass: true };
      }
    } catch (err) {
      lastError = err;
    }

    const delay = INTERVALS[Math.min(attempt, INTERVALS.length - 1)];
    if (Date.now() - start + delay > finalTimeout) break;

    await new Promise((resolve) => setTimeout(resolve, delay));
    attempt++;
  }

  return { value, pass: false, lastError };
}
