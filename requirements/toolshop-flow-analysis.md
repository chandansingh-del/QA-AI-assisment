# Toolshop Flow Analysis — Exploratory QA

**Application:** Practice Software Testing Toolshop v5.0  
**UI:** https://practicesoftwaretesting.com/  
**API:** https://api.practicesoftwaretesting.com/api/documentation  
**Analysis Date:** 2026-08-09  
**Analyst Role:** Senior Exploratory QA Engineer

> **Verification legend**  
> ✅ Verified via live API / documented source  
> 🔍 Requires manual UI confirmation (route or API exists; UI behavior not directly observed in this session)  
> 📋 Assessment requirement (not independently verified on UI)

---

## Executive Summary

The Toolshop is a Sprint 5 e-commerce application (Angular UI + Laravel API) selling tools across categories such as Hand Tools, Power Tools, and Other. The **highest business-risk flows** are authentication, cart management, checkout, Cash on Delivery payment, and invoice generation/viewing — these map directly to assessment AC1 and AC2.

**Catalog exploration (verified):** 50 products, paginated 9 per page (6 pages); search, sort, and filter APIs are available; at least one out-of-stock product exists (`Long Nose Pliers`).

**Critical assessment behavior:** Invoice generation on the UI requires **pressing Confirm twice** — treat as explicit test requirement.

---

## Business Risk Priority Matrix

| Priority | Flow Area | Rationale |
|----------|-----------|-----------|
| **P0 — Critical** | Login → Cart → Checkout (COD) → Invoice → My Invoices | Core revenue path; assessment AC2 |
| **P0 — Critical** | Registration → Login → Profile verification | Assessment AC1; gateway to authenticated purchase |
| **P1 — High** | Cart quantity update / multi-item cart | Assessment AC2 explicit requirement |
| **P1 — High** | Double-confirm invoice generation | Documented SUT quirk; high automation failure risk |
| **P2 — Medium** | Search, filter, sort, pagination | Discovery path to products; API verified |
| **P2 — Medium** | Product detail, related products | Purchase decision point |
| **P3 — Lower** | Favorites, contact, rental, account settings | Secondary customer features |
| **Out of core scope** | Admin PIM, reports, TOTP, social login | Exists in Sprint 5; not in assessment AC examples |

---

## 1. Main User Journeys

| # | Journey | Steps (High Level) | Category | Risk |
|---|---------|-------------------|----------|------|
| J1 | **Guest browse** | Home → Products → Category → Product detail | Smoke | P2 |
| J2 | **Registered purchase (COD)** | Register/Login → Browse → Add to cart → Update qty → Checkout → COD → Confirm ×2 → My Invoices | Smoke | P0 |
| J3 | **Returning customer purchase** | Login → Add products → Checkout → COD → Confirm ×2 → View invoice | Smoke | P0 |
| J4 | **Profile management** | Login → Account → Profile → View/update details | Regression | P1 |
| J5 | **Guest cart (no purchase)** | Browse → Add to cart → View cart | Regression | P2 |
| J6 | **Support contact** | Contact form → Submit message | Regression | P3 |
| J7 | **Favorites** | Login → Add favorite → View favorites list | Regression | P3 |
| J8 | **Rental browse** | Rental page → View rental-eligible products | Regression | P3 |

**Verification:** J2/J3 align with assessment AC2. Cart creation without login is ✅ verified via API (`POST /carts`). Checkout and invoice UI steps are 🔍.

---

## 2. Authentication Flows

### 2.1 Identified Flows

| Flow | Route (🔍 UI) | API (✅) | Category | Risk |
|------|---------------|----------|----------|------|
| User registration | `/auth/register` | `POST /users/register` | Regression | P1 |
| User login | `/auth/login` | `POST /users/login` → bearer token | Smoke | P0 |
| Logout | 🔍 Account/header action | `GET /users/logout` | Regression | P2 |
| Forgot password | `/auth/forgot-password` | `POST /users/forgot-password` | Regression | P3 |
| Change password | `/account/change-password` | `POST /users/change-password` | Regression | P3 |
| View current user | `/account/profile` | `GET /users/me` | Smoke | P0 |
| Token refresh | — | `GET /users/refresh` | Regression | P2 |
| TOTP setup/login | `/account/totp` | `/totp/setup`, `/totp/verify` | Regression | P3 |
| Social login | 🔍 | `/auth/social-login`, Google/GitHub callbacks | Regression | P3 |

