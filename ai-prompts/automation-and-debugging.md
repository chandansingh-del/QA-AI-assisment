# AI Prompts – Automation and Debugging

Prompt history for Playwright framework design, Page Objects, API helpers, UI/API automation suites, failures, selector changes, assertion improvements, and structured debugging for the Practice Software Testing Toolshop assessment.

**Automation root:** `PrismStructure/`  
**SUT:** https://practicesoftwaretesting.com/  
**API:** https://api.practicesoftwaretesting.com/

---

## Prompt 1 — Playwright Framework Scaffold

### Prompt
Act as a senior Playwright automation architect. Inspect the repository and any existing Prism conventions. Build a JavaScript + Playwright framework with POM for UI (`pages/`, `tests/ui/`), API service classes (`api/`, `tests/api/`), shared `fixtures/`, `utils/`, `test-data/`, `playwright.config.js`, and `package.json`. Requirements: reusable auth, env-based config, deterministic test data, screenshots/videos/traces on failure, HTML report, smoke/regression tagging, UI/API separation. Do not create test cases yet.

### AI Response Summary
Confirmed workspace had only a placeholder scaffold (no prior Prism code). Implemented:

| Layer | Artifacts |
|-------|-----------|
| Config | `playwright.config.js` — projects `ui-chromium` and `api`; `testIdAttribute: 'data-test'`; trace/screenshot/video on failure; HTML reporter |
| Fixtures | `fixtures/index.js` — injects all page objects + API services + `authenticatedApi` fixture |
| Pages | Initial `BasePage`, `LoginPage`, `RegisterPage`, cart/checkout stubs |
| API | `BaseApi`, stub service exports |
| Utils | `config.js`, `apiAssertions.js`, `productResolver.js` |
| Data | Reused existing `test-data/testData.js` |

### Debugging Outcome
No test failures at this stage (no specs yet). Framework structure validated by subsequent prompts importing fixtures and page objects without structural rework.

### Root Cause
N/A — greenfield scaffold.

### Fix Applied
N/A.

### Validation Result
Repository layout and config accepted. Later UI/API prompts built on this structure without renaming folders or changing project split.

---

## Prompt 2 — Live DOM Selector Strategy

### Prompt
Inspect the live Toolshop DOM and identify stable selectors for `FunctionalTestCase.csv` flows. Prioritize `data-testid`, roles, and labels. Create `requirements/ui-selector-strategy.md`. Report elements that cannot be reliably identified.

### AI Response Summary
Ran Playwright DOM inspection scripts and produced `requirements/ui-selector-strategy.md`:

- **Correction:** SUT uses `data-test`, **not** `data-testid` → `testIdAttribute: 'data-test'` in config
- Mapped selectors for auth, browse, cart, checkout (`data-test="finish"` for Confirm), invoices
- Documented `/cart` redirects when empty; search only on home page
- **Gaps reported:** invoice list rows lack `data-test`; invoice detail has no `page-title` with INV number; duplicate-email registration has no `email-error` hook; `getByLabel(/password/i)` on login can match Forgot Password link

### Debugging Outcome
Prevented a class of future failures by correcting the `data-testid` assumption before full Page Object implementation.

### Root Cause
**Incorrect initial assumption:** Prompt asked for `data-testid` priority; live DOM proved the SUT instruments `data-test` instead.

### Fix Applied
- Configured `testIdAttribute: 'data-test'`
- Documented fallback strategies (table row filters, `getByRole('textbox', { name })`) for uninstrumented invoice views
- Rejected `getByLabel(/password/i)` as primary login password locator

### Validation Result
DOM capture artifacts (`selector-inspection-summary.json`, `inspect-dom-cart-output.json`) produced. Later UI specs confirmed documented gaps (invoice detail, duplicate email).

---

## Prompt 3 — Page Object Layer

### Prompt
Implement the Page Object layer only (`pages/`) per the approved selector strategy. Use `data-test` hooks, shared components (`AppHeader`), and flow methods on checkout/cart. Do not create test specs yet.

### AI Response Summary
Refactored all page classes:

- `BasePage` with `byTestId()` helper
- Auth: `LoginPage`, `RegisterPage` with `FIELD_ERROR_IDS` map
- Catalog: `HomePage`, `ProductsPage`, `CategoryListingPage`, `ProductDetailPage`
- Commerce: `CartPage`, `CheckoutPage` (`confirmOrderTwice()`, `fillBilling()`, wizard proceed buttons)
- Account: `ProfilePage`, `InvoicesPage`, `InvoiceDetailPage`
- `pages/index.js` barrel export

