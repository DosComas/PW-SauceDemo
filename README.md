# SauceDemo Test Suite

Automation testing suite for the SauceDemo Shop web application built with Playwright, TypeScript, and functional
helpers. It uses a gateway pattern for unified test interactions, custom assertions with polling resilience, and
data-driven testing across multiple browsers and viewports.

## Quick Start

Prerequisites: Node.js 18+ and npm.

1. Install project dependencies

```bash
npm install
```

2. Install Playwright browsers

```bash
npx playwright install
```

3. Run the tests

```bash
npm run all
npm run base
npm run e2e
npm run a11y
npm run visual
npm run dev
npm run stress
npm run report
npm run list
npm run check
npm run fix
```

4. Setup the local application (optional)

```bash
git submodule update --init --recursive
cd app-source && npm install
```

> Note: Ensure your `.env` file is configured with `ENVIRONMENT=local` to target the local server instead of a remote
> environment.

### Test Tag Summary

- `@👤` — baseline authenticated user tests
- `@e2e` — functional flow tests — fast regression
- `@aria` — ARIA milestone/accessibility assertions
- `@axe` — Axe scan validation
- `@visual` — screenshot/layout visual checks

> Note: `tests/auth.setup.ts` includes setup/login state tests and is listed alongside the domain specs in
> `npm run list`, but it is a dedicated setup fixture flow rather than a core domain scenario.

## Architecture

### Gateway Pattern

All test interactions flow through a unified Gateway that organizes functionality into four namespaces:

```typescript
// Locators: Access UI elements
await expect(gateway.loc.plp.title).toHaveText('Products');

// Actions: Perform user interactions
await gateway.act.login.submitCredentials({ username: 'standard_user', password: 'secret_sauce' });

// Queries: Read application state
const cart = await gateway.query.session.readCart();

// Accessibility checks
await gateway.a11y.aria.login();
await gateway.a11y.axe.login({ testInfo });
```

The main namespaces are:

- `loc` for locators
- `act` for user actions
- `query` for state and data reads
- `a11y` for accessibility checks, split into `aria` and `axe`

## Project Structure

```text
PW-SauceDemo/
├── data/                           # Test data, personas, environment config
├── fixtures/                      # Shared Playwright fixtures
├── helpers/                       # Reusable actions, locators, queries, and a11y helpers
├── tests/                         # Test specs grouped by area
├── utils/                         # Testing utilities and custom matchers
├── package.json                   # Scripts and dependencies
└── playwright.config.ts           # Playwright configuration
```

## Test Philosophy

Arrange-Act-Assert with emoji categories:

| Emoji  | Phase       | Examples                                         |
| ------ | ----------- | ------------------------------------------------ |
| **⬜** | **Arrange** | Navigation, setup, data collection, waiting      |
| **🟦** | **Act**     | User clicks, form fills, page reloads, workflows |
| **🟧** | **Assert**  | Expectations, screenshots, state verification    |

Data-driven tests keep the suite readable and resilient. Persona and session data are collected during setup and used
later in assertions.

## Locator Strategy

Priority order:

1. ARIA locators (`getByRole`, `getByLabel`) - most accessible and resilient
2. Test IDs (`getByTestId`) - explicit and stable
3. Semantic locators (`getByPlaceholder`, `getByText`) - useful when the UI text is the contract

## Helper Organization

Each domain helper exports locators, actions, queries, and accessibility helpers behind the shared gateway.

## Fixtures

Custom fixtures provide gateway access to the shared loc/act/query/a11y APIs across the suite.

## Utilities & Custom Matchers

The suite includes polling utilities, custom assertions, and seeded random helpers for repeatable but varied test data.

Read localStorage and cookies for state verification:

```typescript
// Read cart items (number array)
const cartItems = await query.session.readCart();

// Read user cookie
const user = await query.session.readUser(); // returns Cookie | undefined
```

## Test Coverage

| Domain       | Tests    | Coverage                                                  |
| ------------ | -------- | --------------------------------------------------------- |
| **Account**  | 7 tests  | Login, logout, layout/navigation                          |
| **Catalog**  | 8 tests  | PLP sorting, PDP behavior, add/remove flows               |
| **Purchase** | 10 tests | Cart and checkout workflows                               |
| **Journeys** | 6 tests  | End-to-end order flows (including ARIA and AXE variants)  |
| **Total**    | **116**  | Baseline execution across Chrome, Safari, Android, iPhone |

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

**Before Commit**

1. Verify Stability: Use `test.only` on your target test case and run the stress script to ensure it remains stable
   under load.

> Note: Ensure all `.only` annotations are removed before committing; the check script will flag any remaining
> instances.

2. Quality Gate: Run the `check` script to ensure formatting, linting, and type-checking pass.

```bash
# Run the stress suite for your isolated test
npm run stress

# Run quality checks
npm run check
```

## Testing Standards: The Flat Slug Protocol

We use Flat Slugs to ensure our test reports read like a Business Requirement Document. Every test name should describe
a specific rule or behavior without technical "stutter." Core Naming Rules

- No Redundancy: Do not repeat the folder or file name in the test title (e.g., in cart.spec.ts, use remove item logic
  instead of Cart remove item).
- Business Slugs: Use lowercase, space-separated English for actions (e.g., first name required).
- Technical Contexts: Use underscores for roles and system identifiers (e.g., problem_user, mobile_safari).
- The Colon Exception: Use a colon (:) only to group variations or categories (e.g., visual: cart layout).

**Example Log Entry**

[chrome] › account\layout.spec.ts › normal_user › about link

[chrome] › catalog\plp.spec.ts › normal_user › name descending sorting

[chrome] › catalog\pdp.spec.ts › normal_user › add/remove item logic

[chrome] › purchase\cart.spec.ts › normal_user › plp persistence: on return

[chrome] › purchase\cart.spec.ts › normal_user › item data consistency

[chrome] › journeys\order-flow.spec.ts › normal_user › bulk plp purchase