### 2.2 Seeded Test Accounts (✅ — official README)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@practicesoftwaretesting.com | welcome01 |
| Customer | customer@practicesoftwaretesting.com | welcome01 |
| Customer 2 | customer2@practicesoftwaretesting.com | welcome01 |
| Customer 3 | customer3@practicesoftwaretesting.com | pass123 |

### 2.3 Registration Field Rules (✅ — OpenAPI `UserRequest`)

| Field | Constraint |
|-------|------------|
| first_name | Required, max 40 |
| last_name | Required, max 20 |
| email | Required, valid email, max 256 |
| password | Required, min 8; uppercase + lowercase + number + symbol |
| dob | Date between 18 and 75 years ago |
| address fields | Optional; max lengths per field (street 70, postal_code 10, etc.) |
| phone | Max 24 |

### 2.4 Verified API Behavior

- Invalid login → **401** ✅
- `POST /invoices` without auth → **401** ✅

---

## 3. Product Browsing Flows

| Flow | Description | Category | Risk | Verification |
|------|-------------|----------|------|--------------|
| Home page | Landing with product highlights | Smoke | P2 | 🔍 route `/` |
| Product listing | All products paginated | Smoke | P1 | ✅ 50 products, 9/page, 6 pages |
| Category navigation | Top-level + subcategories | Smoke | P2 | ✅ Tree: Hand Tools, Power Tools, Other; subcats include Hammer, Pliers, etc. |
| Category page | Products by category slug | Smoke | P2 | 🔍 `/category/{slug}` e.g. `/category/hammer` |
| Brand browsing | Products by brand | Regression | P3 | ✅ 2 brands via API; filter `by_brand` |
| Rental page | Rental-eligible products | Regression | P3 | ✅ 3 rental products via API; 🔍 `/rental` |
| Pagination | Navigate pages 1–6 | Regression | P2 | ✅ page 2 returns items 10–18 |
| Location offers | Products flagged `is_location_offer` | Regression | P3 | ✅ field exists on products |

---

## 4. Search / Filter / Sort Functionality

| Feature | API Support | UI (🔍) | Category | Risk | Verified Result |
|---------|-------------|---------|----------|------|-----------------|
| **Search by name** | `GET /products/search?q=` | Product search box | Smoke | P2 | ✅ `q=hammer` → 6 results |
| **Filter by category** | `by_category={id}` | Category filter | Regression | P2 | ✅ API param exists |
| **Filter by brand** | `by_brand={id}` | Brand filter | Regression | P3 | ✅ API param exists |
| **Price range** | `between=price,min,max` | Price filter | Regression | P2 | ✅ API param documented |
| **Rental filter** | `is_rental=true` | Rental page/filter | Regression | P3 | ✅ 3 rental products |
| **Sort by name** | `sort=name,asc\|desc` | Sort dropdown | Regression | P2 | 🔍 API documented |
| **Sort by price** | `sort=price,asc\|desc` | Sort dropdown | Regression | P2 | ✅ asc: 3.55–9.17 on page 1 |

> **Note:** Filter UI behavior (combined filters, empty results messaging) requires 🔍 manual UI pass.

---

## 5. Product Details

| Element | Category | Risk | Verification |
|---------|----------|------|--------------|
| Navigate to detail page | Smoke | P1 | 🔍 `/product/{id}` |
| Product name, description, price | Smoke | P1 | ✅ API `ProductResponse` |
| Stock status (`in_stock`) | Regression | P1 | ✅ Out-of-stock example: Long Nose Pliers |
| Brand and category display | Smoke | P2 | ✅ Included in product response |
| Product image | Smoke | P2 | ✅ `product_image` object |
| CO₂ rating, eco-friendly flag | Regression | P3 | ✅ Fields on product |
| Location offer / rental flags | Regression | P3 | ✅ `is_location_offer`, `is_rental` |
| Related products | Regression | P2 | ✅ `GET /products/{id}/related` |
| Add to cart from detail | Smoke | P0 | 🔍 UI; ✅ API add-to-cart |
| Product specifications | Regression | P3 | ✅ API `/products/{id}/specs` |