### Debugging Outcome
No Playwright test run at this stage. Page objects were exercised immediately in the UI Smoke prompt.

### Root Cause
N/A.

### Fix Applied
N/A.

### Validation Result
Accepted as the locator/interaction layer for all UI specs. Subsequent failures were in flow timing and Angular form binding, not missing page classes.

---

## Prompt 4 — UI Smoke Suite (4 Tests)

### Prompt
Implement UI Smoke suite (max 4 tests) from approved Page Objects and `FunctionalTestCase.csv`: registration/login, browse/search, cart + quantity, checkout + invoice with double-confirm. Tag `@smoke`, run suite, fix automation issues without weakening assertions.

### AI Response Summary
Implemented four specs under `tests/ui/smoke/`:

| Spec | Maps to |
|------|---------|
| `registration-login-profile.spec.js` | TC-MAN-001 / SC-01 |
| `product-browse-search.spec.js` | TC-MAN-002 browse/search |
| `cart-quantity-update.spec.js` | TC-MAN-002 cart/qty |
| `checkout-invoice.spec.js` | TC-MAN-002 checkout/invoice |

Added `tests/ui/helpers/smokeSetup.js` (`loginAsSeededCustomer`, `resolveSmokeProducts`, `addProductById`, `ensureCustomerBillingProfile`, `clearAllCartLines`).

### Debugging Outcome
**Initial run: 3/4 passing.** `checkout-invoice.spec.js` failed repeatedly. Multiple iterative fixes during this prompt (before the structured debug session):

| Failure | Classification | Outcome |
|---------|----------------|---------|
| Product listing locators too broad | Selector issue | Fixed `ProductsPage` to use `getByTestId('product-name')` |
| `openLatestInvoice()` clicked table row, not Details link | Automation defect | Added `openInvoiceByBillingStreet()` |
| Double-confirm flow — Confirm still visible after two clicks | Timing/sync | Added wait for "Payment was successful" between clicks |
| `POST /invoices` 422 — `billing_state` / `billing_postal_code` not strings | Automation defect | Iterative `fillBilling` / profile sync attempts; **not fully resolved in this prompt** |
| AI initially labeled checkout failure "intermittent SUT billing issue" | Misclassification | Later debug proved automation/form-binding defect |

**Incorrect approaches tried during smoke implementation (later rejected):**

1. **US billing (`Miami` / `US` / `33101`)** — replaced with assessment `buildCheckoutBillingUi()` (TG / Florida / 1234AA)
2. **NL billing to isolate TG postcode lookup** — rejected; assessment requires TG billing
3. **New-user registration for checkout** — switched to seeded customer + `ensureCustomerBillingProfile()`
4. **Cart badge `0` assertion after confirm** — removed as unreliable signal

### Root Cause
Checkout failures stemmed from multiple issues: fragile product/invoice selectors, incomplete double-confirm synchronization, and Angular billing form state not matching assessment address after postcode lookup.

### Fix Applied
- Selector fixes on `ProductsPage`, `CartPage`, `InvoicesPage`
- `confirmOrderTwice()` waits for payment success between clicks
- Seeded customer + assessment billing + profile prefill
- Postcode lookup house number `220` for TG wizard validation
- Invoice navigation via billing street, not `openLatestInvoice()` row click

### Validation Result
```text
3/4 smoke tests passing (checkout-invoice still failing at end of this prompt)
```
Documented in conversation before UI Regression and structured debug.

---

## Prompt 5 — UI Regression Suite (4 Tests)

### Prompt
Implement UI Regression suite (max 4 additional tests): invalid login, registration validation, single-confirm trap, empty cart checkout. Tag `@regression`, no smoke duplication. Run all UI tests.

### AI Response Summary
Implemented four specs under `tests/ui/regression/`:

| Spec | Maps to |
|------|---------|
| `invalid-login.spec.js` | TC-MAN-003 / SC-04 |
| `registration-validation.spec.js` | TC-MAN-004 / SC-05 |
| `single-confirm-no-invoice.spec.js` | TC-MAN-005 / SC-06 |
| `empty-cart-checkout.spec.js` | TC-MAN-006 / SC-08 |

Added `tests/ui/helpers/regressionSetup.js` (`registerAndLoginFreshUser`).

