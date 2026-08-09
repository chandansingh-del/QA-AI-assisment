# AI Prompts – Test Data

Prompt history and strategy for Toolshop UI + API test data.  
**Single source of truth:** `PrismStructure/test-data/testData.js`  
**Credentials:** environment variables in `PrismStructure/.env` (never committed; template in `.env.example`)

---

## Strategy Summary

| Principle | Implementation |
|-----------|----------------|
| No hardcoded secrets | Seeded passwords via `CUSTOMER_*`, `REGISTRATION_PASSWORD`, etc. |
| Deterministic static data | Billing address, product names, invalid samples, category paths |
| Runtime dynamic data | Product IDs, cart IDs, access tokens, unique emails |
| Collision avoidance | `uniqueEmail()` = prefix + timestamp + random hex on `example.com` |
| Fail fast | `requireEnv()` throws when credentials missing at setup |

---

## Prompt 1

### Prompt
Using the approved test strategy, create a compact manual test suite (max 8 cases) with realistic **Test Data** columns for registration, login, products, cart, COD checkout, invoice, and negatives. Output `FunctionalTestCase.csv`.

### AI Response Summary
Defined manual test data inline in `FunctionalTestCase.csv`:

| TC | Key data (documented in CSV) |
|----|------------------------------|
| TC-MAN-001 | Unique email pattern, `Valid@12345`, Manual/Tester, DOB, NL address |
| TC-MAN-002 | Seeded customer login, Combination Pliers + Claw Hammer, Hammer search, billing **Zoey Shore / Hesselbury / Florida / TG / 1234AA**, COD |
| TC-MAN-003 | Seeded email + wrong password |
| TC-MAN-004 | `weakpass` + duplicate seeded customer email |
| TC-MAN-005 | Seeded customer, Combination Pliers, same assessment billing |
| TC-MAN-006 | Seeded customer, empty cart |
| TC-MAN-007 | Long Nose Pliers (OOS) |
| TC-MAN-008 | Seeded customer session/logout |

### Validation Notes
Data aligned to assessment AC examples and `toolshop-flow-analysis.md` product names. CSV status remains **Not Executed** — manual data not run against live SUT in this conversation.

### Changes Made
Accepted CSV test data as the human-executable reference. Automation later centralized overlapping values in `testData.js`.

### Reason
Manual tier needs readable, copy-paste-ready data before automation builders existed.

---

## Prompt 2

### Prompt
Review `FunctionalTestCase.csv` for test data quality (among other criteria). Apply targeted fixes only.

### AI Response Summary
Test-data-specific improvements:

- **TC-MAN-001:** Email placeholder changed from `manual.reg.0809.{unique}` to `manual.reg.{YYYYMMDDhhmm}@example.com` with precondition that email must not already exist
- **TC-MAN-002:** Added in-stock precondition for Combination Pliers and Claw Hammer; postcode lookup note for TG/1234AA
- **TC-MAN-005:** Added baseline invoice count before checkout for deterministic comparison

### Validation Notes
Review was AI-led against CSV columns. No manual re-execution recorded.

### Changes Made
Accepted timestamp-based email pattern for manual runs. Did not change assessment billing block or product names.

### Reason
Reduces collision risk on shared SUT when multiple testers use the same manual script.

---

## Prompt 3

### Prompt
Create a deterministic test data strategy for Toolshop UI and API tests covering registration, unique users, invalid email/password, missing fields, products, cart, quantity edges, checkout, invoice payloads, API auth, and negative payloads. Do not hardcode credentials. Use environment variables. Avoid email collisions. Create `testData.js` and document in `ai-prompts/test-data.md`. No tests yet.

### AI Response Summary
Created `PrismStructure/test-data/testData.js` with builders for all 12 categories and updated `.env.example` with `REGISTRATION_PASSWORD` and seeded-account placeholders.

**Key design splits:**

| Data type | Registration (`VALID_ADDRESS`) | Checkout / invoice (`BILLING_ADDRESS`) |
|-----------|----------------------------------|----------------------------------------|
| Street | 10 Test Street | Zoey Shore |
| City | Amsterdam | Hesselbury |
| State | North Holland | Florida |
| Country | NL | TG |
| Postal | 1011AA | 1234AA |

**Unique email format:** `{TEST_EMAIL_PREFIX}.{tag}.{timestamp}.{4hex}@example.com` (default prefix `qa.auto`)

