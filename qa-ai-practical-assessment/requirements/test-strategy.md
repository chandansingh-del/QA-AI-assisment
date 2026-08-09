# QA Test Strategy — Practice Software Testing Toolshop

**Version:** 1.0  
**Date:** 2026-08-09  
**Based on:** `requirement-risk-analysis.md`, `toolshop-flow-analysis.md`, QA Practical Assessment PDF

**SUT:** https://practicesoftwaretesting.com/  
**API:** https://api.practicesoftwaretesting.com/api/documentation

---

## Strategy Summary

This strategy optimizes for **maximum coverage with minimum duplication** within the assessment constraint of **5–8 test cases per tier** (manual, UI, API). Each tier has a distinct responsibility:

| Tier | Primary Role | Why Separate |
|------|--------------|--------------|
| **Manual** | Exploratory depth, UI validation messages, double-confirm behavior proof | Human observation of UX and wording |
| **UI Automation** | End-to-end user journeys through the browser | Proves integrated UI flows including double-confirm |
| **API Automation** | Contract and lifecycle speed; auth/state negatives | Validates backend without browser overhead |

**Design principle:** One scenario should not be copy-pasted across all three tiers. Map each scenario to the tier where it adds the most value.

---

## 1. Test Scope

### In Scope

| Area | Coverage |
|------|----------|
| **UI AC1** | Registration, login, profile verification |
| **UI AC2** | Browse products, multi-item cart, quantity update, COD checkout, double-confirm invoice, My Invoices |
| **API AC1** | Register, login, bearer token, create cart |
| **API AC2** | Get products, add to cart, verify cart, generate invoice (COD) |
| **Smoke / Regression** | All in-scope flows categorized and tagged `@smoke` or `@regression` |
| **Positive, negative, boundary** | Distributed across tiers per sections 10–12 |
| **Invoice double-confirm** | Explicit validation in manual + UI; API validates invoice creation separately |
| **Test data strategy** | Documented; env-based credentials; runtime product selection |
| **Execution evidence** | Reports, screenshots, logs |
| **Traceability** | Requirement → Scenario → Manual / UI / API TC (see Section 19) |

### Test Count Target (per assessment)

| Tier | Target Count | Tags |
|------|--------------|------|
| Manual | 6–7 | Mix of `@smoke` and `@regression` |
| UI automation | 6–7 | Mix of `@smoke` and `@regression` |
| API automation | 6–7 | Mix of `@smoke` and `@regression` |

---

## 2. Out of Scope

| Item | Reason |
|------|--------|
| Admin PIM (`/admin/*`) | Not in assessment AC examples; Sprint 5 admin is stretch |
| Reporting dashboards | Not in core AC |
| TOTP / social OAuth | Not in assessment AC examples |
| All 5 payment methods | AC2 specifies COD only; other methods are stretch |
| Guest checkout UI E2E | API guest invoice exists; not in UI AC2 |
| Mobile app | Separate artifact; shares v4 environment per official README |
| Performance / load testing | Not required by assessment |
| Cross-browser matrix (full) | Chromium primary; others optional spot-check |
| PDF download E2E | API supports it; low priority within 5–8 API limit |
| Invoice status admin transitions | State machine noted in assessment; cover minimally via API if slot available |
| Buggy variant (`with-bugs.practicesoftwaretesting.com`) | Not the primary SUT |
| Invoice/product **comment** flows (core AC list item) | Deferred — no case slot after P0 purchase, auth, and double-confirm coverage; not in UI/API AC examples |

---

## 3. Test Objectives

| ID | Objective | Source |
|----|-----------|--------|
| OBJ-01 | Verify a new user can register, login, and view profile (UI AC1) | Assessment Part B |
| OBJ-02 | Verify end-to-end purchase with COD, quantity update, and invoice in My Invoices (UI AC2) | Assessment Part B |
| OBJ-03 | Verify API auth lifecycle: register → login → token → cart (API AC1) | Assessment Part B |
| OBJ-04 | Verify API purchase lifecycle: products → cart → invoice (API AC2) | Assessment Part B |
| OBJ-05 | Validate double-confirm invoice behavior on UI | Assessment SUT note |
| OBJ-06 | Demonstrate traceability from requirements to test artifacts | Core Acceptance Criteria |
| OBJ-07 | Cover positive, negative, and boundary conditions without tier duplication | Assessment + flow analysis |
| OBJ-08 | Produce runnable automation (smoke + regression) executable from README | Assessment deliverable |
| OBJ-09 | All executed tests pass with documented evidence | What Counts as Complete |
| OBJ-10 | Show thoughtful AI-assisted workflow via prompt history | Part A (30%) |