---

## 6. Cart Functionality

| Flow | Category | Risk | Verification |
|------|----------|------|--------------|
| Create cart (guest) | Smoke | P1 | ✅ `POST /carts` without auth |
| Add product to cart | Smoke | P0 | ✅ `POST /carts/{id}` with `product_id`, `quantity` |
| View cart page | Smoke | P0 | 🔍 `/cart` |
| Cart persists in session | Regression | P2 | 🔍 manual UI |
| Add multiple different products | Smoke | P0 | 📋 Assessment AC2 |
| Remove item from cart | Regression | P1 | ✅ `DELETE /carts/{cartId}/product/{productId}` |
| Delete entire cart | Regression | P2 | ✅ `DELETE /carts/{cartId}` |
| Proceed to checkout | Smoke | P0 | 🔍 `/checkout` |
| Empty cart checkout attempt | Regression | P1 | 🔍 UI validation expected |

---

## 7. Quantity Modification

| Flow | Category | Risk | Verification |
|------|----------|------|--------------|
| Add item with quantity 1 | Smoke | P0 | ✅ API |
| Increase quantity in cart | Smoke | P0 | 📋 AC2; ✅ `PUT /carts/{id}/product/quantity` |
| Decrease quantity | Regression | P1 | ✅ API endpoint exists |
| Add same product twice (merge qty) | Regression | P2 | 🔍 verify UI + API behavior |
| Quantity zero or negative | Regression | P1 | 🔍 boundary — API 422 expected |
| Quantity exceeds stock | Regression | P1 | 🔍 high risk; out-of-stock product available for test |
| Update quantity then checkout | Smoke | P0 | 📋 AC2 |

---

## 8. Checkout

| Step | Category | Risk | Verification |
|------|----------|------|--------------|
| Navigate to checkout | Smoke | P0 | 🔍 `/checkout` |
| Billing address entry | Smoke | P0 | 📋 AC2; fields match invoice API |
| Postcode lookup auto-fill | Regression | P2 | ✅ `GET /postcode-lookup` returns address for TG/1234AA |
| Select payment method | Smoke | P0 | 🔍 UI payment selector |
| Order summary review | Smoke | P1 | 🔍 |
| Confirm order screen | Smoke | P0 | 🔍 `/checkout/confirm` |
| Guest checkout | Regression | P2 | ✅ `POST /invoices/guest` in API |

### Billing Fields (✅ — OpenAPI `InvoiceRequest`)

Required: `billing_street`, `billing_city`, `billing_state`, `billing_country`, `billing_postal_code`, `payment_method`, `payment_details`, `cart_id`

---

## 9. Cash-on-Delivery Flow

| Step | Category | Risk | Verification |
|------|----------|------|--------------|
| Select **Cash on Delivery** at checkout | Smoke | P0 | 📋 AC2; ✅ `payment_method: "cash-on-delivery"` |
| Payment validation | Smoke | P0 | ✅ `POST /payment/check` → `"Payment was successful"` with empty `payment_details` |
| Complete order with COD | Smoke | P0 | 📋 AC2 |
| COD with empty `payment_details: {}` | Smoke | P0 | 📋 Assessment example payload |

### Other Payment Methods (✅ — OpenAPI enum; Regression only)

`bank-transfer`, `credit-card`, `buy-now-pay-later`, `gift-card` — each requires different `payment_details` shape. **Not in assessment core AC** but available for regression if scope allows.

---

## 10. Invoice Generation

### 10.1 Assessment Requirement — Double Confirm (📋 Explicit)

