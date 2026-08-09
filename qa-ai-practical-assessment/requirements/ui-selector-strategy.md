# UI Selector Strategy — Practice Software Testing Toolshop

**Application:** https://practicesoftwaretesting.com/ (Sprint 5 / v5.0)  
**Inspection date:** 2026-08-09  
**Source:** Live DOM capture via Playwright (headless Chromium)  
**Evidence:** `PrismStructure/selector-inspection-summary.json`, `PrismStructure/scripts/inspect-dom-cart-output.json`

**Mapped manual tests:** `FunctionalTestCase.csv` (TC-MAN-001 … TC-MAN-008)

---

## 1. Executive summary

The Toolshop Angular UI exposes **stable `data-test` attributes** on auth forms, navigation, product detail, cart/checkout, and field-level validation errors. It does **not** use `data-testid` anywhere on inspected pages.

| Finding | Impact |
|---------|--------|
| Attribute is `data-test`, not `data-testid` | Set `testIdAttribute: 'data-test'` in `playwright.config.js` so `getByTestId()` resolves correctly |
| `/cart` redirects to `/` when cart is empty | Cart assertions and actions must target `/checkout` after at least one item is added |
| `/products` redirects to `/` | Browse via `/category/{slug}` or home listing — not `/products` |
| No `data-test="in-stock"` | In-stock state is inferred from absence of `out-of-stock` + enabled `add-to-cart` |
| Confirm control is `data-test="finish"` | Label text is **Confirm**; lives on `/checkout` (separate `/checkout/confirm` DOM not captured) |
| Invoice list rows lack `data-test` | Invoice verification needs fallback strategy (see §12) |
| Category/product card IDs are ULIDs | Do not hardcode `product-{id}` / `category-{id}` in tests — resolve at runtime |

### Selector priority (this project)

1. `data-test` → `page.getByTestId('…')` (with `testIdAttribute: 'data-test'`)
2. Accessible role + name (`getByRole`, `getByLabel`)
3. Stable HTML `id` on form fields (matches `data-test` twin, e.g. `#email`)
4. Route + semantic structure (last resort; document why)

### Anti-patterns (do not use)

- Bootstrap / Angular generated classes (`.alert-danger` alone, `.card`, `.btn-primary`)
- `nth-child`, deep CSS hierarchy
- `_ngcontent-*` / `ng-reflect-*` attributes
- `getByLabel(/password/i)` on login page — matches **Forgot your Password?** link (`forgot-password-link`)
- Hardcoded product/category ULIDs in committed test code

---

## 2. Playwright configuration

```javascript
// playwright.config.js — ui-chromium project
use: {
  ...devices['Desktop Chrome'],
  baseURL: process.env.BASE_URL || 'https://practicesoftwaretesting.com',
  testIdAttribute: 'data-test',
},
```

**Locator style in page objects:**

```javascript
this.emailInput = page.getByTestId('email');
// equivalent: page.locator('[data-test="email"]')
```

---

## 3. Global / shared elements

| Page | Element | Preferred selector | Type | Why stable | Fallback |
|------|---------|-------------------|------|------------|----------|
| All | App notification banner | `getByTestId('notification-bar')` | data-test | SUT-provided test hook on every page | — |
| Header (guest) | Sign in link | `getByTestId('nav-sign-in')` | data-test | Stable nav hook; `href="/auth/login"` | `getByRole('link', { name: 'Sign in' })` |
| Header (auth) | Account menu toggle | `getByTestId('nav-menu')` | data-test | Opens account dropdown; `id="menu"` | `getByRole('button', { name: /Jane Doe\|customer/i })` — **user name is dynamic** |
| Header (auth) | My profile | `getByTestId('nav-my-profile')` | data-test | Stable; inside dropdown | `page.goto('/account/profile')` |
| Header (auth) | My invoices | `getByTestId('nav-my-invoices')` | data-test | Stable; inside dropdown | `page.goto('/account/invoices')` |
| Header (auth) | Sign out | `getByTestId('nav-sign-out')` | data-test | Stable logout action | Open `nav-menu` first, then click |
| Header (auth) | Cart link | `getByTestId('nav-cart')` | data-test | Present when cart has items | — |
| Header (auth) | Cart item count badge | `getByTestId('cart-quantity')` | data-test | Numeric badge; value is dynamic | — |
| Header | Hand Tools category | `getByTestId('nav-hand-tools')` | data-test | Top-level nav link | `page.goto('/category/hand-tools')` |
| Header | Categories dropdown | `getByTestId('nav-categories')` | data-test | Expands subcategory links | — |
| Header | Home | `getByTestId('nav-home')` | data-test | Stable nav | `page.goto('/')` |

