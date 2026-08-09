# PrismStructure — Playwright Framework

Prism-style Page Object Model for Toolshop UI + API automation (JavaScript).

## Architecture

```
PrismStructure/
├── playwright.config.js     # UI + API projects, reporters, failure artifacts
├── package.json
├── fixtures/
│   └── index.js               # test.extend — page objects + API services + auth
├── pages/                     # UI Page Object Model (actions only)
│   ├── BasePage.js
│   ├── LoginPage.js …         # One class per route/flow
│   └── index.js
├── api/                       # API service classes (REST wrappers)
│   ├── BaseApi.js
│   ├── AuthApi.js … CartApi.js, InvoiceApi.js, PaymentApi.js
│   └── index.js
├── tests/
│   ├── ui/                    # Browser specs — import from fixtures/
│   └── api/                   # API specs — import from fixtures/
├── utils/
│   ├── config.js
│   ├── productResolver.js     # Runtime product ID lookup
│   └── apiAssertions.js       # Status + JSON helpers
└── test-data/
    └── testData.js            # Deterministic builders + env credentials
```

## Design principles

| Layer | Responsibility |
|-------|----------------|
| **tests/** | Scenarios, tags (`@smoke` / `@regression`), assertions |
| **pages/** | Locators + user actions (no assertions) |
| **api/** | HTTP calls to documented endpoints |
| **fixtures/** | Dependency injection via `test.extend` |
| **test-data/** | Payloads, unique emails, env-based credentials |
| **utils/** | Pure helpers (product resolver, API assertions) |

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env   # set CUSTOMER_EMAIL, CUSTOMER_PASSWORD, REGISTRATION_PASSWORD
```

## Run

```bash
npm run test:ui:smoke
npm run test:api:smoke
npm run test:regression
npm run report
```

## Key patterns

- **Double confirm:** `checkoutPage.confirmOrderTwice()` (assessment requirement)
- **No hardcoded credentials:** `.env` + `testData.getSeededCustomerCredentials()`
- **No hardcoded product IDs:** `utils/productResolver.js`
- **No test interdependency:** fresh cart per test; `authenticatedApi` per test

## Status

Framework and test suites implemented: **8 UI** specs (4 smoke + 4 regression) and **6 API** specs (2 smoke + 4 regression). See root `readme.md` and `execution-evidence/EXECUTION-SUMMARY.md` for run results.
