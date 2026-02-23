# SauceDemo Test Suite

Automation testing suite for the SauceDemo Shop web application built with **Playwright**, **TypeScript**, and
**Functional Helpers**. Features a **Gateway Pattern** for unified test interactions, custom assertions with polling
resilience, and data-driven testing across multiple browsers and viewports.

## Quick Start

**Prerequisites:** Node.js (>= 16.x) and NPM

```bash
npm install              # Install dependencies
npm run all              # Run all tests
npm run base             # Run baseline tests (Chrome only)
npm run check            # Lint, format, and type-check
npm run fix              # Auto-fix linting and formatting issues
npm run report           # View HTML test report
npm run list             # List all available tests
npm run stress           # Stress test (100 repeats, no retries)
```

## Custom Scripts

| Script   | Purpose        | Details                                                               |
| -------- | -------------- | --------------------------------------------------------------------- |
| `all`    | Run all tests  | Runs across all configured browsers (Chrome, Safari, Android, iPhone) |
| `base`   | Baseline tests | Chrome only, tagged with `@👤` (authenticated users)                  |
| `stress` | Stress testing | Repeats tests 100x, no retries, captures traces on failure            |
| `report` | View results   | Opens Playwright HTML report in browser                               |
| `list`   | List tests     | Shows all available tests with filter options                         |
| `check`  | Quality gates  | Prettier (formatting), ESLint (style), TSC (types) - all must pass    |
| `fix`    | Auto-repair    | Fixes formatting and linting issues automatically                     |

## Architecture

### Gateway Pattern

All test interactions flow through a unified **Gateway** that organizes functionality into three namespaces:

```typescript
// Locators: Access UI elements
await expect(gateway.loc.plp.title).toHaveText('Products');

// Actions: Perform user interactions
await gateway.act.login.submitCredentials({ user, pass });

// Queries: Read application state
const cart = await gateway.query.session.readCart();
```

**Benefits:**

- ✅ Single entry point for all test operations
- ✅ Type-safe access to all features
- ✅ Consistent naming across domains
- ✅ Clear separation of concerns (loc/act/query)

## Project Structure

```
PW-SauceDemo/
├── data/                           # Test data, personas, environment config
│   ├── index.ts                    # Re-exports all data
│   ├── env.data.ts                 # Environment configuration
│   ├── personas.data.ts            # User personas (baseline, unauthorized)
│   ├── session.data.ts             # Storage keys and session management
│   ├── mock.data.ts                # Mock data for UI injection
│   └── i18n/                       # Internationalization
│       ├── dictionary.ts           # i18n type definitions
│       └── languages/              # Language-specific strings
├── helpers/                        # Reusable actions, locators, queries (Gateway domains)
│   ├── index.ts                    # Gateway factory (createGateway)
│   ├── account.helpers.ts          # Login, menu, session queries
│   ├── catalog.helpers.ts          # Product pages (PLP/PDP) actions & queries
│   ├── purchase.helpers.ts         # Cart operations
│   └── core/                       # Shared utilities
│       ├── fragments.core.ts       # Reusable item element structure
│       ├── layout.core.ts          # Header, footer, shared locators
│       └── logic.core.ts           # Data manipulation logic
├── fixtures/
│   ├── base.fixtures.ts            # Custom fixtures with Gateway
│   └── index.ts                    # Re-export fixtures
├── tests/
│   ├── auth.setup.ts               # Authentication setup for storage state
│   ├── account/                    # Login, logout, navigation
│   │   ├── login.spec.ts
│   │   ├── logout.spec.ts
│   │   └── navigation.spec.ts
│   ├── catalog/                    # Product listing (PLP) & detail (PDP)
│   │   ├── plp.spec.ts
│   │   └── pdp.spec.ts
│   ├── purchase/                   # Shopping cart & checkout
│   │   ├── cart.spec.ts
│   │   └── checkout.spec.ts
│   └── journeys/                   # End-to-end workflows
│       └── successful-order.spec.ts
├── utils/                          # Testing utilities and custom matchers
│   ├── custom.assertions.ts        # Custom Playwright matchers
│   ├── poll.utils.ts               # Polling utility for resilient waiting
│   ├── storage.utils.ts            # LocalStorage and cookie helpers
│   ├── random.utils.ts             # Seeded random generation
│   └── index.ts                    # Re-exports
├── playwright.config.ts            # Configuration with path aliases
├── tsconfig.json                   # TypeScript configuration
└── .env.example                    # Environment variables template
```

## Test Philosophy

**Arrange-Act-Assert (AAA) with Emoji Categories**

All tests follow strict AAA structure with emoji prefixes for automatic categorization:

| Emoji  | Phase       | Examples                                         |
| ------ | ----------- | ------------------------------------------------ |
| **⬜** | **Arrange** | Navigation, setup, data collection, waiting      |
| **🟦** | **Act**     | User clicks, form fills, page reloads, workflows |
| **🟧** | **Assert**  | Expectations, screenshots, state verification    |

**Data-Driven Approach:** Collect data during Arrange, use in Assert. No hard-coded values.

```typescript
// ✅ Correct: Collect during Arrange, use in Assert
const items = await query.plp.readItems({ index: [0, 1, 2] });
await act.plp.addToCart({ index: [0, 1, 2] });
expect(await query.session.readCart()).toHaveLength(items.length);

// ❌ Wrong: Hard-coded assertion
expect(await query.session.readCart()).toHaveLength(3);
```

## Locator Strategy

**Priority order:**