**Note:** Account dropdown links (`nav-my-profile`, `nav-sign-out`, etc.) are `visible: false` until `nav-menu` is clicked. Page objects should open the menu before interacting.

---

## 4. TC-MAN-001 — Registration, login, profile (SC-01) `@smoke`

### 4.1 Registration (`/auth/register`)

| Element | Preferred selector | Type | Why stable | Fallback |
|---------|-------------------|------|------------|----------|
| Registration form | `getByTestId('register-form')` | data-test | Form container hook | `getByRole('form')` |
| First name | `getByTestId('first-name')` | data-test | Matches `id="first_name"`, `formcontrolname="first_name"` | `getByLabel('First name')` |
| Last name | `getByTestId('last-name')` | data-test | Matches `id="last_name"` | `getByLabel('Last name')` |
| Date of birth | `getByTestId('dob')` | data-test | `placeholder="YYYY-MM-DD"` | `getByLabel(/date of birth/i)` |
| Country | `getByTestId('country')` | data-test | `<select id="country">` | `getByLabel('Country')` |
| Postal code | `getByTestId('postal_code')` | data-test | `id="postal_code"` | `getByLabel('Postal code')` |
| House number | `getByTestId('house_number')` | data-test | `id="house_number"` | `getByLabel('House number')` |
| Street | `getByTestId('street')` | data-test | `id="street"` | `getByLabel('Street')` |
| City | `getByTestId('city')` | data-test | `id="city"` | `getByLabel('City')` |
| State | `getByTestId('state')` | data-test | `id="state"` | `getByLabel('State')` |
| Phone | `getByTestId('phone')` | data-test | `id="phone"` | `getByLabel('Phone')` |
| Email | `getByTestId('email')` | data-test | `id="email"` | `getByLabel('Email address')` |
| Password | `getByTestId('password')` | data-test | `id="password"` | `getByLabel(/^password$/i)` scoped to register form |
| Submit | `getByTestId('register-submit')` | data-test | Button text **Register** | `getByRole('button', { name: 'Register' })` |
| Postcode lookup hint | `getByTestId('postcode-lookup-hint')` | data-test | Static help text for NL lookup | — |

### 4.2 Login (`/auth/login`)

| Element | Preferred selector | Type | Why stable | Fallback |
|---------|-------------------|------|------------|----------|
| Login form | `getByTestId('login-form')` | data-test | Form container | — |
| Email | `getByTestId('email')` | data-test | `type="email"`, `id="email"` | `#email` |
| Password | `getByTestId('password')` | data-test | `type="password"`, `id="password"` | `#password` — **do not use** `getByLabel(/password/i)` |
| Submit | `getByTestId('login-submit')` | data-test | `type="submit"`, `aria-label="Login"` | `getByRole('button', { name: 'Login' })` |
| Register link | `getByTestId('register-link')` | data-test | Navigates to register | `getByRole('link', { name: /register your account/i })` |

**Post-login assertion:** URL becomes `/account` (Overview page).

### 4.3 Profile (`/account/profile`)

| Element | Preferred selector | Type | Why stable | Fallback |
|---------|-------------------|------|------------|----------|
| Page heading | `getByTestId('page-title')` | data-test | Present on account sub-pages | `getByRole('heading', { name: /profile/i })` |
| First name (read/write) | `getByTestId('first-name')` | data-test | Same hook as register | Assert `.inputValue()` |
| Last name | `getByTestId('last-name')` | data-test | — | — |
| Email | `getByTestId('email')` | data-test | — | — |
| Phone | `getByTestId('phone')` | data-test | — | — |
| Street | `getByTestId('street')` | data-test | — | — |
| Postal code | `getByTestId('postal_code')` | data-test | — | — |
| City | `getByTestId('city')` | data-test | — | — |
| State | `getByTestId('state')` | data-test | — | — |
| Country | `getByTestId('country')` | data-test | — | — |
| Save profile | `getByTestId('update-profile-submit')` | data-test | Button **Update Profile** | `getByRole('button', { name: 'Update Profile' })` |

---

## 5. TC-MAN-002 — E2E purchase flow (SC-02, SC-03) `@smoke`

### 5.1 Product browse & search