### Debugging Outcome
**`registration-validation.spec.js` failed** on duplicate-email assertion.

| Test | Error | Fix |
|------|-------|-----|
| `registration-validation` | Expected `email-error` `data-test` locator | SUT shows plain text — added `RegisterPage.duplicateEmailMessage = getByText(/customer with this email address already exists/i)` |

After regression fixes, conversation reported **7/8 UI tests passing** with `checkout-invoice` smoke still failing on billing/invoice binding.

### Root Cause
**Selector issue:** AI assumed `email-error` hook existed per `FIELD_ERROR_IDS` map; live SUT renders duplicate-email message as uninstrumented plain text.

### Fix Applied
- `RegisterPage.duplicateEmailMessage` text locator
- `single-confirm-no-invoice` monitors `POST /invoices` count
- `clearAllCartLines()` in smoke setup for test independence

### Validation Result
```text
7/8 UI tests passing (checkout-invoice still failing)
```
Full 8/8 UI pass not recorded before structured debug.

---

## Prompt 6 — API Automation Layer

### Prompt
Implement API automation layer from verified OpenAPI documentation: `AuthApi`, `UsersApi`, `ProductsApi`, `CartApi`, `InvoiceApi`, `PaymentApi`. Use Playwright `APIRequestContext`, centralize base URL, handle auth cleanly, return `ApiResponse` wrapper, support negative testing. Run connectivity check. No test specs yet.

### AI Response Summary
Built:

| File | Purpose |
|------|---------|
| `api/ApiResponse.js` | Wraps response with `status`, `json()`, `assertStatus()` |
| `api/BaseApi.js` | Bearer headers, `get/post/put/delete` with `expectedStatus` |
| Service classes | Auth, Users, Products, Cart, Invoice, Payment |
| `scripts/api-connectivity-check.js` | 5 live probes (products, search, cart, login/me, COD payment check) |

### Debugging Outcome
**`CartApi.get()` infinite recursion** discovered during implementation — method called itself instead of `super.get()`.

### Root Cause
**Automation defect:** `get()` delegated to `this.get()` rather than `BaseApi.get()` / `getCart()`.

### Fix Applied
- Renamed primary method to `getCart()`; `get()` deprecated alias calls `getCart()`
- Connectivity script run — **5 probes passed** (documented in conversation)

### Validation Result
```text
API connectivity check: 5 probes passed
```
No test spec failures (specs not yet created).

---

## Prompt 7 — API Smoke Suite (2 E2E Specs)

### Prompt
Implement API Smoke suite (max 4 tests) covering register → login → token → cart → products → invoice lifecycle. Combine related steps into logical E2E tests. Run and fix genuine automation issues.

### AI Response Summary
Implemented 2 smoke specs (within 4-test cap):

| Spec | Coverage |
|------|----------|
| `auth-registration-cart.spec.js` | Register → login → bearer token → `GET /users/me` → cart |
| `invoice-lifecycle.spec.js` | Products → cart → qty → payment check → invoice → list/detail |

Added `tests/api/helpers/smokeAssertions.js`.

### Debugging Outcome
**Invoice creation status code mismatch** during first run.

| Issue | Expected (OpenAPI) | Actual (live API) |
|-------|-------------------|-------------------|
| `POST /invoices` | 200 | **201** |
| `token_type` | — | lowercase `"bearer"` |

### Root Cause
**API dependency / documentation drift:** OpenAPI listed 200 for invoice creation; live API returns 201. Token type casing differed from assumptions.

### Fix Applied
- Assert `201` for invoice creation
- Assert `token_type` as lowercase `"bearer"`
- Use `buildInvoicePayload(cartId)` with assessment `BILLING_ADDRESS`

### Validation Result
```text
API smoke: 2/2 passing (documented after implementation)
```

---

## Prompt 8 — API Regression Suite (4 Tests)

### Prompt
Implement API Regression suite (max 4 tests) for negative/edge cases: invalid auth, registration, cart/product boundaries, invoice validation. Probe live API for actual status codes. Run complete API suite.

### AI Response Summary
Probed live API with Node scripts for actual 401/404/422/409 responses, then implemented:

| Spec | Scenarios |
|------|-----------|
| `auth-negative.spec.js` | Wrong password; missing/invalid token; unauthenticated invoice |
| `registration-negative.spec.js` | Weak password 422; duplicate email 409; missing email 422 |
| `cart-product-negative.spec.js` | Invalid/missing `product_id`; qty 0/-1; unknown cart/product |
| `invoice-negative.spec.js` | Unauthenticated invoice; missing billing/payment fields; invalid cart |

