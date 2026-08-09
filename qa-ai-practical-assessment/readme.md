# QA AI Practical Assessment

End-to-end and API test automation for the **Practice Software Testing Toolshop**, built with Playwright (JavaScript), a Prism-style Page Object Model, and Cursor-assisted QA workflow documentation.

**Repository:** https://github.com/chandansingh-del/QA-AI-assisment

---

# Project Information

| Item | Detail |
|------|--------|
| **Assessment** | QA AI Capability Exercise |
| **Primary AI tool** | Cursor |
| **Automation** | Playwright (`@playwright/test` ^1.49.0) |
| **Assessment period** | 6 August 2026 – 9 August 2026 |
| **Detailed AI workflow** | [`project-info.md`](project-info.md) |
| **Prompt history** | [`ai-prompts/`](ai-prompts/) |

---

## Application Under Test

| Resource | URL |
|----------|-----|
| **Web UI** | https://practicesoftwaretesting.com/ |
| **API base** | https://api.practicesoftwaretesting.com/ |
| **API documentation** | https://api.practicesoftwaretesting.com/api/documentation |
| **SUT reference (seeded accounts)** | https://github.com/testsmith-io/practice-software-testing |

**Scope:** UI AC1 (register, login, profile), UI AC2 (browse, cart, quantity, COD checkout, double-confirm invoice, My Invoices), API AC1 (register, login, token, cart), API AC2 (products, cart, invoice lifecycle), and targeted negative/regression coverage within assessment case limits.

**Known UI behaviour:** Invoice generation requires clicking **Confirm** (`data-test="finish"`) **twice** on the checkout confirmation step.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Language | JavaScript (Node.js 18+) |
| Test runner | Playwright Test |
| UI browser | Chromium (Desktop Chrome profile) |
| API client | Playwright `APIRequestContext` |
| Configuration | `dotenv`, `playwright.config.js` |
| Pattern | Page Object Model + custom fixtures |
| AI assistant | Cursor (planning, implementation, debugging, documentation) |
| Reporting | Playwright HTML reporter |

---

## Framework Architecture

Automation lives in `PrismStructure/` and separates concerns by layer:

```
┌─────────────────────────────────────────────────────────┐
│  tests/ui/  ·  tests/api/     (@smoke / @regression)    │
├─────────────────────────────────────────────────────────┤
│  fixtures/index.js            (test.extend injection)   │
├──────────────┬──────────────────────────────────────────┤
│  pages/      │  api/           (Page Objects · services) │
├──────────────┴──────────────────────────────────────────┤
│  test-data/testData.js  ·  utils/productResolver.js     │
└─────────────────────────────────────────────────────────┘
```

| Layer | Responsibility |
|-------|----------------|
| `tests/` | Scenarios, tags, assertions |
| `pages/` | UI locators and user actions |
| `api/` | REST wrappers returning `ApiResponse` |
| `fixtures/` | Injects page objects, API clients, `authenticatedApi` |
| `test-data/` | Payload builders; credentials from environment |
| `utils/` | Product ID resolution, shared assertion helpers |

Playwright projects in `playwright.config.js`:

- **`ui-chromium`** — browser tests under `tests/ui/` (`testIdAttribute: 'data-test'`)
- **`api`** — HTTP tests under `tests/api/`

---

## Repository Structure

```
qa-ai-practical-assessment/
├── FunctionalTestCase.csv       # 8 manual test cases (2 smoke, 6 regression)
├── project-info.md              # AI-assisted workflow narrative
├── readme.md                    # This file
├── requirements/                # Requirement, strategy, selector, API analysis
│   ├── requirement-risk-analysis.md
│   ├── toolshop-flow-analysis.md
│   ├── test-strategy.md
│   ├── ui-selector-strategy.md
│   └── api-analysis.md
├── ai-prompts/                  # Phase prompt histories
├── execution-evidence/          # Manual + automation evidence (attach on run)
├── PrismStructure/              # Playwright automation root
│   ├── playwright.config.js
│   ├── package.json
│   ├── .env.example
│   ├── fixtures/
│   ├── pages/
│   ├── api/
│   ├── tests/ui/                # 4 smoke + 4 regression specs
│   ├── tests/api/               # 2 smoke + 4 regression specs
│   ├── test-data/testData.js
│   ├── utils/
│   ├── scripts/                 # API connectivity check, DOM inspection
│   ├── playwright-report/       # Generated HTML report (gitignored)
│   └── test-results/            # Failure screenshots/traces (gitignored)
└── .cursor/rules/               # QA conventions for Cursor
```