**Negative samples:** `INVALID_EMAILS`, `INVALID_PASSWORDS`, `buildInvalidLoginPayload()`, `buildDuplicateEmailRegistration()` (uses `CUSTOMER_EMAIL` from env for intentional 409)

**Runtime-only:** `cart_id`, product IDs, `access_token` — builders throw or resolve via helpers if missing

### Validation Notes
- **Module load:** `node -e` verified `uniqueEmail()`, `BILLING_ADDRESS`, and `buildInvalidPassword()` execute without npm install after dotenv was made optional
- **OpenAPI alignment:** Password variants map to documented complexity rules (min 8, upper, lower, number, symbol)
- **Assessment alignment:** `BILLING_ADDRESS` matches assessment COD invoice example
- **Product names:** Combination Pliers, Claw Hammer, Long Nose Pliers from manual exploration / CSV
- **Not validated in this step:** Live registration with `REGISTRATION_PASSWORD` from env (requires local `.env`)

### Changes Made
Accepted `testData.js` as single automation data module. Separated registration address (NL) from checkout billing (assessment TG block) instead of one address for all flows.

### Reason
Registration smoke uses NL-friendly `VALID_ADDRESS`; AC2 checkout/invoice uses the assessment-mandated billing payload.

---

## Prompt 4

### Prompt
Build Playwright framework scaffold reusing `testData.js` — fixtures, config, product resolution. (Framework prompt; data-relevant portions only.)

### AI Response Summary
- `utils/config.js` — URLs from `testData.getUrls()`
- `utils/productResolver.js` — `getProductByName()`, `getInStockSmokeProducts()` resolve IDs at runtime via `GET /products` and `GET /products/search`; throws if smoke products not in stock
- `fixtures/index.js` — exports `testData`, `authenticatedApi` fixture using `AuthApi.createAuthenticatedSession()` and seeded credentials
- `playwright.config.js` — loads env for `BASE_URL` / `API_BASE_URL`

Added `PRODUCT_NAME_FALLBACKS` (`Combination Pliers` → `Pliers`) for catalog name drift.

### Validation Notes
Product resolver validates `in_stock === true` before returning smoke products. No hardcoded ULID product IDs in committed code.

### Changes Made
Accepted runtime product resolution pattern. Rejected hardcoded product/category IDs in tests.

### Reason
Catalog IDs change between environments; stable **names** match manual CSV and survive pagination.

---

## Prompt 5

### Prompt
Implement UI Smoke suite (max 4 tests) using controlled test data and Page Objects. Run and fix failures.

### AI Response Summary
Wired `testData.js` into smoke specs:

| Spec | Data used |
|------|-----------|
| `registration-login-profile` | `buildValidRegistrationUserUi()` + `uniqueEmail('ui')` |
| `product-browse-search` | `loginAsSeededCustomer()`, `PRODUCT_SEARCH.hammer`, `CATEGORY_PATH` |
| `cart-quantity-update` | `resolveSmokeProducts()`, `QUANTITY_EDGE.multiItemSecondary` |
| `checkout-invoice` | Seeded customer, `buildCheckoutBillingUi()`, `buildPostcodeLookupParams().house_number` (220), `ensureCustomerBillingProfile()` |

**Initial checkout data (later modified):** First implementation registered a new user and used registration address for billing; switched to seeded customer + assessment billing + profile prefill.

### Validation Notes
- Playwright runs: 3/4 smoke tests passed initially; checkout failed on billing/invoice binding
- `getInStockSmokeProducts()` validated in cart and checkout specs before add-to-cart
- Seeded login requires local `.env` with `CUSTOMER_EMAIL` / `CUSTOMER_PASSWORD`

### Changes Made
- **Modified:** Checkout smoke uses seeded customer + `BILLING_ADDRESS` via `buildCheckoutBillingUi()`, not fresh registration address
- **Added:** `ensureCustomerBillingProfile()` in `smokeSetup.js` to sync profile billing before checkout
- **Added:** Postcode lookup house number `220` for TG/1234AA wizard validation

### Reason
Checkout invoice POST reads billing from Angular form state; profile + assessment billing proved more stable than new-user NL address alone.

---

## Prompt 6

### Prompt
Implement UI Regression suite (max 4 tests) from `FunctionalTestCase.csv`. Reuse fixtures and test data.

### AI Response Summary
Regression data wiring:

| Spec | Builders / data |
|------|-----------------|
| `invalid-login` | `buildInvalidLoginPayload('wrongPassword')` — seeded email + `WrongPass99!` |
| `registration-validation` | `buildValidRegistrationUserUi({ password: buildInvalidPassword('commonWeak') })` + `buildDuplicateEmailRegistration()` |
| `single-confirm-no-invoice` | Seeded customer, assessment billing, `buildPostcodeLookupParams()` |
| `empty-cart-checkout` | `registerAndLoginFreshUser()` — isolated user with empty cart |

### Validation Notes
- Duplicate-email test failed initially when asserting `email-error` `data-test` hook; SUT shows plain text message instead
- Playwright run reported 7/8 UI tests passing before checkout billing fix completed (full final count not consistently recorded)

### Changes Made
- **Rejected:** `getByTestId('email-error')` for duplicate registration — no stable hook on SUT
- **Accepted:** `buildDuplicateEmailRegistration()` pulling conflict email from `CUSTOMER_EMAIL` env var
- **Accepted:** Fresh user via `uniqueEmail()` for empty-cart test to avoid cart pollution

### Reason
Negative data must match SUT behavior; duplicate-email conflict requires a known existing account from env, not a invented email.

---

## Prompt 7

### Prompt
Implement API automation layer and run connectivity check. (API layer prompt; data-relevant portions.)

### AI Response Summary
- Service classes accept payloads from `testData` builders; no credentials in API classes
- `scripts/api-connectivity-check.js` probes live API using:
  - `PRODUCT_SEARCH.hammer`
  - `buildLoginPayloadSeededCustomer()`
  - `buildPaymentCheckCod()`
  - `POST /carts` (runtime cart ID)

### Validation Notes
Connectivity script documented as **5 probes passing** in conversation (products, search, cart create, seeded login + `/users/me`, COD payment check). Requires populated `.env` for login probe.

### Changes Made
Accepted connectivity check as pre-flight validation for auth and COD payment data shapes before API test specs.

### Reason
Validates env credentials and payload shapes against live API without creating full test suite.

---

## Prompt 8

### Prompt
Implement API Smoke and Regression suites using assessment invoice payload requirements.

### AI Response Summary
API tests consume `testData.js` throughout:

**Smoke**
- `buildValidRegistrationUser()` / `uniqueEmail('api')` for register-login-cart chain
- `getInStockSmokeProducts()` + `QUANTITY_EDGE.multiItemSecondary` for invoice lifecycle
- `buildInvoicePayload(cartId)` with assessment `BILLING_ADDRESS` + `cash-on-delivery`
- `buildPaymentCheckCod()` before invoice creation

**Regression**
- `buildInvalidLoginPayload()` → 401
- `buildWeakPasswordRegistration()` → 422
- `buildDuplicateEmailRegistration()` → 409
- `buildRegistrationMissingFields('email')` → 422
- `buildInvoicePayloadMissingFields()`, `buildInvoicePayloadInvalidCartId()` → 422/404
- `QUANTITY_EDGE.zero` / `negative` for cart update rejection

**Live API discoveries affecting data assertions:**
- Login returns `token_type: "bearer"` (lowercase) — not a data change, but auth dependency
- `POST /invoices` returns **201** (OpenAPI listed 200) — status assertion adjusted in tests

### Validation Notes
API smoke invoice lifecycle passed with `buildInvoicePayload()` — confirms assessment billing block is API-valid independent of UI postcode-lookup quirks.

### Changes Made
Accepted assessment `BILLING_ADDRESS` for all API invoice payloads. Cart IDs and tokens remain runtime-only per test.

### Reason
API tier validates contract and lifecycle; static billing data matches assessment example that UI must ultimately submit.

---

## Prompt 9

### Prompt
Debug Playwright `checkout-invoice` smoke failure (`422` on `POST /invoices` — `billing_state` / `billing_postal_code` not strings).

### AI Response Summary
Investigation showed UI invoice POST payload could contain postcode-lookup values (e.g. mismatched country/city) while DOM showed assessment billing during the wizard step. Root cause classified as **automation defect**: billing controls hidden on payment step; Angular form model not carrying state/postal into invoice request after postcode lookup.

**Data-related fix:** `ensureBillingBoundForInvoice(billing)` before second Confirm — rebinds full assessment `BILLING_ADDRESS` (country, street, city, state, postal) into hidden form controls via native input setter + `selectOption({ force: true })` for country.

**Invoice assertion data:** Assertions use `billing.street` / `billing.city` / `billing.state` from `buildCheckoutBillingUi()`, not postcode-lookup-resolved street.