1. **ARIA locators** (`getByRole`, `getByLabel`) - Most accessible & resilient
2. **Test IDs** (`getByTestId`) - Explicit & stable
3. **Semantic locators** (`getByPlaceholder`, `getByText`) - Works with i18n

**Localization:** All user-facing text comes from `dictionary.ts` (i18n), enabling tests to work across languages:

```typescript
// Locators use i18n dictionary for text
nameInput: page.getByPlaceholder(t.login.username),
loginBtn: page.getByRole('button', { name: t.login.button }),
```

## Helper Organization

Each domain helper exports three namespaces:

```typescript
export const catalog = (page: Page) => ({
  // loc: UI element selectors
  loc: { plp: { ... }, pdp: { ... } },

  // act: User interaction functions
  act: { plp: { addToCart, openItem, sortGrid }, pdp: { ... } },

  // query: Data retrieval functions
  query: { plp: { readItems }, pdp: { readItem } },
});
```

**Action Naming Convention:**

- _Delete/Read:_ `readUser`, `readCart`
- _Create/Write:_ `submitCredentials`, `addToCart`
- _Navigate:_ `openItem`, `openCart`, `openMenu`
- _Modify UI:_ `sortGrid`, `mockGrid`

## Fixtures

Custom fixtures provide Gateway access to all test operations:

```typescript
import { test, expect } from '@fixtures';

test('Example', async ({ loc, act, query }) => {
  // loc: Access UI elements
  await expect(loc.plp.title).toHaveText('Products');

  // act: Perform actions
  await act.login.submitCredentials({ user: 'john_doe', pass: 'password123' });

  // query: Check state
  const cart = await query.session.readCart();
  expect(cart).toHaveLength(0);
});
```

## Utilities & Custom Matchers

### Poll Utility

Resilient polling for async conditions with progressive backoff:

```typescript
const { value, pass } = await pollUntil(
  async () => {
    // Callback: fetch data or check condition
    return await page.evaluate(() => window.appData);
  },
  (value) => {
    // Condition: return true to stop polling
    return value?.isReady === true;
  },
  5000, // timeout ms
);
```

**Features:**

- Retries on transient failures
- Progressive intervals: 100ms → 250ms → 500ms → 1000ms
- Respects config timeout settings

### Custom Matchers

**`toBeSortedBy(locator, by, order)`**

Verifies elements are sorted with polling resilience:

```typescript
// All product names in ascending order
await expect(loc.plp.items.names).toBeSortedBy('names', 'asc');

// All prices in descending order
await expect(loc.plp.items.prices).toBeSortedBy('prices', 'desc');
```

**Features:**

- Polls until list is sorted (handles dynamic DOM)
- Pinpoints violation index in detailed failure message
- Shows side-by-side diff of actual vs expected order

### Random Utility

Seeded random generation for reproducible test data:

```typescript
const random = createRandom();

// Generate 3 unique item indices from pool of 5
const basket = random.basket(3, 5); // e.g., [2, 0, 4]

// Pick random item from array or range
const itemId = random.target([1, 5, 8]); // Picks from array
const index = random.target(10); // Random 0-10
```

**Features:**

- Seeded RNG for deterministic test runs
- `basket(count, max)` creates unique random selections
- `target(input)` picks from array or random range
- Seed value visible in HTML report title for debugging

### Storage Utility

Read localStorage and cookies for state verification:

```typescript
// Read cart items (number array)
const cartItems = await query.session.readCart();

// Read user cookie
const user = await query.session.readUser(); // returns Cookie | undefined
```

## Test Coverage

| Domain       | Tests   | Coverage                                      |
| ------------ | ------- | --------------------------------------------- |
| **Account**  | 3 tests | Login, logout, menu navigation                |
| **Catalog**  | 4 tests | PLP sorting, add/remove, PDP matching         |
| **Purchase** | 3 tests | Cart management, linking, visual verification |
| **Journeys** | 1 test  | End-to-end checkout _(in progress)_           |
| **Total**    | **124** | Chrome, Safari, Android, iPhone               |

## Type System

**Domain Schemas** (`data/types.ts`):

```typescript
type Branch<T> = T | { readonly [k: string]: T | { readonly [k: string]: T } };

export type LocSchema = Branch<Locator | LocatorBundle | ((...args: never[]) => Locator | LocatorBundle)>;
export type ActSchema = Branch<(...args: never[]) => Promise<void>>;
export type QuerySchema = Branch<(...args: never[]) => Promise<unknown>>;
```

- **2-level max nesting:** `root.a.b` ✅ (enforced for simplicity)
- **Type safety:** Everything satisfies schemas before export
- **Parameter strictness:** Enforced via `satisfies` in implementations

## Import Path Aliases

The project uses TypeScript path aliases for clean imports:

```typescript
import { STORAGE_KEYS, VALID_USERS, t } from '@data'; // data/index.ts
import { createRandom, pollUntil } from '@utils'; // utils/index.ts
import { test, expect } from '@fixtures'; // fixtures/index.ts
```

## Contributing

**Code Style:**

- Use semantic method names (`submitCredentials`, not `submit`)
- Prefer `readX()` for query functions (matches `readUser`, `readCart`, `readItems`)
- Comments only for complex logic (types & names are self-documenting)
- Lean on TypeScript for type safety over comments

**Test Guidelines:**

- Every test must have AAA structure with emoji categories
- Assertions must include context: `'🟧 UI: ...'` or `'🟧 Data: ...'`
- Use `.soft()` for non-critical checks (continues test on failure)
- Collect data during Arrange, compare in Assert

**Before Commit:**

```bash
npm run check  # Format, lint, type-check
npm run base   # Run baseline tests
```
