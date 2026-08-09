# AI Prompts – Test Data

Prompts and strategy for Toolshop UI + API test data.

---

## Test Data Strategy Summary

| Principle | Implementation |
|-----------|----------------|
| **No hardcoded credentials** | Seeded account passwords/emails only via `PrismStructure/.env` |
| **Deterministic static data** | Billing address, product names, invalid samples, category paths |
| **Runtime dynamic data** | Product IDs, cart IDs, access tokens, unique emails |
| **Collision avoidance** | `uniqueEmail()` uses prefix + timestamp + random hex on `example.com` |
| **Single source of truth** | `PrismStructure/test-data/testData.js` |

**Module:** `PrismStructure/test-data/testData.js`

---

## 1. Valid User Registration Data

| Field | Value / Rule | Source |
|-------|--------------|--------|
| first_name | `Manual` | Manual TC-MAN-001 alignment |
| last_name | `Tester` | Manual TC-MAN-001 |
| email | `uniqueEmail('reg')` | Generated per run |
| password | `REGISTRATION_PASSWORD` from env | OpenAPI complexity rules |
| dob | `1990-06-15` | Valid 18–75 years |
| phone | `5551234567` | Static valid sample |
| address | `VALID_ADDRESS` block | Deterministic NL address |

**Builders:** `buildValidRegistrationUser()`, `buildValidRegistrationUserUi()`

---

## 2. Unique User Generation

```
{TEST_EMAIL_PREFIX}.{tag}.{YYYYMMDDhhmmss}.{4hex}@example.com
```

- Default prefix: `qa.auto` (override via `TEST_EMAIL_PREFIX`)
- Domain: `example.com` (RFC 2606 — not a real mailbox)
- Tag examples: `reg`, `api`, `ui`, `weak`
- **Why:** Shared public SUT; avoids 409 duplicate email on parallel runs

**Builders:** `uniqueSuffix()`, `uniqueEmail(tag)`

---

## 3. Invalid Email

| Variant | Value | Use |
|---------|-------|-----|
| missingAt | `not-an-email` | Format validation |
| missingDomain | `user@` | Format validation |
| doubleAt | `user@@example.com` | Format validation |
| spaces | `user name@example.com` | Format validation |
| empty | `''` | Required field |

**Builder:** `buildInvalidEmail(variant)`

---

## 4. Invalid Password

| Variant | Value | Rule violated |
|---------|-------|---------------|
| commonWeak | `weakpass` | All complexity rules |
| tooShort | `Ab1!` | minLength 8 |
| noUppercase | `validpass1!` | Uppercase required |
| noLowercase | `VALIDPASS1!` | Lowercase required |
| noNumber | `ValidPass!` | Number required |
| noSymbol | `ValidPass1` | Symbol required |
| empty | `''` | Required |

**Builders:** `buildInvalidPassword(variant)`, `buildWeakPasswordRegistration()`

---

## 5. Missing Mandatory Fields

Registration required fields (OpenAPI): `first_name`, `last_name`, `email`, `password`

**Builder:** `buildRegistrationMissingFields('email' | 'password' | ['first_name','last_name'])`

Invoice required fields: billing_*, `payment_method`, `payment_details`, `cart_id`

**Builder:** `buildInvoicePayloadMissingFields(cartId, 'billing_street')`

---

## 6. Product Data

| Constant | Name | Stock | Use |
|----------|------|-------|-----|
| `PRODUCT_NAMES.inStockPrimary` | Combination Pliers | In stock | Smoke cart A |
| `PRODUCT_NAMES.inStockSecondary` | Claw Hammer | In stock | Smoke cart B |
| `PRODUCT_NAMES.outOfStock` | Long Nose Pliers | Out of stock | Regression TC-MAN-007 |

- **IDs are NOT hardcoded** — resolve via `findProductIdByName(products, name)` after `GET /products`
- Search terms: `PRODUCT_SEARCH.hammer`, `PRODUCT_SEARCH.pliers`
- Category path: `CATEGORY_PATH.handToolsHammer`

**Pre-run check:** Assert `in_stock === true` on detail page/API before smoke cart tests.

---

## 7. Cart Data

| Rule | Detail |
|------|--------|
| Fresh cart per test | `POST /carts` → store `cart.id` |
| Never reuse cart after invoice | Prevents 422 on shared env |
| Multi-item AC2 | Combination Pliers qty 1 + Claw Hammer qty 2 |

**Builders:** `buildCartItems({ productAId, productBId })`, `buildAddToCartPayload(productId, qty)`

---

## 8. Quantity Edge Cases