| Page | Element | Preferred selector | Type | Why stable | Fallback |
|------|---------|-------------------|------|------------|----------|
| Home `/` | Search input | `getByTestId('search-query')` | data-test | `id="search-query"`, `formcontrolname="query"` | `#search-query` |
| Home | Search submit | `getByTestId('search-submit')` | data-test | `type="submit"` | Press `Enter` in search field |
| Home | Clear search | `getByTestId('search-reset')` | data-test | `type="reset"` | — |
| `/category/hand-tools` | Category title | `getByTestId('page-title')` | data-test | Text **Category: Hand Tools** | `getByRole('heading', { name: /hand tools/i })` |
| `/category/hammer` | Hammer category page | `page.goto('/category/hammer')` | route | Direct slug route works (200); no `data-test` link for Hammer on hand-tools filters | Filter checkbox `category-{ulid}` — **ULID unstable** |
| Category listing | Product card (by name) | `getByRole('link', { name: 'Combination Pliers' })` within listing | role+name | Product name is seeded catalog data; card wrapper uses `product-{ulid}` | Resolve product URL via `productResolver.js` + `page.goto()` |
| Category listing | Product name on card | `getByTestId('product-name')` scoped to card | data-test | Repeats per card — must scope to parent card/row | — |
| Category listing | Price on card | `getByTestId('product-price')` scoped to card | data-test | Price text is dynamic | — |
| Category listing | Sort dropdown | `getByTestId('sort')` | data-test | `<select>` with fixed option labels | `getByLabel(/sort/i)` |
| Category listing | Filters panel | `getByTestId('filters')` | data-test | `id="filters"` on panel | — |

**Catalog note (verified):** `Combination Pliers` card exists on `/category/hand-tools` as `data-test="product-01KZJRJY8DKJK18DFNM698NGE6"`. Product URL: `/product/01KZJRJY8DKJK18DFNM698NGE6`. **Do not commit ULID** — resolve at runtime.

**Route note:** `/products` redirects to `/`. Use home search or category routes.

### 5.2 Product detail

| Element | Preferred selector | Type | Why stable | Fallback |
|---------|-------------------|------|------------|----------|
| Product title | `getByTestId('product-name')` | data-test | On detail page (distinct from listing cards) | `getByRole('heading')` — name varies |
| Unit price | `getByTestId('unit-price')` | data-test | Price is dynamic text | — |
| Quantity input | `getByTestId('quantity')` | data-test | `type="number"`, `id="quantity-input"` | `getByLabel('Quantity')` |
| Decrease qty | `getByTestId('decrease-quantity')` | data-test | Accessible name **Decrease quantity** | `getByRole('button', { name: 'Decrease quantity' })` |
| Increase qty | `getByTestId('increase-quantity')` | data-test | Accessible name **Increase quantity** | `getByRole('button', { name: 'Increase quantity' })` |
| Add to cart | `getByTestId('add-to-cart')` | data-test | Accessible name **Add to cart** | `getByRole('button', { name: 'Add to cart' })` |
| In stock (positive) | **No dedicated hook** | — | No `in-stock` attribute observed | Assert `out-of-stock` **not visible** AND `add-to-cart` **enabled** |
| Out of stock | `getByTestId('out-of-stock')` | data-test | Only present when OOS (see TC-MAN-007) | — |

**Verified product URLs (current seed — resolve dynamically in automation):**

| Product | URL path |
|---------|----------|
| Combination Pliers | `/product/01KZJRJY8DKJK18DFNM698NGE6` |
| Claw Hammer (full name on detail) | `/product/01KZJRJY8PG1R7JCS3QH8CFFC7` |
| Long Nose Pliers | `/product/01KZJRJY8KBKYCHNZCA84V5W3D` |

### 5.3 Cart (rendered on `/checkout`)

| Element | Preferred selector | Type | Why stable | Fallback |
|---------|-------------------|------|------------|----------|
| Cart page route | `page.goto('/checkout')` | route | `/cart` redirects to `/` when empty; with items, cart table is on checkout | — |
| Line item title | `getByTestId('product-title')` | data-test | Product name in cart row — scope per row | Row filter: `locator('tr').filter({ hasText: productName })` |
| Line quantity | `getByTestId('product-quantity')` | data-test | `type="number"` per line | `getByRole('spinbutton')` within row |
| Line unit price | `getByTestId('product-price')` | data-test | Dynamic currency text | — |
| Line subtotal | `getByTestId('line-price')` | data-test | Dynamic | — |
| Cart total | `getByTestId('cart-total')` | data-test | Footer total cell | — |
| Continue shopping | `getByTestId('continue-shopping')` | data-test | Button text **Continue Shopping** | — |
| Proceed to checkout (step 1) | `getByTestId('proceed-1')` | data-test | Multi-step wizard; only one visible at a time | `getByRole('button', { name: 'Proceed to checkout' })` |
| Proceed to checkout (step 2) | `getByTestId('proceed-2')` | data-test | Billing step advance | Same role fallback |
| Proceed to checkout (step 3) | `getByTestId('proceed-3')` | data-test | Payment step advance | Same role fallback |