### Validation Notes
- Captured failing `POST /invoices` body in debug showed lookup-derived address mixed with assessment state/postal
- After fix, single-test rerun of `checkout-invoice` **passed**
- API smoke with same `BILLING_ADDRESS` had already passed — confirmed test data valid; UI binding was the gap

### Changes Made
- **Rejected:** Removing postcode lookup entirely without fixing binding (lookup needed for wizard proceed button on TG)
- **Rejected:** Weakening invoice POST assertions
- **Accepted:** Full assessment billing rebind on payment step before second confirm
- **Modified:** Invoice detail assertions to use labeled textbox fields (data presentation), not `page-title`

### Reason
Assessment billing data is correct for API; UI automation must ensure the same payload reaches `POST /invoices` after postcode lookup side effects.

---

## Reference — Builder Catalog

### User / registration data

| Builder | Purpose |
|---------|---------|
| `buildValidRegistrationUser()` | API-shaped registration body |
| `buildValidRegistrationUserUi()` | Flat fields for UI forms |
| `uniqueEmail(tag)` | Collision-resistant email |
| `getRegistrationPassword()` | From `REGISTRATION_PASSWORD` env |

### Negative data

| Builder | Expected SUT behavior |
|---------|----------------------|
| `buildInvalidEmail(variant)` | Format validation |
| `buildInvalidPassword(variant)` | Complexity validation |
| `buildWeakPasswordRegistration()` | 422 API / UI block |
| `buildDuplicateEmailRegistration()` | 409 / UI message |
| `buildInvalidLoginPayload('wrongPassword')` | 401 / login error |
| `buildRegistrationMissingFields()` | 422 missing required fields |

### Product / cart data

| Constant / helper | Value / rule |
|-------------------|--------------|
| `PRODUCT_NAMES.inStockPrimary` | Combination Pliers |
| `PRODUCT_NAMES.inStockSecondary` | Claw Hammer |
| `PRODUCT_NAMES.outOfStock` | Long Nose Pliers |
| `getInStockSmokeProducts()` | Runtime ID + `in_stock` guard |
| `QUANTITY_EDGE` | 1, 2, 0, -1 |

### Checkout / invoice data

| Builder | Notes |
|---------|-------|
| `buildCheckoutBillingUi()` | Flat UI billing from `BILLING_ADDRESS` |
| `buildPostcodeLookupParams()` | TG / 1234AA / house `220` |
| `buildInvoicePayload(cartId)` | Assessment payload + runtime cart |
| `buildPaymentCheckCod()` | COD pre-check before invoice |
| `buildInvoicePayloadMissingFields()` | Negative 422 |

### API auth data (env-driven)

| Variable | Use |
|----------|-----|
| `CUSTOMER_EMAIL` / `CUSTOMER_PASSWORD` | Seeded login, duplicate-email negative |
| `REGISTRATION_PASSWORD` | New user registration |
| `CUSTOMER2_*`, `ADMIN_*` | Optional / stretch |

Reference seeded accounts are documented in the public SUT README linked from `.env.example` — set values locally in `.env` only.

---

## Data Validation Summary

| When | How validated | Result |
|------|---------------|--------|
| `testData.js` creation | `node -e` module load + sample builder output | Builders execute |
| Product names | `GET /products` / search in connectivity check and resolver | Names resolve; in_stock checked |
| Seeded auth | Connectivity check `POST /users/login` + `GET /users/me` | Requires local `.env` |
| COD payment | `POST /payment/check` with `buildPaymentCheckCod()` | 200 in connectivity check |
| Invoice payload | API smoke `buildInvoicePayload(cartId)` | 201 + field assertions pass |
| UI checkout billing | Debug of invoice POST body + checkout smoke rerun | Assessment billing reaches API after rebind fix |
| Manual CSV data | Not executed in conversation | Status: Not Executed |

---

## Data Ownership by Tier

| Data | Manual CSV | UI automation | API automation |
|------|------------|---------------|----------------|
| Seeded login | Documented | `.env` + `loginAsSeededCustomer()` | `buildLoginPayloadSeededCustomer()` |
| New user | Timestamp email | `uniqueEmail('ui')` | `uniqueEmail('api')` |
| Product IDs | Name only | `productResolver` | `getInStockSmokeProducts()` |
| Billing / invoice | Static in CSV | `buildCheckoutBillingUi()` + profile sync | `buildInvoicePayload()` |
| Invalid samples | Inline in CSV | Builder functions | Negative payload builders |