---

## Prerequisites

- **Node.js** 18 or later and **npm**
- **Git**
- Network access to the public Toolshop UI and API
- A local `.env` file with seeded credentials (see below)

Optional: **Cursor** IDE (used during assessment development; not required to run tests).

---

## Installation

Clone the repository and install dependencies from the automation root:

```bash
git clone https://github.com/chandansingh-del/QA-AI-assisment.git
cd QA-AI-assisment/qa-ai-practical-assessment/PrismStructure
npm install
npx playwright install chromium
```

Verify API connectivity (optional pre-flight):

```bash
node scripts/api-connectivity-check.js
```

> All test commands below assume your shell is in the `PrismStructure/` directory (where `package.json` lives).

---

## Environment Variables

Copy the template and set values locally. **Never commit `.env`.**

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `BASE_URL` | No (has default) | UI base URL — default `https://practicesoftwaretesting.com` |
| `API_BASE_URL` | No (has default) | API base URL — default `https://api.practicesoftwaretesting.com` |
| `CUSTOMER_EMAIL` | **Yes** | Seeded customer login (UI/API smoke & regression) |
| `CUSTOMER_PASSWORD` | **Yes** | Seeded customer password |
| `REGISTRATION_PASSWORD` | **Yes** | Password for newly registered users in tests |
| `CUSTOMER2_*`, `ADMIN_*` | No | Optional accounts for stretch scenarios |
| `TEST_EMAIL_PREFIX` | No | Prefix for generated emails (default `qa.auto`) |