---

## 4. Risk-Based Priorities

| Priority | Risk | Test Response |
|----------|------|---------------|
| **P0** | Checkout / invoice failure (incl. single-confirm trap) | UI smoke E2E + manual double-confirm proof + API invoice creation |
| **P0** | Auth failure blocks all purchase paths | UI login smoke + API auth smoke + manual/API invalid login regression |
| **P1** | Cart quantity / multi-item errors | Embedded in UI AC2 smoke; API cart verify step |
| **P1** | Out-of-stock product in cart | One regression case (manual or API — not both) |
| **P2** | Registration validation gaps | Manual regression (UI messages) + API 422 regression |
| **P2** | Catalog discovery (search/sort) | One manual or UI regression — not duplicated in API |
| **P3** | Contact, favorites, rental | Defer unless spare case slot after core |

---

## 5. Manual Testing Approach

### Purpose

Manual testing provides **human-verified evidence** for UI wording, visual state, and the double-confirm behavior that automation may abstract away.

### Method

1. **Scenario-based execution** documented in `FunctionalTestCase.csv`
2. **Exploratory charter** for first pass on catalog/search (30 min max — feed into case design, not separate cases)
3. **Evidence capture:** screenshot per critical step; attach to `execution-evidence/`
4. **Status tracking:** Pass/Fail/Blocked in CSV

### Manual Tier Responsibilities (unique value)

| Responsibility | Why Not Automate First |
|----------------|------------------------|
| Validation message exact wording | Assessment expects human review of AI-generated cases |
| Double-confirm intermediate UI state after 1st click | Needs observation before automating |
| Profile field display after registration | AC1 human verification |
| Empty cart checkout UX | Quick manual negative |

### Manual Case Budget (recommended 7)

| Slot | Scenario ID | Focus | Tag |
|------|-------------|-------|-----|
| 1 | SC-01 | Register → login → verify profile | @smoke |
| 2 | SC-02 | Full COD purchase → double confirm → My Invoices | @smoke |
| 3 | SC-03 | Update cart quantity (multi-item) | @smoke |
| 4 | SC-04 | Invalid login error message | @regression |
| 5 | SC-05 | Registration weak password / duplicate email validation | @regression |
| 6 | SC-06 | Single Confirm — invoice NOT created | @regression |
| 7 | SC-07 | Search products + verify results | @regression |

> Individual test case rows will be written in `FunctionalTestCase.csv` in a later phase.

---

## 6. UI Automation Approach

### Framework

- **Playwright** (JavaScript) with **Prism-style** Page Object Model
- Location: `PrismStructure/tests/ui/`
- Tags: `@smoke`, `@regression` in test title or grep filter

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| Thin specs | Assertions and flow in spec; selectors/actions in `pages/` |
| Fixtures | `authenticatedCustomer` fixture for purchase flows |
| No credential hardcoding | Load from `.env` |
| Double-confirm helper | `confirmOrderTwice()` page method — single source of truth |
| Stable products | Resolve in-stock product at runtime via API helper or fixed seed |
| Independent tests | Each test creates own cart/session where possible |

### UI Tier Responsibilities

| Responsibility | Rationale |
|----------------|-----------|
| E2E AC2 smoke (login → cart → COD → confirm ×2 → invoices) | Assessment core; browser-only integration |
| AC1 smoke (register → login → profile) | UI AC1 |
| Regression: invalid login | UI error handling |
| Regression: single confirm failure | P0 risk — UI-specific |
| Regression: empty cart checkout | UI guard behavior |

### UI Case Budget (recommended 6)

| Slot | Scenario ID | Focus | Tag |
|------|-------------|-------|-----|
| 1 | SC-02 | E2E COD purchase with double confirm | @smoke |
| 2 | SC-01 | Register + login + profile visible | @smoke |
| 3 | SC-03 | Multi-item cart + quantity update | @smoke |
| 4 | SC-04 | Invalid login shows error / stays on login | @regression |
| 5 | SC-06 | Single confirm — no invoice in My Invoices | @regression |
| 6 | SC-08 | Empty cart — checkout blocked or redirected | @regression |

