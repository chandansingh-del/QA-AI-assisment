# Requirements and Risk Analysis

**Application:** Practice Software Testing Toolshop v5.0  
**UI:** https://practicesoftwaretesting.com/  
**API:** https://api.practicesoftwaretesting.com/api/documentation

---

## 1. Scope

### In Scope (Core)

- [ ] AC1 — User registration, login, profile verification (UI)
- [ ] AC2 — Browse, cart, checkout (COD), invoice under My Invoices (UI)
- [ ] AC1 — Register, login, bearer token, create cart (API)
- [ ] AC2 — Products, add to cart, verify cart, generate invoice (API)

### Out of Scope (Initial)

- Admin PIM and reporting dashboards
- Social OAuth and TOTP (unless stretch)
- All payment methods beyond Cash on Delivery (core)

---

## 2. Functional Requirements

| ID | Requirement | Priority | Traceability |
|----|-------------|----------|--------------|
| FR-01 | User can register with valid details | High | AC1 UI |
| FR-02 | User can login and view profile | High | AC1 UI |
| FR-03 | User can browse and add products to cart | High | AC2 UI |
| FR-04 | User can update cart quantity | High | AC2 UI |
| FR-05 | User can checkout with Cash on Delivery | Critical | AC2 UI |
| FR-06 | User can view generated invoice | Critical | AC2 UI |
| FR-07 | API: auth + cart lifecycle | High | AC1 API |
| FR-08 | API: product selection + invoice | High | AC2 API |

---

## 3. Risk Analysis

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R-01 | Double-confirm required for invoice (UI) | High | High | Click confirm twice; document in tests |
| R-02 | Shared public environment data pollution | High | Medium | Unique test data per run |
| R-03 | Out-of-stock products break cart tests | Medium | High | Verify `in_stock` before add-to-cart |
| R-04 | JWT token expiry during API chains | Medium | Medium | Refresh or re-login in fixtures |
| R-05 | Cart reuse after invoicing | Medium | High | Create fresh cart per test |

---

## 4. Test Objectives

_[To be completed after requirement walkthrough of live application and OpenAPI spec.]_

---

## 5. Assumptions

- Public hosted SUT is available and stable
- OpenAPI documentation matches deployed API behavior
- Seeded test accounts documented in assessment guide remain valid