Seeded account values are documented in the [public SUT README](https://github.com/testsmith-io/practice-software-testing). Set them in `.env` only on your machine.

Optional Playwright timeouts (milliseconds):

- `PW_TIMEOUT_MS` (default `60000`)
- `PW_EXPECT_TIMEOUT_MS` (default `10000`)
- `PW_ACTION_TIMEOUT_MS` (default `15000`)

---

## Test Data

Central module: `PrismStructure/test-data/testData.js`

| Data type | Approach |
|-----------|----------|
| Credentials | Environment variables only |
| Unique registration emails | `uniqueEmail('ui')` / `uniqueEmail('api')` — timestamp + random suffix |
| Product IDs | Resolved at runtime via `utils/productResolver.js` (no hardcoded ULIDs) |
| Checkout / invoice billing | Assessment block: Zoey Shore, Hesselbury, Florida, TG, 1234AA, COD |
| Negative payloads | Builders for weak password, duplicate email, invalid login, missing fields |

See also: [`PrismStructure/test-data/README.md`](PrismStructure/test-data/README.md) and [`ai-prompts/test-data.md`](ai-prompts/test-data.md).

---

## Running UI Smoke Tests

From `PrismStructure/`:

```bash
npm run test:ui:smoke
```

Equivalent:

```bash
npx playwright test --project ui-chromium --grep @smoke
```

**Specs (4):**

| File | Coverage |
|------|----------|
| `tests/ui/smoke/registration-login-profile.spec.js` | Register → login → profile |
| `tests/ui/smoke/product-browse-search.spec.js` | Category browse + search |
| `tests/ui/smoke/cart-quantity-update.spec.js` | Multi-item cart + quantity update |
| `tests/ui/smoke/checkout-invoice.spec.js` | COD checkout, double-confirm, My Invoices |

Recommended on the shared public SUT (reduces session/cart collisions):

```bash
npx playwright test --project ui-chromium --grep @smoke --workers=1
```

---

## Running UI Regression Tests

There is no dedicated `test:ui:regression` npm script. Run UI regression with:

```bash
npx playwright test --project ui-chromium --grep @regression
```

Recommended:

```bash
npx playwright test --project ui-chromium --grep @regression --workers=1
```

**Specs (4):**

| File | Coverage |
|------|----------|
| `tests/ui/regression/invalid-login.spec.js` | Wrong password; protected routes |
| `tests/ui/regression/registration-validation.spec.js` | Weak password + duplicate email |
| `tests/ui/regression/single-confirm-no-invoice.spec.js` | One Confirm → no new invoice |
| `tests/ui/regression/empty-cart-checkout.spec.js` | Empty cart cannot checkout |

---

## Running API Smoke Tests

From `PrismStructure/`:

```bash
npm run test:api:smoke
```

Equivalent:

```bash
npx playwright test --project api --grep @smoke
```

**Specs (2 E2E):**

| File | Coverage |
|------|----------|
| `tests/api/smoke/auth-registration-cart.spec.js` | Register → login → token → profile → cart |
| `tests/api/smoke/invoice-lifecycle.spec.js` | Products → cart → payment check → invoice → retrieval |

---

## Running API Regression Tests

There is no dedicated `test:api:regression` npm script. Run API regression with:

```bash
npx playwright test --project api --grep @regression
```

**Specs (4):**

| File | Coverage |
|------|----------|
| `tests/api/regression/auth-negative.spec.js` | Invalid/missing tokens; unauthenticated invoice |
| `tests/api/regression/registration-negative.spec.js` | Weak password; duplicate email; missing email |
| `tests/api/regression/cart-product-negative.spec.js` | Invalid product; qty bounds; unknown cart/product |
| `tests/api/regression/invoice-negative.spec.js` | Missing billing/payment fields; invalid cart |

---

## Running Complete Suite

From `PrismStructure/`:

```bash
npm test
```

Tag-filtered suites (UI + API combined):

```bash
npm run test:smoke        # all @smoke (UI + API)
npm run test:regression   # all @regression (UI + API)
```

Run only UI or only API (all tags):

```bash
npm run test:ui
npm run test:api
```

Recommended for stable runs against the shared environment:

```bash
npx playwright test --workers=1
```

---

## Reports

After a test run, open the HTML report:

```bash
npm run report
```

Report output directory: `PrismStructure/playwright-report/` (configured in `playwright.config.js`; `open: 'never'` — use `npm run report` to view locally).

Console output uses the Playwright `list` reporter.

---

## Screenshots/Traces

Configured in `playwright.config.js`:

| Artifact | When captured | Location |
|----------|---------------|----------|
| Screenshot | Test failure | `PrismStructure/test-results/` |
| Video | Test failure | `PrismStructure/test-results/` |
| Trace | First retry only | `PrismStructure/test-results/` |

Open a trace (after a retrying failure):

```bash
npx playwright show-trace test-results/<trace-folder>/trace.zip
```

---

## Execution Evidence

Assessment deliverable folder: [`execution-evidence/`](execution-evidence/)

Attach after runs:

- Playwright HTML report export or screenshots
- Failed-test traces (redact tokens)
- Manual test notes and screenshots (`execution-evidence/manual/`)

Naming convention: `YYYY-MM-DD_<suite>_<browser>_<result>.png`

**Current status:** Manual cases in `FunctionalTestCase.csv` are designed with status **Not Executed**. Automation was run during development; copy latest `playwright-report/` into `execution-evidence/` before submission.

---

## Test Case Summary

### Manual (`FunctionalTestCase.csv`) — 8 cases

| ID | Tag | Scenario |
|----|-----|----------|
| TC-MAN-001 | @smoke | Registration, login, profile (AC1) |
| TC-MAN-002 | @smoke | Full E2E COD purchase with double-confirm + My Invoices (AC2) |
| TC-MAN-003 | @regression | Invalid login |
| TC-MAN-004 | @regression | Weak password + duplicate email |
| TC-MAN-005 | @regression | Single confirm does not create invoice |
| TC-MAN-006 | @regression | Empty cart checkout blocked |
| TC-MAN-007 | @regression | Out-of-stock add-to-cart blocked |
| TC-MAN-008 | @regression | Logout clears session |

### UI automation — 8 specs

| Tier | Count | Location |
|------|-------|----------|
| Smoke | 4 | `PrismStructure/tests/ui/smoke/` |
| Regression | 4 | `PrismStructure/tests/ui/regression/` |

### API automation — 6 specs

| Tier | Count | Location |
|------|-------|----------|
| Smoke (E2E) | 2 | `PrismStructure/tests/api/smoke/` |
| Regression | 4 | `PrismStructure/tests/api/regression/` |

**Not automated in UI (by design — slot limit):** TC-MAN-007 (OOS), TC-MAN-008 (logout/session).

---

## Traceability

Registers are defined in [`requirements/test-strategy.md`](requirements/test-strategy.md). Summary:

```
REQ-AC1-UI  → SC-01  → TC-MAN-001  → TC-UI-SMOKE-001
REQ-AC2-UI  → SC-02  → TC-MAN-002  → TC-UI-SMOKE-002, 003, 004
REQ-CONFIRM → SC-06  → TC-MAN-005  → TC-UI-REG-003
REQ-NEG     → SC-04  → TC-MAN-003  → TC-UI-REG-001
REQ-NEG     → SC-05  → TC-MAN-004  → TC-UI-REG-002
REQ-NEG     → SC-08  → TC-MAN-006  → TC-UI-REG-004
REQ-AC1-API → SC-09  → TC-API-001  → auth-registration-cart.spec.js
REQ-AC2-API → SC-10  → TC-API-002  → invoice-lifecycle.spec.js
```

Spec file headers and [`PrismStructure/tests/api/README.md`](PrismStructure/tests/api/README.md) contain per-file SC/TC mappings.

---

## AI-Assisted QA Workflow

This project documents a **human-reviewed, AI-assisted** lifecycle:

1. Requirements and risk extraction → `requirements/`
2. Test strategy and manual CSV design → `FunctionalTestCase.csv`
3. Live DOM / OpenAPI analysis → selector and API reference docs
4. Playwright framework and suites → `PrismStructure/`
5. Iterative debugging with classified root cause (e.g. checkout billing 422)
6. Phase prompt histories → `ai-prompts/`

AI (Cursor) drafted artifacts and code; **QA judgment validated** outputs against the assessment PDF, live SUT behaviour, and Playwright runs. Incorrect AI suggestions were rejected (e.g. `data-testid` assumption, misclassified checkout failure, non-existent `email-error` locator).

Full narrative: [`project-info.md`](project-info.md)

---

## Known Limitations

- **Shared public SUT** — parallel runs may collide on carts/sessions; prefer `--workers=1` for UI suites.
- **Manual execution** — eight manual cases are documented but not executed in this repository yet.
- **UI coverage gaps** — OOS (TC-MAN-007) and logout/session (TC-MAN-008) are manual-only within the 4 UI regression slot limit.
- **Selector gaps** — invoice detail view uses labelled textboxes; not all fields have `data-test` hooks.
- **API vs UI parity** — live API may accept out-of-stock add-to-cart (200) while UI blocks it; API regression does not duplicate OOS UI coverage.
- **OpenAPI drift** — e.g. `POST /invoices` returns `201` (not documented `200`); tests assert live behaviour.
- **Execution evidence** — reports are generated under `playwright-report/`; copies for submission must be added to `execution-evidence/` manually.

---

## Git History

Recent commits on `main` (automation delivered incrementally):

| Commit | Summary |
|--------|---------|
| `1d471cf` | Documentation history |
| `88e2720` | Test data prompt history |
| `2ecaf19` | Debugging and history generation |
| `bf8b46b` | UI + API traceability |
| `985fe82` | API Smoke test |
| `c62ed41` | Analyze API documentation |
| `cdc08f5` | Create Page Objects and UI Smoke |
| `6a7b498` | Inspect actual UI before writing selectors |
| `1427da2` | Framework architecture |
| `ae7e6a0` | Test Cases |

```bash
git clone https://github.com/chandansingh-del/QA-AI-assisment.git
cd QA-AI-assisment
git log --oneline -- qa-ai-practical-assessment/
```

---

## Quick Reference

| Goal | Command (from `PrismStructure/`) |
|------|-----------------------------------|
| Install | `npm install && npx playwright install chromium` |
| Configure | `cp .env.example .env` then edit credentials |
| UI smoke | `npm run test:ui:smoke` |
| UI regression | `npx playwright test --project ui-chromium --grep @regression` |
| API smoke | `npm run test:api:smoke` |
| API regression | `npx playwright test --project api --grep @regression` |
| All tests | `npm test` |
| HTML report | `npm run report` |
| API pre-flight | `node scripts/api-connectivity-check.js` |