**Gap — remove line item:** No `data-test` hook for delete/remove row was observed. **Cannot reliably identify without further DOM inspection with multi-item cart.**

### 5.4 Checkout — billing & payment

| Element | Preferred selector | Type | Why stable | Fallback |
|---------|-------------------|------|------------|----------|
| Street | `getByTestId('street')` | data-test | `id="street"` | `getByLabel('Street')` |
| City | `getByTestId('city')` | data-test | `id="city"` | `getByLabel('City')` |
| State | `getByTestId('state')` | data-test | `id="state"` | `getByLabel('State')` |
| Country | `getByTestId('country')` | data-test | `<select id="country">` | `getByLabel('Country')` |
| House number | `getByTestId('house_number')` | data-test | Required for postcode lookup | `getByLabel('House number')` |
| Postal code | `getByTestId('postal_code')` | data-test | `id="postal_code"` | `getByLabel('Postal code')` |
| Postcode lookup hint | `getByTestId('postcode-lookup-hint')` | data-test | Documents auto-fill behaviour | — |
| Payment method | `getByTestId('payment-method')` | data-test | `<select id="payment-method">` | `getByLabel(/payment method/i)` |
| Cash on Delivery | `payment-method` → `selectOption('cash-on-delivery')` | value | Option label **Cash on Delivery** | `getByRole('option', { name: 'Cash on Delivery' })` |

### 5.5 Order confirmation (double Confirm — assessment rule)

| Element | Preferred selector | Type | Why stable | Fallback |
|---------|-------------------|------|------------|----------|
| Confirm button | `getByTestId('finish')` | data-test | Button text **Confirm**; disabled until billing + payment complete | `getByRole('button', { name: 'Confirm' })` |
| Double-confirm action | Click `finish` **twice** | behaviour | Assessment requirement (TC-MAN-002, TC-MAN-005 negative uses once) | — |

**Gap — invoice ID on confirmation screen:** Not captured in DOM inspection (full checkout wizard was not completed). **Requires verification during test implementation** — candidate: text matching `/INV-/` or success region near `finish`.

**Gap — `/checkout/confirm` route:** Inspection could not reach a distinct confirm URL; confirm control appears on `/checkout`. Re-inspect after completing billing + COD selection.

---

## 6. TC-MAN-003 — Invalid login (SC-04) `@regression`

| Element | Preferred selector | Type | Why stable | Fallback |
|---------|-------------------|------|------------|----------|
| Email | `getByTestId('email')` | data-test | — | — |
| Password | `getByTestId('password')` | data-test | Avoid label regex (see §4.2) | — |
| Submit | `getByTestId('login-submit')` | data-test | — | — |
| Error message | `getByTestId('login-error')` | data-test | `class="alert alert-danger"`, `aria-live="assertive"`; text **Invalid email or password** | `getByRole('alert')` |

**Session assertion:** After failed login, direct navigation to `/account/profile` should redirect to login or deny access (URL/title assertion — no unique `data-test` for auth guard).

---

## 7. TC-MAN-004 — Registration validation (SC-05) `@regression`

### 7.1 Weak password

| Element | Preferred selector | Type | Why stable | Fallback |
|---------|-------------------|------|------------|----------|
| Password field | `getByTestId('password')` | data-test | — | — |
| Submit | `getByTestId('register-submit')` | data-test | — | — |
| Password error | `getByTestId('password-error')` | data-test | `role="alert"`, `id="password-error"`; references min length / invalid characters | `getByRole('alert').filter({ hasText: /password/i })` |

**Note:** Submitting with only password weak may also surface other required-field errors (`dob-error`, `country-error`, etc.). Tests should fill all other fields validly, leaving password weak.

### 7.2 Duplicate email

| Element | Preferred selector | Type | Why stable | Fallback |
|---------|-------------------|------|------------|----------|
| Email field | `getByTestId('email')` | data-test | — | — |
| Duplicate email error | **NOT VERIFIED** | — | `email-error` hook not triggered in inspection | **Re-inspect** by submitting `customer@practicesoftwaretesting.com` with otherwise valid data; candidate: `getByTestId('email-error')` or `role="alert"` near email field |