Added `tests/api/helpers/regressionAssertions.js`.

**Design note:** OOS product (`Long Nose Pliers`) returns 200 on add-to-cart via API — not asserted at API layer (UI/manual covers OOS).

### Debugging Outcome
No spec failures after probing and implementation.

### Root Cause
N/A — suite passed on first full run after status-code probing.

### Fix Applied
Assertions aligned to probed live behavior (not OpenAPI alone). Cart quantity unchanged verified after rejected updates.

### Validation Result
```text
6 passed (30.5s) — full API suite
  smoke/auth-registration-cart.spec.js
  smoke/invoice-lifecycle.spec.js
  regression/auth-negative.spec.js
  regression/registration-negative.spec.js
  regression/cart-product-negative.spec.js
  regression/invoice-negative.spec.js
```

---

## Prompt 9 — Structured Debug: `checkout-invoice` Smoke Failure

### Prompt
Debug the Playwright test failure. **Do not immediately modify code.** Analyze: failure, stack trace, screenshot/trace, test, Page Object, selector, test data, application behavior. Classify root cause. Propose smallest safe fix. Rerun affected test and relevant suite. Summarize root cause, fix, and results.

### AI Response Summary
Structured analysis of `checkout-invoice.spec.js` failure:

```text
Invoice creation failed (422): billing_state and billing_postal_code must be a string
```

at `CheckoutPage.confirmOrderTwice()` after second Confirm (`POST /invoices`).

**Evidence gathered:**
- Payment step succeeded (`POST /payment/check`, "Payment was successful")
- Screenshot showed payment step — billing inputs hidden in DOM
- API smoke with same `buildInvoicePayload()` passed — test data valid
- Captured invoice POST body showed postcode-lookup address (e.g. Austria/Vienna) mixed with assessment state/postal

**Classification:** **Automation defect** (not product, test-data, or environment).

### Debugging Outcome
Iterative fix cycle with multiple **incorrect approaches rejected:**

| Attempt | Why it failed |
|---------|---------------|
| `reconcileBillingBeforeInvoice` — click "Billing Address" wizard step after 1st confirm | Wizard won't navigate back after payment; `postal_code` hidden → timeout |
| `ensureBillingBoundForInvoice` with `isVisible()` guard | Skipped sync on payment step → 422 persisted |
| Sync only `state`/`postal` on payment step | New 422: `billing_country does not match entered address` |
| Remove postcode lookup / manual fill only | `proceed-3` stayed disabled (TG requires lookup) |
| Drop to NL billing | Rejected — assessment requires TG billing |
| `sealBillingFormModel` refactor in `fillBilling` | Broke state binding; `proceed-3` disabled |
| Sync street/city on payment step | Triggered country validation errors |
| Re-apply full address during billing step after lookup | Broke wizard proceed enablement |

**After invoice POST succeeded**, additional assertion failures:

| Failure | Root cause | Fix |
|---------|------------|-----|
| My Invoices navigation | `appHeader.goToInvoices()` + `page.reload()` unreliable | `invoicesPage.open()` |
| Invoice number assertion | No `page-title` with INV- on detail page | `invoiceNumberField = getByRole('textbox', { name: 'Invoice Number' })` |
| Billing street/city/state visible | `getByText()` not reliable on detail form | `billingStreetField`, `billingCityField`, `billingStateField` textbox locators with `toHaveValue()` |

### Root Cause
Postcode lookup for TG/1234AA populates street/city from the lookup API, but Angular's reactive form model for `billing_state` and `billing_postal_code` (and eventually full assessment address) was not bound when billing controls are **hidden on the payment step**. `POST /invoices` received non-string or mismatched billing fields.

### Fix Applied
Final solution in `pages/CheckoutPage.js`:

1. **`bindAngularFormControl()`** — native `HTMLInputElement` value setter + `input`/`change`/`blur` events for Angular form model
2. **`ensureBillingBoundForInvoice(billing)`** — before 2nd confirm, rebinds **full** assessment address on hidden controls: country (`selectOption` with `force: true`), street, city, state, postal
3. **`confirmOrderTwice(billing)`** — waits for `POST /payment/check`, 1st confirm, payment success message, `ensureBillingBoundForInvoice`, 2nd confirm, asserts invoice response OK
4. **`fillBilling()`** — keeps postcode lookup path (house `220`) for wizard validation, then syncs state/postal during visible billing step
5. **Assertion improvements** in spec and `InvoiceDetailPage` as listed above

