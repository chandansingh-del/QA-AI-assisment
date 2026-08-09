# API Tests

Import fixtures from `../../fixtures`.

```javascript
const { test, expect } = require('../../fixtures');

test('example @smoke', async ({ authenticatedApi }) => {
  const { cartId } = await authenticatedApi.cartApi.createCart();
  expect(cartId).toBeTruthy();
});
```

## Service classes (`api/`)

| Class | Responsibility |
|-------|----------------|
| `AuthApi` | `POST /users/login`, `GET /users/refresh`, `loginAndGetToken()` |
| `UsersApi` | `POST /users/register`, `GET /users/me`, `GET /users/logout` |
| `ProductsApi` | `GET /products`, `/products/search`, `/products/{id}` |
| `CartApi` | `POST /carts`, add/update/remove items, `GET /carts/{id}` |
| `InvoiceApi` | `POST /invoices`, `GET /invoices`, `GET /invoices/{id}` |
| `PaymentApi` | `POST /payment/check` |

All services return `ApiResponse` wrappers. Pass `{ expectedStatus: 422 }` for negative tests.
Payloads live in `test-data/testData.js` — not in service methods.

## Fixtures

- `authApi`, `usersApi`, `productsApi`, `cartApi`, `invoiceApi`, `paymentApi` — unauthenticated clients
- `authenticatedApi` — seeded customer session with token + authed clients

## Smoke specs (`tests/api/smoke/`)

| File | Maps to | Coverage |
|------|---------|----------|
| `auth-registration-cart.spec.js` | TC-API-001, SC-09, SC-11 | Register → login → bearer token → `GET /users/me` → create & verify cart |
| `invoice-lifecycle.spec.js` | TC-API-002, SC-10 | Products → cart → verify → payment check → invoice → list & detail |

Run smoke:

```bash
npx playwright test --project api --grep @smoke
```

## Regression specs (`tests/api/regression/`)

| File | Maps to | Coverage |
|------|---------|----------|
| `auth-negative.spec.js` | TC-API-003, SC-04, SC-12 | Wrong password 401; `GET /users/me` without/invalid token 401; `POST /invoices` without token 401 |
| `registration-negative.spec.js` | TC-API-004, SC-13, SC-05 | Weak password 422; duplicate email 409; missing email 422 |
| `cart-product-negative.spec.js` | TC-API-005, SC-14 (API) | Invalid/missing `product_id` 422; qty 0/-1 422; unknown cart/product 404 |
| `invoice-negative.spec.js` | TC-API-006, SC-12 | Unauthenticated invoice 401; missing billing/payment fields 422; invalid `cart_id` 404 |

Run regression:

```bash
npx playwright test --project api --grep @regression
```

Run all API tests:

```bash
npx playwright test --project api
```

## Connectivity check

```bash
node scripts/api-connectivity-check.js
```