---

## 8. TC-MAN-005 — Single Confirm negative (SC-06) `@regression`

Uses same selectors as §5.3–5.5. Key actions:

1. `getByTestId('finish').click()` — **once only**
2. Assert invoice **not** fully issued (selector TBD — see gap in §5.5)
3. Compare invoice count on `getByTestId('nav-my-invoices')` destination page

---

## 9. TC-MAN-006 — Empty cart checkout blocked (SC-08) `@regression`

| Observation | Selector strategy |
|-------------|-------------------|
| `/cart` with empty cart | Redirects to `/` — no empty-cart `data-test` message found |
| `/checkout` with empty cart | Page loads but cart line items absent; `proceed-*` / `finish` not actionable |

**Gap — empty cart message:** No reliable `data-test` for “cart is empty”. **Recommended assertion:** `getByTestId('product-title')` **not visible** on `/checkout` AND/OR URL stays off invoice confirmation after attempting `proceed-1` click.

**Re-inspect required** with authenticated user and explicitly empty cart before automating.

---

## 10. TC-MAN-007 — Out-of-stock add to cart (SC-14) `@regression`

| Element | Preferred selector | Type | Why stable | Fallback |
|---------|-------------------|------|------------|----------|
| OOS badge | `getByTestId('out-of-stock')` | data-test | Present on Long Nose Pliers detail + listing card | — |
| Add to cart (disabled) | `getByTestId('add-to-cart')` | data-test | `disabled: true` when OOS | `expect(addToCart).toBeDisabled()` |
| Quantity controls (disabled) | `getByTestId('decrease-quantity')`, `increase-quantity` | data-test | Both `disabled: true` on OOS product | — |

**Cart verification:** Navigate to `/checkout`; assert `product-title` does **not** contain **Long Nose Pliers** (text match acceptable here as product name is test data constant).

---

## 11. TC-MAN-008 — Logout / session (SC-04 session) `@regression`

| Step | Preferred selector | Type | Why stable | Fallback |
|------|-------------------|------|------------|----------|
| Open account menu | `getByTestId('nav-menu').click()` | data-test | Required to reveal dropdown links | — |
| Sign out | `getByTestId('nav-sign-out').click()` | data-test | Stable logout hook | — |
| Post-logout profile access | Navigate `/account/profile` | route | Should redirect to login | Assert `getByTestId('login-form')` visible |

---

## 12. My Invoices — invoice list & detail (TC-MAN-002 step 16–17)

| Element | Preferred selector | Type | Why stable | Fallback |
|---------|-------------------|------|------------|----------|
| Page heading | `getByTestId('page-title')` | data-test | Text **Invoices** | `getByRole('heading', { name: 'Invoices' })` |
| Pagination prev | `getByTestId('pagination-prev')` | data-test | — | — |
| Pagination next | `getByTestId('pagination-next')` | data-test | — | — |
| Invoice table row | **NOT RELIABLY IDENTIFIED** | — | No `invoice-row` or similar `data-test` on list page (empty or zero-row state inspected) | `locator('table tbody tr')` — **fragile**; prefer re-inspect with ≥1 invoice |
| Invoice number link | **NOT RELIABLY IDENTIFIED** | — | No `data-test` captured | Text match `/INV-/` within table — dynamic invoice numbers |
| Invoice line items (detail) | **NOT INSPECTED** | — | Detail page not reached in inspection | API fallback: `GET /users/me` + invoice API for assertions |

---

## 13. Field-level validation error pattern (register)

All observed field errors follow `{field}-error` convention:

| Field | Error selector |
|-------|----------------|
| DOB | `getByTestId('dob-error')` |
| Country | `getByTestId('country-error')` |
| Postal code | `getByTestId('postal_code-error')` |
| House number | `getByTestId('house_number-error')` |
| Street | `getByTestId('street-error')` |
| City | `getByTestId('city-error')` |
| State | `getByTestId('state-error')` |
| Phone | `getByTestId('phone-error')` |
| Password | `getByTestId('password-error')` |
| Login (global) | `getByTestId('login-error')` |

Common attributes: `role="alert"`, `class="alert alert-danger"`, matching `id="{field}-error"`.

---

## 14. Dynamic / unstable selectors — handling rules