### Validation Result
```text
checkout-invoice single-test rerun: PASSED (~40s)
```
Full UI suite rerun was **attempted but interrupted** (user aborted) — **8/8 UI pass not consistently recorded** in conversation. API suite remained **6/6 passing**.

---

## Cross-Cutting: Incorrect AI Approaches and Corrections

| Area | Incorrect suggestion | Correction |
|------|---------------------|------------|
| Locator strategy | Assume `data-testid` | Use `data-test` + `testIdAttribute` |
| Login password | `getByLabel(/password/i)` | `getByTestId('password')` — label matches Forgot Password |
| Duplicate email | `getByTestId('email-error')` | `getByText(/customer with this email address already exists/i)` |
| Invoice list | `openLatestInvoice()` row click | `openInvoiceByBillingStreet()` → Details link |
| Invoice detail | `page-title` contains INV- | `invoiceNumberField` textbox `toHaveValue(/INV-/)` |
| Billing assertions | `getByText(billing.street)` | Labeled textbox `toHaveValue()` |
| Checkout 422 | "Intermittent SUT issue" | Automation defect — Angular form binding |
| Billing sync | Navigate back to billing wizard | Wizard locked after payment — bind hidden fields instead |
| Billing sync | `isVisible()` guard on payment step | Always bind with `force` / `bindAngularFormControl` |
| Billing sync | State/postal only on payment step | Full address rebind including country |
| Billing sync | Street/city sync on payment step | Country mismatch 422 — state/postal only or full bind via Angular setter |
| Checkout data | NL or US address | Assessment TG billing via `buildCheckoutBillingUi()` |
| API invoice | Assert HTTP 200 | Assert HTTP 201 (live API) |
| CartApi | `get()` calls itself | `getCart()` → `super.get()` |

---

## Suite Inventory (As Implemented)

### UI (`tests/ui/`)

**Smoke (4):** `registration-login-profile`, `product-browse-search`, `cart-quantity-update`, `checkout-invoice`

**Regression (4):** `invalid-login`, `registration-validation`, `single-confirm-no-invoice`, `empty-cart-checkout`

### API (`tests/api/`)

**Smoke (2 E2E):** `auth-registration-cart`, `invoice-lifecycle`

**Regression (4):** `auth-negative`, `registration-negative`, `cart-product-negative`, `invoice-negative`

### Run Commands

```powershell
cd PrismStructure
npx playwright test --project ui-chromium --grep "@smoke" --workers=1
npx playwright test --project ui-chromium --workers=1
npx playwright test --project api --workers=1
npx playwright test --workers=1
node scripts/api-connectivity-check.js
```

---

## Recorded Test Results Summary

| Suite | Recorded result | Notes |
|-------|-----------------|-------|
| UI smoke (initial) | **3/4** | `checkout-invoice` failing |
| UI all (mid-session) | **7/8** | After regression selector fix; checkout still failing |
| UI `checkout-invoice` (post-debug) | **1/1 passed** | Single-test rerun documented |
| UI full (post-debug) | **Interrupted** | Not completed in conversation |
| API full | **6/6 passed** | Documented with timing (~30.5s) |
| API connectivity | **5/5 probes passed** | Pre-spec validation |

---

## Known SUT Behaviors (Automation-Relevant)

- Invoice generation requires **Confirm (`data-test="finish"`) clicked twice** on checkout UI
- First confirm triggers `POST /payment/check`; second triggers `POST /invoices`
- API invoice payload uses `payment_method: "cash-on-delivery"` and `payment_details: {}`
- `POST /invoices` returns **201** (OpenAPI listed 200)
- Login returns `token_type: "bearer"` (lowercase)
- Empty `/cart` redirects away — use `/checkout` for empty-cart guard tests
- TG checkout requires postcode lookup (house number) for wizard proceed enablement

---

## Items Documented Elsewhere

- Requirement/planning phase → `ai-prompts/requirements-and-planning.md`
- Manual test design and UI suite mapping → `ai-prompts/test-design.md`
- Test data builders and billing strategy → `ai-prompts/test-data.md`
- API endpoint reference → `requirements/api-analysis.md`
- Selector reference → `requirements/ui-selector-strategy.md`