### What UI Automation Does NOT Cover (delegated)

- API-only 401/422 contract details → API tier
- Validation message exact text review → Manual tier
- Invoice payload field-level API contract → API tier

---

## 7. API Automation Approach

### Framework

- Playwright **`request`** fixture (same project, `PrismStructure/tests/api/`)
- Base URL: `process.env.API_BASE_URL`
- Auth: Bearer token from `POST /users/login`

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| Lifecycle chains | Single smoke test can chain register → login → cart → invoice |
| Fresh data | Unique email per register test; new cart per run |
| Assert body + status | Not status code alone |
| Documented endpoints only | OpenAPI v5.0 — no invented routes |
| Separate smoke/regression files or tags | `auth.spec.js`, `checkout.spec.js` |

### API Tier Responsibilities

| Responsibility | Rationale |
|----------------|-----------|
| API AC1 + AC2 smoke lifecycle | Fast, reliable core path |
| 401 without token on invoice | API negative — not worth UI |
| 422 invalid registration | API contract validation |
| Cart verify before invoice | AC2 explicit step |
| Invalid login 401 | Quick API regression |

### API Case Budget (recommended 6)

| Slot | Scenario ID | Focus | Tag |
|------|-------------|-------|-----|
| 1 | SC-09 | Register → login → token → create cart | @smoke |
| 2 | SC-10 | Products → add to cart → verify cart → COD invoice | @smoke |
| 3 | SC-11 | GET /users/me with valid token | @smoke |
| 4 | SC-04 | Login with invalid credentials → 401 | @regression |
| 5 | SC-12 | POST /invoices without auth → 401 | @regression |
| 6 | SC-13 | Register with weak password → 422 | @regression |

### Optional 7th API Case (if slot available)

| Slot | Scenario ID | Focus | Tag |
|------|-------------|-------|-----|
| 7 | SC-14 | Add out-of-stock product → expected error | @regression |

---

## 8. Smoke Suite

**Purpose:** Prove the application is **healthy enough to release-test** — critical paths work.

**When to run:** Every commit, before regression, before submission.

### Smoke Scenarios (cross-tier)

| Scenario ID | Description | Manual | UI Auto | API Auto |
|-------------|-------------|:------:|:-------:|:--------:|
| SC-01 | Register / login / profile (AC1) | ✓ | ✓ | partial¹ |
| SC-02 | E2E COD purchase + double confirm + My Invoices (AC2) | ✓ | ✓ | — |
| SC-03 | Multi-item cart + quantity update | ✓ | ✓ | partial² |
| SC-09 | API register → login → token → cart (AC1) | — | — | ✓ |
| SC-10 | API products → cart → verify → invoice (AC2) | — | — | ✓ |
| SC-11 | GET /users/me authenticated | — | — | ✓ |

¹ API smoke covers register/login/cart; profile via `GET /users/me` in SC-11.  
² API smoke SC-10 includes quantity in add-to-cart payload.

### Smoke Execution Order

```
1. API smoke (fast feedback, ~2 min)
2. UI smoke (E2E, ~5–8 min)
3. Manual smoke (confirm double-confirm UX, capture evidence)
```

### Run Commands (to implement in README)

```bash
npm run test:smoke          # UI + API
npm run test:api -- --grep @smoke
npm run test:ui -- --grep @smoke
```

---

## 9. Regression Suite

**Purpose:** Validate **negative paths, guards, and secondary flows** without re-running full E2E smoke.

### Regression Scenarios (cross-tier)

| Scenario ID | Description | Manual | UI Auto | API Auto |
|-------------|-------------|:------:|:-------:|:--------:|
| SC-04 | Invalid login | ✓ | ✓ | ✓ |
| SC-05 | Registration validation (weak pwd / duplicate) | ✓ | — | partial³ |
| SC-06 | Single Confirm — no invoice | ✓ | ✓ | — |
| SC-07 | Product search | ✓ | — | — |
| SC-08 | Empty cart checkout | — | ✓ | — |
| SC-12 | Invoice without auth token | — | — | ✓ |
| SC-13 | Register weak password API 422 | — | — | ✓ |
| SC-14 | Out-of-stock add to cart (optional) | — | — | ✓ |