> **"You need to press confirm twice to generate invoice"**  
> **"For Invoice ID, press confirm button on the application twice"**

| Validation Point | How to Validate (Manual / Future Automation) | Category |
|------------------|-----------------------------------------------|----------|
| Single Confirm click | Invoice is **not** generated; user remains on confirm screen or sees no invoice ID | Regression |
| First Confirm click | Observe intermediate state (loading, confirmation step, or no invoice yet) — document actual UI behavior | Regression |
| Second Confirm click | Invoice is generated; invoice ID/number appears | Smoke |
| Post-generation | Redirect or success message displayed | Smoke |
| My Invoices | New invoice appears in list | Smoke |
| API correlation | `POST /invoices` succeeds after UI flow (authenticated) | Smoke |

**Risk:** P0 — Missing second confirm is the #1 cause of false failures in checkout automation.

### 10.2 API Invoice Creation (✅)

| Endpoint | Auth | Category |
|----------|------|----------|
| `POST /invoices` | Bearer token required (401 without) | Smoke |
| `POST /invoices/guest` | Guest fields: `guest_email`, `guest_first_name`, `guest_last_name` | Regression |

### 10.3 Invoice Response Fields (✅ — OpenAPI)

`invoice_number`, `invoice_date`, `status`, `subtotal`, `total`, `invoicelines[]`, billing address fields

### 10.4 Invoice Status Lifecycle (Regression — API/state machine)

`AWAITING_FULFILLMENT` → `ON_HOLD` → `AWAITING_SHIPMENT` → `SHIPPED` → `COMPLETED`  
Updated via `PUT /invoices/{id}/status` (admin/authenticated).

### 10.5 PDF Download (Regression)

`GET /invoices/{invoice_number}/download-pdf`  
Status polling: `INITIATED` → `IN_PROGRESS` → `COMPLETED`

---

## 11. My Invoices

| Flow | Route | Category | Risk | Verification |
|------|-------|----------|------|--------------|
| Navigate to My Invoices | `/account/invoices` | Smoke | P0 | 🔍 route exists |
| List user invoices | — | Smoke | P0 | ✅ `GET /invoices` (user sees own) |
| View invoice detail | — | Smoke | P0 | ✅ `GET /invoices/{id}` |
| Search invoices | — | Regression | P2 | ✅ search on `invoice_number`, `billing_street`, `status` |
| Verify line items and totals | — | Smoke | P1 | ✅ `invoicelines` in response |
| Download PDF | — | Regression | P2 | ✅ API endpoint exists |
| Orders page | `/account/orders` | Regression | P2 | 🔍 route exists; relationship to invoices TBD on UI |

---

## 12. Logout / Session Behavior

| Scenario | Category | Risk | Verification |
|----------|----------|------|--------------|
| Logout from account menu | Regression | P2 | 🔍 `GET /users/logout` |
| Access `/account/*` after logout | Regression | P1 | 🔍 expect redirect to login |
| Access cart after logout | Regression | P2 | 🔍 guest cart behavior |
| JWT token expiry (~120 min per OpenAPI example) | Regression | P2 | 🔍 API `expires_in`; mid-checkout expiry |
| Browser refresh maintains session | Regression | P2 | 🔍 manual |
| Back button after checkout | Regression | P2 | 🔍 duplicate submit risk |

---

## 13. Validation Messages

> UI message text requires 🔍 **manual UI verification**. Rules below are from ✅ **OpenAPI** unless noted.

| Area | Trigger | Expected Validation (API) | Category |
|------|---------|---------------------------|----------|
| Registration — empty required fields | Submit blank form | 422 / field errors | Regression |
| Registration — weak password | Password without complexity | 422 | Regression |
| Registration — invalid email | Malformed email | 422 | Regression |
| Registration — duplicate email | Existing email | 409 conflict | Regression |
| Registration — DOB under 18 / over 75 | Invalid DOB | 422 | Regression |
| Login — wrong credentials | Bad email/password | 401 ✅ verified | Regression |
| Login — empty fields | Blank submit | 🔍 UI required-field messages | Regression |
| Contact — missing subject/message | Incomplete form | Required: subject, message (max 120/250) | Regression |
| Contact — guest without email | Unauthenticated, no email | email required when not authenticated | Regression |
| Checkout — missing billing fields | Incomplete address | 422 on invoice API | Regression |
| Checkout — invalid payment details | Wrong card/gift card data | Payment check failure | Regression |
| Cart — out-of-stock product | Add OOS item | 🔍 UI/API block expected | Regression |