| Case | Value | Expected |
|------|-------|----------|
| minimum | 1 | Smoke default |
| multiItemSecondary | 2 | AC2 quantity update |
| zero | 0 | Regression — API/UI reject |
| negative | -1 | Regression — API/UI reject |

**Export:** `QUANTITY_EDGE`, `getQuantityEdgeCases()`, `buildUpdateQuantityPayload(id, qty)`

---

## 9. Checkout Data

| Field | Value |
|-------|-------|
| Street | Zoey Shore |
| City | Hesselbury |
| State | Florida |
| Country | TG |
| Postal code | 1234AA |
| Payment (UI label) | Cash on Delivery |
| Payment (API) | `cash-on-delivery` |

**Builders:** `buildCheckoutBillingUi()`, `buildPostcodeLookupParams()` (house_number `220` — verified API sample)

---

## 10. Invoice Payload Data

Assessment example (authenticated):

```json
{
  "billing_street": "Zoey Shore",
  "billing_city": "Hesselbury",
  "billing_state": "Florida",
  "billing_country": "TG",
  "billing_postal_code": "1234AA",
  "payment_method": "cash-on-delivery",
  "cart_id": "<runtime>",
  "payment_details": {}
}
```

**Builder:** `buildInvoicePayload(cartId)` — `cart_id` required at runtime.

**Payment pre-check:** `buildPaymentCheckCod()` before invoice in API flows.

---

## 11. API Authentication Data

| Account | Env vars | Use |
|---------|----------|-----|
| Customer | `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD` | Smoke login, duplicate-email negative |
| Customer 2 | `CUSTOMER2_EMAIL`, `CUSTOMER2_PASSWORD` | Alternate session if needed |
| Admin | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Stretch / admin tests (out of core) |

**Builders:** `getSeededCustomerCredentials()`, `buildLoginPayloadSeededCustomer()`, `buildAuthHeader(token)`

**Rule:** `requireEnv()` throws if credentials missing — fail fast at setup, not mid-test.

---

## 12. Negative API Payloads

| Builder | Purpose |
|---------|---------|
| `buildInvalidLoginPayload('wrongPassword')` | 401 login |
| `buildInvalidLoginPayload('wrongEmail')` | 401 login |
| `buildInvalidLoginPayload('missingFields')` | Empty body |
| `buildDuplicateEmailRegistration()` | 409 conflict |
| `buildWeakPasswordRegistration()` | 422 validation |
| `buildInvoicePayloadWithoutAuth()` | Body only — no Bearer header in test |
| `buildInvoicePayloadInvalidCartId()` | Invalid cart reference |
| `buildInvoicePayloadMissingFields(cartId, 'billing_street')` | 422 validation |

---

## Environment Setup

```bash
cd PrismStructure
cp .env.example .env
# Edit .env — set CUSTOMER_EMAIL, CUSTOMER_PASSWORD, REGISTRATION_PASSWORD, etc.
```

| Variable | Required for | Notes |
|----------|--------------|-------|
| `CUSTOMER_EMAIL` | Seeded login, duplicate email test | Public SUT account |
| `CUSTOMER_PASSWORD` | Seeded login | Never commit |
| `REGISTRATION_PASSWORD` | New user registration | e.g. meets complexity rules |
| `ADMIN_*`, `CUSTOMER2_*` | Optional / stretch | |
| `TEST_EMAIL_PREFIX` | Optional | Default `qa.auto` |

---

## Data Ownership by Test Tier

| Data | Manual | UI Auto | API Auto |
|------|--------|---------|----------|
| Seeded login | CSV documents | `.env` + fixture | `buildLoginPayloadSeededCustomer()` |
| New user register | Timestamp in email | `uniqueEmail('ui')` | `uniqueEmail('api')` |
| Product IDs | Name reference in CSV | Runtime API resolve | `findProductIdByName()` |
| Billing / invoice | CSV static | `buildCheckoutBillingUi()` | `buildInvoicePayload()` |
| Invalid samples | CSV static | Page object + builders | Negative payload builders |

---

## AI Prompts Log

### Entry 1

- **Prompt:** Create a deterministic test data strategy for Toolshop UI and API tests covering registration, products, cart, checkout, invoice, auth, and negative payloads. Use env vars for credentials. Create testData.js and document in ai-prompts/test-data.md.
- **AI Response Summary:** Created `PrismStructure/test-data/testData.js` with builder functions for all 12 data categories; updated `.env.example` with `REGISTRATION_PASSWORD` and seeded account placeholders; documented strategy with tables mapping builders to manual TC alignment.
- **Validation Notes:** Aligned with OpenAPI UserRequest/InvoiceRequest rules, assessment COD billing example, FunctionalTestCase.csv product names, and test-strategy.md collision rules. Product IDs intentionally runtime-only. No UI/API tests created.

---