³ Manual covers UI messages for duplicate email; API SC-13 covers weak password 422.

### Regression Design — Avoid Duplication

| Rule | Example |
|------|---------|
| Same negative on UI **and** API only if both layers add value | Invalid login: UI checks message; API checks 401 |
| Do **not** automate E2E purchase as regression | Already in smoke |
| Manual-only for search UX | SC-07 not in UI/API unless slot spare |
| UI-only for single-confirm | Cannot test via API alone |

---

## 10. Positive Testing

| Area | Positive Coverage | Primary Tier |
|------|-------------------|--------------|
| Registration with valid data | SC-01 | Manual + UI |
| Login with seeded customer | SC-02 (returning user path) | UI smoke |
| Product browse and add to cart | SC-02, SC-03 | UI + Manual |
| Quantity update | SC-03 | UI + Manual |
| COD payment | SC-02 | UI + Manual |
| Double confirm → invoice | SC-02 | UI + Manual |
| Invoice in My Invoices | SC-02 | UI + Manual |
| API full lifecycle | SC-09, SC-10 | API |
| Profile data visible | SC-01 | Manual + UI |
| Payment check COD success | Part of API SC-10 | API |

---

## 11. Negative Testing

| Negative Case | Scenario ID | Tier (one primary) |
|---------------|-------------|-------------------|
| Invalid login credentials | SC-04 | Manual + UI + API (justified: different assertions) |
| Weak password registration | SC-05 / SC-13 | Manual (UI msg) + API (422) |
| Duplicate email registration | SC-05 | Manual |
| Invoice without authentication | SC-12 | API |
| Empty cart checkout | SC-08 | UI |
| Single confirm (no invoice) | SC-06 | Manual + UI |
| Out-of-stock product | SC-14 | API (optional) |

**Anti-duplication rule:** Do not write three separate cases for "invalid login" with identical steps — same scenario ID, tier-specific assertions.

---

## 12. Boundary Testing

| Boundary | Approach | Tier |
|----------|----------|------|
| Cart quantity minimum (1) | Included in SC-03 smoke | UI |
| Multi-item cart (2+ products) | SC-03 smoke | UI + Manual |
| Registration password min length (8) | SC-13 regression | API |
| first_name max 40 chars | Defer unless spare manual slot | Manual |
| Pagination last page | Defer — out of 5–8 limit | — |
| Postcode lookup TG/1234AA | Use in checkout smoke data | UI/API data |

**Strategy:** Boundaries are embedded in smoke/regression scenarios, not standalone cases, to stay within count limits.

---

## 13. Test Data Strategy

### Environment

| Variable | Value | Source |
|----------|-------|--------|
| `BASE_URL` | `https://practicesoftwaretesting.com` | Assessment |
| `API_BASE_URL` | `https://api.practicesoftwaretesting.com` | Assessment |
| `CUSTOMER_EMAIL` | Seeded customer email | Official README |
| `CUSTOMER_PASSWORD` | Seeded password | Official README — load via `.env` |

### Data Rules

| Rule | Detail |
|------|--------|
| **Unique registration emails** | `testuser+{timestamp}@example.com` — avoids 409 on shared environment |
| **In-stock products** | Select at runtime: `GET /products` → filter `in_stock: true` |
| **Avoid OOS in smoke** | Long Nose Pliers verified out-of-stock — use only in SC-14 |
| **Fresh cart per test** | `POST /carts` per API test; UI test clears cart or uses new session |
| **Billing address (COD)** | Use assessment example fields: Zoey Shore, Hesselbury, Florida, TG, 1234AA |
| **Invoice payload** | `payment_method: "cash-on-delivery"`, `payment_details: {}` |
| **Never commit secrets** | `.env` gitignored; `.env.example` with placeholders |

### Data Ownership by Tier

| Data Need | Owner |
|-----------|-------|
| Seeded login (smoke) | UI + API fixtures |
| Dynamic register user | API SC-09; UI SC-01 |
| Product IDs | Shared `test-data/productResolver.js` (future) |
| Billing/invoice payload | Shared `test-data/invoicePayload.js` (future) |

### AI-Assisted Data Generation

- Document prompts in `ai-prompts/test-data.md`
- AI suggests payloads; human validates against OpenAPI before use