---

## 14. Negative Scenarios

| # | Scenario | Category | Risk |
|---|----------|----------|------|
| N1 | Login with invalid credentials | Regression | P1 |
| N2 | Register with duplicate email | Regression | P1 |
| N3 | Register with weak password | Regression | P2 |
| N4 | Checkout with empty cart | Regression | P1 |
| N5 | Checkout without login (authenticated invoice path) | Regression | P1 |
| N6 | Invoice API without bearer token | Regression | P1 |
| N7 | Use invalid/expired cart_id at checkout | Regression | P1 |
| N8 | Add out-of-stock product to cart | Regression | P1 |
| N9 | Search with no matching results | Regression | P2 |
| N10 | Single Confirm only (no invoice generated) | Regression | P0 |
| N11 | Access another user's invoice by ID | Regression | P1 |
| N12 | Reuse cart after invoice created | Regression | P1 |

---

## 15. Boundary / Edge Cases

| # | Case | Category | Risk |
|---|------|----------|------|
| E1 | Pagination — first page / last page (page 6) | Regression | P2 |
| E2 | Pagination — beyond last page | Regression | P3 |
| E3 | first_name exactly 40 chars / 41 chars | Regression | P3 |
| E4 | Cart quantity = 1 (minimum) | Regression | P2 |
| E5 | Cart with multiple line items (different products) | Smoke | P0 |
| E6 | Product at minimum price (3.55 observed on sort) | Regression | P3 |
| E7 | Thor Hammer — "only one per customer" (product description) | Regression | P2 |
| E8 | Postcode lookup with optional house_number | Regression | P3 |
| E9 | Guest invoice with missing guest_email | Regression | P2 |
| E10 | Maximum message length 250 chars (contact) | Regression | P3 |

---

## 16. Error Handling

| Error Type | Example | Expected Behavior | Category | Verification |
|------------|---------|-------------------|----------|--------------|
| 401 Unauthorized | Invoice without token | Error message / redirect to login | Regression | ✅ API 401 |
| 404 Not Found | Invalid product ID | Not found message | Regression | ✅ API documented |
| 422 Unprocessable | Invalid registration payload | Field-level validation errors | Regression | ✅ API documented |
| 409 Conflict | Duplicate email/slug | Conflict message | Regression | ✅ API documented |
| 405 Method Not Allowed | GET on `/carts` create endpoint | Method not allowed | Regression | ✅ observed earlier |
| Network / timeout | Slow response on confirm | Graceful error or retry | Regression | 🔍 |
| Payment check failure | Invalid credit card | Block checkout progression | Regression | 🔍 UI |
| PDF not ready | Download before generation complete | Status polling / user message | Regression | ✅ status endpoint |

---

## 17. Potential High-Risk Areas

| Risk Area | Description | Impact | Mitigation in Testing |
|-----------|-------------|--------|------------------------|
| **Double Confirm** | Invoice not created on single click | Checkout appears broken | Always click Confirm twice; assert invoice in My Invoices |
| **Out-of-stock products** | Long Nose Pliers verified OOS | Cart/checkout failure | Select `in_stock: true` products; dedicated OOS negative test |
| **Shared public environment** | Other testers modify data | Flaky registration/invoices | Unique emails per run |
| **Cart lifecycle** | Cart invalid after invoicing | 422 on repeat checkout | Fresh cart per test |
| **Auth token expiry** | JWT expires mid-flow | 401 during checkout | Re-login fixture or token refresh |
| **Guest vs authenticated paths** | Wrong invoice endpoint | Silent failures | Use `/invoices` vs `/invoices/guest` correctly |
| **Quantity/stock mismatch** | Order more than available | Data integrity issue | Boundary tests on quantity |
| **Payment method complexity** | 5 methods with different payloads | Scope creep | Core = COD only per AC2 |
| **PDF async generation** | Download before ready | False failure on PDF test | Poll `download-pdf-status` |
| **Pagination/sort cache** | API caches GET 120s | Stale catalog after admin change | Use unique search terms |