| Pattern | Example | Automation rule |
|---------|---------|-----------------|
| Product card wrapper | `data-test="product-01KZJRJY8DKJK18DFNM698NGE6"` | Resolve product ID via API (`productResolver.js`) by name |
| Category filter checkbox | `data-test="category-01KZJRJY7JMNGZQCCFH2PN71G1"` | Prefer route `/category/hammer` over checkbox ULID |
| Brand filter | `data-test="brand-01KZJRJXX061F0R31NDHCTZNYY"` | Avoid unless brand filter is in scope |
| Cart line quantity input `id` | `quantity-01kzjssb54zqszb34rrae02qgx` | Use `getByTestId('product-quantity')` scoped to row |
| Account menu button text | `Jane Doe` | Use `nav-menu`, not display name |
| Prices, totals, invoice numbers | `$12.01`, `INV-…` | Assert via test data / API, not as selectors |

---

## 15. Traceability matrix (manual TC → primary selectors)

| Manual TC | Flow | Primary `data-test` hooks |
|-----------|------|---------------------------|
| TC-MAN-001 | Register → Login → Profile | `register-submit`, `login-submit`, `first-name`, `email`, `update-profile-submit` |
| TC-MAN-002 | Browse → Cart → Checkout → Invoice | `search-query`, `page-title`, `add-to-cart`, `product-quantity`, `proceed-1..3`, `payment-method`, `finish` (×2), `nav-my-invoices` |
| TC-MAN-003 | Invalid login | `login-error` |
| TC-MAN-004 | Weak / duplicate register | `password-error`; duplicate TBD |
| TC-MAN-005 | Single confirm | `finish` (×1) |
| TC-MAN-006 | Empty cart | **Gap** — redirect behaviour only |
| TC-MAN-007 | OOS product | `out-of-stock`, `add-to-cart` disabled |
| TC-MAN-008 | Logout | `nav-menu`, `nav-sign-out`, `login-form` |

---

## 16. Gaps requiring follow-up before UI test implementation

| # | Gap | Recommended action |
|---|-----|-------------------|
| G1 | Invoice list row / detail selectors | Re-inspect `/account/invoices` after creating an invoice via UI |
| G2 | Invoice ID on post-confirm screen | Complete full checkout; capture success region `data-test` or stable text |
| G3 | Duplicate email error hook | Submit register with seeded `customer@…` email; confirm `email-error` |
| G4 | Empty cart blocked message / redirect | Re-inspect `/checkout` with auth + empty cart |
| G5 | Remove cart line item | Re-inspect multi-item cart on `/checkout` |
| G6 | Distinct `/checkout/confirm` DOM | Complete wizard; compare URL and selectors vs `/checkout` |
| G7 | `playwright.config.js` missing `testIdAttribute` | Add `testIdAttribute: 'data-test'` before writing specs |

---

## 17. Page object alignment (next step)

Update `PrismStructure/pages/*.js` to use `getByTestId()` per this document. Known corrections from inspection:

| Current page object | Issue | Correct hook |
|--------------------|-------|--------------|
| `LoginPage` — `getByLabel(/password/i)` | Matches forgot-password link | `getByTestId('password')` |
| `ProductsPage` — `getByPlaceholder(/search/i)` | Search only on home | `getByTestId('search-query')` on home; category routes for browse |
| `CartPage` — `/cart` route | Redirects when empty | Target `/checkout` for cart table |
| `CheckoutPage` — `getByLabel(/cash on delivery/i)` | Payment is `<select>` | `getByTestId('payment-method').selectOption('cash-on-delivery')` |
| `CheckoutPage` — `confirmButton` name regex | Actual hook is `finish` | `getByTestId('finish')` |
| `ProductDetailPage` — `getByText(/in stock/i)` | No in-stock hook | Absence of `out-of-stock` + enabled `add-to-cart` |
| `InvoicesPage` — `[data-test="invoice-row"]` | Not found in live DOM | Pending G1 |

---

## 18. Inspection artifacts

| File | Contents |
|------|----------|
| `PrismStructure/selector-inspection-summary.json` | Condensed per-page `data-test` inventory |
| `PrismStructure/inspect-dom-alt-output.json` | Full first-pass DOM dump |
| `PrismStructure/scripts/inspect-dom-cart-output.json` | Cart/checkout/category/search/error capture |
| `PrismStructure/scripts/inspect-dom-alt.js` | Reusable inspector script |
| `PrismStructure/scripts/inspect-dom-cart.js` | Cart/checkout-focused inspector |

---

*Document version: 1.0 — selectors reflect live DOM as of inspection date; re-verify after SUT upgrades or database reseeds.*