---

## 14. Authentication / Session Strategy

### UI Tests

| Pattern | Usage |
|---------|-------|
| **Seeded customer** | Smoke purchase flows (SC-02, SC-03) — faster than register each run |
| **Dynamic registration** | SC-01 smoke — proves AC1 end-to-end |
| **Storage state** | Save auth state after login fixture; reuse in dependent tests |
| **Logout test** | Separate regression if slot allows; clear storage before smoke |

### API Tests

| Pattern | Usage |
|---------|-------|
| **Register + login in test** | SC-09 smoke — self-contained |
| **Token in header** | `Authorization: Bearer {access_token}` for cart/invoice |
| **No token** | SC-12 regression — assert 401 |
| **Token per test** | Do not share token across parallel workers |

### Session Risks

| Risk | Mitigation |
|------|------------|
| JWT expiry (~120 min) | Tests complete in < 5 min; re-login if flaky |
| Shared environment | Unique emails for registration |
| Logged-in state leak between tests | `test.afterEach` logout or isolated context |

---

## 15. Invoice Validation Strategy

### Assessment Requirement

> Press **Confirm twice** to generate invoice.

### Three-Layer Validation

| Layer | What to Validate | Scenario |
|-------|------------------|----------|
| **Manual** | After 1st confirm: no invoice in My Invoices; after 2nd: invoice appears with ID | SC-02, SC-06 |
| **UI Auto** | `confirmOrderTwice()`; assert invoice number visible; navigate to My Invoices; assert new row | SC-02 smoke |
| **UI Auto (negative)** | Single `confirmOnce()`; assert My Invoices count unchanged | SC-06 regression |
| **API Auto** | `POST /invoices` with valid cart + billing; assert `invoice_number`, `invoicelines`, `total` | SC-10 smoke |
| **API Auto (negative)** | `POST /invoices` without token → 401 | SC-12 |

### Invoice Field Assertions (API — SC-10)

| Field | Assertion |
|-------|-----------|
| `invoice_number` | Present; matches pattern `INV-*` |
| `status` | Present |
| `total` | > 0 |
| `invoicelines` | Length matches cart items |
| `invoicelines[].quantity` | Matches cart quantities |
| Billing fields | Match request payload |

### Invoice UI Assertions (SC-02)

| Checkpoint | Assertion |
|------------|-----------|
| After 2nd confirm | Success state / invoice ID displayed |
| My Invoices list | Contains new invoice |
| Invoice detail | Line items and total match cart |

### Cart–Invoice Integrity

- Verify cart contents **before** invoice API call (AC2)
- Do not reuse `cart_id` after invoice created

---

## 16. API-to-UI Relationship

The Toolshop is an **Angular SPA backed by a REST API**. UI actions trigger API calls visible in the network tab.

### Flow Mapping

| UI Action | API Call(s) | Tested In |
|-----------|-------------|-----------|
| Login | `POST /users/login` | UI SC-02; API SC-09 |
| Browse products | `GET /products` | UI smoke; API SC-10 |
| Add to cart | `POST /carts`, `POST /carts/{id}` | UI SC-02/03; API SC-10 |
| Update quantity | `PUT /carts/{id}/product/quantity` | UI SC-03; API SC-10 |
| Payment check | `POST /payment/check` | API SC-10 (optional explicit step) |
| Confirm order | `POST /invoices` | API SC-10; UI SC-02 (via double confirm) |
| My Invoices | `GET /invoices` | UI SC-02; API SC-10 follow-up |
| Register | `POST /users/register` | UI SC-01; API SC-09 |
| Profile | `GET /users/me` | UI SC-01; API SC-11 |

### Tier Split Rationale

```
┌─────────────────────────────────────────────────────────┐
│  UI Tests — "Does the user journey work in browser?"    │
│  • Double confirm behavior                              │
│  • Navigation, visibility, E2E integration              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ same backend
┌─────────────────────────────────────────────────────────┐
│  API Tests — "Does the contract and lifecycle hold?"    │
│  • Status codes, JSON fields, auth boundaries           │
│  • Faster feedback; no browser flakiness                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ human verification
┌─────────────────────────────────────────────────────────┐
│  Manual Tests — "Is the experience correct?"            │
│  • Message wording, exploratory gaps, evidence          │
└─────────────────────────────────────────────────────────┘
```

