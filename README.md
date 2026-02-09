# SauceDemo Test Suite

This project is an automation testing suite for the SauceDemo Shop web application, built using **Playwright** and **TypeScript**. It leverages **Functional Helpers** to improve test reusability and maintainability.

The tests cover critical workflows such as login, adding items to the cart, and completing the checkout process. The suite is configured to run across different browsers and screen sizes, with detailed HTML reports generated for easy tracking of test results.

# Setup Instructions

## Prerequisites

- Node.js (>= 16.x)

- NPM (comes with Node.js)

## 1. Install Dependencies

Run the following command to install all required packages:

```
npm install
```

## 2. Configure Environment Variables

Rename `.env.example` to `.env` and update values as needed.

## 3. Update Screenshots (optional)

If snapshots fail due to system or rendering differences, update them with:

```
npx playwright test --update-snapshots
```

## 4. Run Tests

To execute the tests across all configured browsers:

```
npx playwright test
```

For specific browsers, use the following commands:

```
npx playwright test --project=Chrome
npx playwright test --project=Mobile Chrome
```

## 5. View Reports

After running the tests, view the results by running:

```
npx playwright show-report
```

## Dependencies

- `playwright` - Playwright for end-to-end testing.

- `dotenv` - Environment variable management.