---

## Smoke vs Regression — Recommended Test Portfolio

> Assessment limit: **5–8 tests per tier** (manual, UI, API). Below is the recommended priority if scope is constrained.

### Smoke (Critical Path — must pass)

| ID | Flow |
|----|------|
| S1 | Login with valid seeded customer |
| S2 | Browse products / view product detail |
| S3 | Add product(s) to cart |
| S4 | Update cart quantity |
| S5 | Checkout with Cash on Delivery |
| S6 | **Confirm twice** → invoice generated |
| S7 | View invoice in My Invoices |
| S8 | Register new user → login → verify profile (AC1) |

### Regression (Extended — negative, edge, secondary)

| ID | Flow |
|----|------|
| R1 | Invalid login credentials |
| R2 | Registration validation (weak password / duplicate email) |
| R3 | Search and sort products |
| R4 | Add out-of-stock product (negative) |
| R5 | Empty cart checkout attempt |
| R6 | Single Confirm — invoice NOT created |
| R7 | Logout and protected route access |
| R8 | Contact form validation |
| R9 | Guest cart behavior |
| R10 | Postcode lookup at checkout |

---

## Double-Confirm Validation — Test Design Reference

```
Given a logged-in user with items in cart
  And the user is on the checkout confirmation screen
When the user clicks Confirm once
Then an invoice is NOT yet available in My Invoices   [Regression]

When the user clicks Confirm a second time
Then an invoice is generated
  And an invoice ID/number is displayed               [Smoke]
  And the invoice appears under My Invoices           [Smoke]
  And invoice line items match cart contents          [Smoke]
```

**Evidence to capture:** Screenshot after 1st confirm (no invoice), screenshot after 2nd confirm (invoice visible), My Invoices list showing new entry.

---

## Modules Observed (Routes / API)

### Customer UI Routes (🔍 — HTTP 200 observed in prior exploration)

`/`, `/products`, `/category/{slug}`, `/product/{id}`, `/rental`, `/cart`, `/checkout`, `/checkout/confirm`, `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/account`, `/account/profile`, `/account/orders`, `/account/invoices`, `/account/favorites`, `/account/messages`, `/account/change-password`, `/contact`, `/about`, `/privacy`, `/terms`

### API Resource Groups (✅ — OpenAPI v5.0)

`users`, `products`, `categories`, `brands`, `carts`, `invoices`, `payment`, `postcode-lookup`, `favorites`, `messages`, `images`, `reports`, `totp`, `auth` (social)

### Out of Assessment Core (documented but lower priority)

Admin (`/admin/*`), reporting, PIM CRUD, TOTP, social OAuth, mobile app integration

---

## Assumptions and Gaps

| Item | Status |
|------|--------|
| Exact Confirm button label and screen layout | 🔍 Not observed in this session — verify on UI |
| UI validation message wording | 🔍 Verify manually; API rules documented above |
| Whether Orders and Invoices are separate views | 🔍 Both routes exist; relationship unclear |
| Guest checkout UI flow | API exists; UI path not verified |
| "Sanity" vs "Smoke" terminology | Treated as equivalent per assessment analysis |

---

## Sources

1. Live API exploration (`api.practicesoftwaretesting.com`) — read-only GET/POST for catalog, cart, auth error codes  
2. OpenAPI 3.2 spec (Toolshop API v5.0.0)  
3. Official repository README (default accounts, sprint scope)  
4. QA Practical Assessment PDF (AC1, AC2, double-confirm requirement)  
5. Prior route availability check on `practicesoftwaretesting.com`

**No test scripts were created.** This document is for manual test design and future automation planning.