### Correlation Strategy

- UI smoke SC-02 and API smoke SC-10 cover the **same business outcome** (purchase) at different layers — **not duplication** because UI proves double-confirm and browser integration; API proves contract.
- Do not assert every API field in UI tests.
- Optional: log `invoice_number` from UI and compare format to API pattern.

---

## 17. Execution Strategy

### Phases

| Phase | Activity | Output |
|-------|----------|--------|
| 1 | Manual smoke on live SUT | CSV rows + screenshots |
| 2 | API smoke + regression | Passing API suite |
| 3 | UI smoke + regression | Passing UI suite |
| 4 | Full suite run | Combined report |
| 5 | Evidence packaging | `execution-evidence/` + README update |

### Execution Order

```
API @smoke  →  UI @smoke  →  Manual @smoke
API @regression  →  UI @regression  →  Manual @regression
Full suite (pre-submission gate)
```

### Environment Setup (one-time)

```bash
cd PrismStructure
npm install
npx playwright install chromium
cp .env.example .env   # fill credentials locally
```

### Pre-Submission Gate

- [ ] All manual cases **Passed** in CSV
- [ ] All UI automation **Passed**
- [ ] All API automation **Passed**
- [ ] Execution reports generated
- [ ] Evidence copied to `execution-evidence/`
- [ ] README run commands verified on clean machine mindset

### CI / Local

- Local execution primary (assessment does not mandate CI)
- Optional: GitHub Action for smoke on push — stretch only

---

## 18. Reporting Strategy

### Automation Reports

| Report | Location | When |
|--------|----------|------|
| Playwright HTML report | `PrismStructure/playwright-report/` | After every suite run |
| JSON/list reporter | Console + CI artifact (optional) | During development |
| Trace | `test-results/` on failure | Debug only |

### Manual Reports

| Artifact | Location |
|----------|----------|
| `FunctionalTestCase.csv` | Repo root — Status column |
| Screenshots | `execution-evidence/manual/` |
| Double-confirm proof | `execution-evidence/manual/SC-06-*.png` |

### Evidence Package (submission)

```
execution-evidence/
├── manual/           # Screenshots per scenario
├── playwright-report/  # Copy of final HTML report
└── execution-summary.md  # Date, counts, all Passed
```

### README Documentation (required)

- `npm run test:smoke` / `npm run test:regression` / `npm test`
- `npm run report` → open HTML report
- State: **all test cases must show Passed**

---

## 19. Traceability Structure

### ID Convention

| Level | Prefix | Example |
|-------|--------|---------|
| Requirement | `REQ-` | REQ-AC2 |
| Scenario | `SC-` | SC-02 |
| Manual TC | `TC-MAN-` | TC-MAN-002 |
| UI TC | `TC-UI-` | TC-UI-002 |
| API TC | `TC-API-` | TC-API-002 |

### Requirement Register

| Req ID | Description | Assessment Source |
|--------|-------------|-------------------|
| REQ-AC1-UI | Register, login, verify profile | Part B UI AC1 |
| REQ-AC2-UI | Browse, cart, qty, COD, invoice, My Invoices | Part B UI AC2 |
| REQ-AC1-API | Register, login, token, create cart | Part B API AC1 |
| REQ-AC2-API | Products, cart, verify, invoice | Part B API AC2 |
| REQ-CONFIRM | Double-confirm invoice generation | Part B SUT note |
| REQ-NEG | Negative / error handling | Core Acceptance Criteria |
| REQ-BOUND | Boundary conditions | Part A manual design types |
| REQ-STATE | Valid/invalid status transitions | Core Acceptance Criteria |

### Scenario Register

