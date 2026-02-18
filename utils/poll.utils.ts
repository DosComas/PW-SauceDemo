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
  timeout = 5000,
): Promise<{ value: T | null; pass: boolean; lastError?: unknown }> {
  const start = Date.now();
  const INTERVALS = [100, 250, 500, 1000] as const;

  let value: T | null = null;
  let attempt = 0;
  let lastError: unknown;

  while (Date.now() - start < timeout) {
    try {
      value = await callback();
      if (value !== null && condition(value)) {
        return { value, pass: true };
      }
    } catch (err) {
      // 🏛️ Capture the error so we aren't "blind" if it times out
      lastError = err;
    }

    // 🏛️ Select delay, capping at the last element of the array
    const delay = INTERVALS[Math.min(attempt, INTERVALS.length - 1)];

    // 🏛️ Check if we actually have time left to sleep
    if (Date.now() - start + delay > timeout) break;

    await new Promise((resolve) => setTimeout(resolve, delay));
    attempt++;
  }

  return { value, pass: false, lastError };
}