| Scenario ID | Title | Req IDs | Risk | Tag |
|-------------|-------|---------|------|-----|
| SC-01 | User registration, login, and profile verification | REQ-AC1-UI | P0 | @smoke |
| SC-02 | E2E COD purchase with double confirm and My Invoices | REQ-AC2-UI, REQ-CONFIRM | P0 | @smoke |
| SC-03 | Multi-item cart with quantity update | REQ-AC2-UI | P1 | @smoke |
| SC-04 | Invalid login credentials | REQ-NEG | P1 | @regression |
| SC-05 | Registration validation (weak password / duplicate email) | REQ-NEG | P2 | @regression |
| SC-06 | Single confirm does not generate invoice | REQ-CONFIRM, REQ-NEG | P0 | @regression |
| SC-07 | Product search | REQ-AC2-UI | P2 | @regression |
| SC-08 | Empty cart checkout blocked | REQ-NEG | P1 | @regression |
| SC-09 | API: register, login, token, create cart | REQ-AC1-API | P0 | @smoke |
| SC-10 | API: products, add to cart, verify, COD invoice | REQ-AC2-API | P0 | @smoke |
| SC-11 | API: GET /users/me with valid token | REQ-AC1-API | P1 | @smoke |
| SC-12 | API: invoice without auth returns 401 | REQ-NEG | P1 | @regression |
| SC-13 | API: register weak password returns 422 | REQ-NEG, REQ-BOUND | P2 | @regression |
| SC-14 | API: add out-of-stock product fails | REQ-NEG | P1 | @regression |

### Traceability Matrix (Scenario → Test Tiers)

> **TC IDs are placeholders** — to be assigned when test cases are authored.

| Scenario ID | Manual TC | UI TC | API TC | Notes |
|-------------|-----------|-------|--------|-------|
| SC-01 | TC-MAN-001 | TC-UI-001 | — | API covered by SC-09/SC-11 |
| SC-02 | TC-MAN-002 | TC-UI-002 | — | API covered by SC-10 |
| SC-03 | TC-MAN-003 | TC-UI-003 | — | Qty in SC-10 API chain |
| SC-04 | TC-MAN-004 | TC-UI-004 | TC-API-004 | Same scenario; tier-specific assertions |
| SC-05 | TC-MAN-005 | — | — | API weak pwd → SC-13 |
| SC-06 | TC-MAN-006 | TC-UI-005 | — | UI-only negative for confirm |
| SC-07 | TC-MAN-007 | — | — | Manual-only to save slots |
| SC-08 | — | TC-UI-006 | — | UI guard behavior |
| SC-09 | — | — | TC-API-001 | API AC1 smoke |
| SC-10 | — | — | TC-API-002 | API AC2 smoke |
| SC-11 | — | — | TC-API-003 | Profile via API |
| SC-12 | — | — | TC-API-005 | Auth boundary |
| SC-13 | — | — | TC-API-006 | Validation boundary |
| SC-14 | — | — | TC-API-007 | Optional 7th API case |

### Coverage Summary (target)

| Req ID | Manual | UI | API |
|--------|:------:|:--:|:---:|
| REQ-AC1-UI | ✓ | ✓ | via SC-09/11 |
| REQ-AC2-UI | ✓ | ✓ | via SC-10 |
| REQ-AC1-API | — | — | ✓ |
| REQ-AC2-API | — | — | ✓ |
| REQ-CONFIRM | ✓ | ✓ | — |
| REQ-NEG | ✓ | ✓ | ✓ |
| REQ-BOUND | partial | partial | ✓ |
| REQ-STATE | — | — | defer⁴ |

⁴ Invoice status state machine (`AWAITING_FULFILLMENT` → `COMPLETED`) — include only if a case slot remains after core; otherwise document as known gap in `project-info.md`.

### Traceability Flow Diagram

```
REQ-AC2-UI
    └── SC-02 (E2E COD purchase)
            ├── TC-MAN-002  (manual evidence + double confirm)
            ├── TC-UI-002   (automated E2E)
            └── SC-10 / TC-API-002  (API lifecycle — linked, not duplicate)
```

---

## 20. Assessment Constraints (Quick Reference)

| # | Constraint |
|---|------------|
| 1 | Max **5–8** cases per tier: manual, UI, API |
| 2 | Include `@smoke` and `@regression` tags |
| 3 | All tests **Passed** at submission |
| 4 | COD payment for core flows |
| 5 | **Confirm twice** for UI invoice |
| 6 | Playwright + Prism + Cursor |
| 7 | Runnable from README without manual steps beyond env setup |
| 8 | Iterative git commits and prompt history |
| 9 | Do not sacrifice artifacts for automation breadth |

---

## Document History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-08-09 | Initial strategy from requirement + flow analysis |

**Next steps:** Author individual test cases in `FunctionalTestCase.csv` and Playwright specs mapped to Scenario IDs above.
