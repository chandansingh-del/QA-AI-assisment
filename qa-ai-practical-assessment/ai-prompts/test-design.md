# AI Prompts – Test Design

Prompt history for scenario design, manual test cases, smoke/regression classification, coverage review, traceability, and UI test mapping for the Practice Software Testing Toolshop assessment.

**SUT:** https://practicesoftwaretesting.com/  
**Primary artifacts:** `FunctionalTestCase.csv`, `requirements/test-strategy.md`, `requirements/ui-selector-strategy.md`, `PrismStructure/tests/ui/`

---

## Prompt 1

### Prompt
Act as a senior exploratory QA engineer. Analyze Toolshop user journeys (auth, browse/search/filter, cart, checkout, COD, invoice, My Invoices, session/logout, validations, negatives, edge cases). Categorize flows as Smoke or Regression. Treat invoice **double-confirm** as explicit. Do not create automation.

### AI Response Summary
Produced `requirements/toolshop-flow-analysis.md` with:
- P0–P3 risk priority matrix (purchase + auth = P0; double-confirm = high automation risk)
- Eight main journeys (J1–J8) tagged smoke or regression
- Negative scenarios (invalid login, weak password, duplicate email, empty cart, OOS, single-confirm trap)
- Verification legend: live API checks vs UI items needing manual confirmation
- Explicit note that UI invoice requires **Confirm clicked twice**

### Validation Notes
AI verified some API behaviors (e.g. invalid login → 401, unauthenticated invoice → 401, cart without login). UI checkout/confirm steps marked as requiring manual confirmation. No manual UI walkthrough is recorded in this conversation.

### Changes Made
Accepted flow analysis as the basis for scenario IDs (SC-01 … SC-14) and smoke/regression tags used in later design.

### Reason
Exploratory analysis identified high-risk flows and the double-confirm rule before committing to the 8-case manual limit.

---

## Prompt 2

### Prompt
Create a practical QA test strategy from requirement and flow analysis. Define scope, smoke/regression suites, positive/negative/boundary approach, and traceability (Requirement → Scenario → Manual/UI/API TC). Optimize for ~5–8 cases per tier with minimum duplication. Do not write automation code.

### AI Response Summary
Created `requirements/test-strategy.md` with:
- **Tier split:** Manual (UX + double-confirm proof), UI (E2E journeys), API (lifecycle + contract negatives)
- **Smoke:** SC-01 (AC1), SC-02/03 (AC2 purchase path), SC-09/10/11 (API lifecycle)
- **Regression:** SC-04 (invalid login), SC-05 (registration validation), SC-06 (single confirm), SC-08 (empty cart), SC-12–14 (API negatives)
- **Anti-duplication rules:**
  - SC-07 product search → **manual-only** (save UI/API slots)
  - SC-06 single-confirm → **manual + UI only** (not API-testable)
  - Same scenario ID across tiers with tier-specific assertions, not duplicate step lists
- Traceability registers: REQ-* → SC-* → TC-MAN / TC-UI / TC-API placeholders

### Validation Notes
Strategy is internally consistent with `requirement-risk-analysis.md`. Subsequent prompts referenced it as the approved strategy. The placeholder traceability matrix in Section 19 does not exactly match the final `FunctionalTestCase.csv` IDs (see Prompt 4); the CSV became the authoritative manual mapping.

### Changes Made
Accepted tier responsibilities and anti-duplication rules. Used SC-IDs in all later test design and spec headers.

### Reason
A single strategy prevents copying the same E2E purchase flow into manual, UI, and API tiers within the assessment case cap.

---

## Prompt 3

### Prompt
Create a compact manual test suite (max 8 cases) covering registration, login, browse/search, product detail, multi-product cart, quantity update, COD checkout, invoice, My Invoices, and efficient negatives. Include full CSV columns, realistic data, and explicit double-confirm steps. Output `FunctionalTestCase.csv`.

### AI Response Summary
Authored eight manual cases:

| TC ID | Scenario | Type | Tag |
|-------|----------|------|-----|
| TC-MAN-001 | SC-01: Registration + login + profile (AC1) | Positive | @smoke |
| TC-MAN-002 | SC-02/03: Full E2E COD purchase incl. browse, search, cart, qty, **double-confirm**, My Invoices | Positive | @smoke |
| TC-MAN-003 | SC-04: Invalid login | Negative | @regression |
| TC-MAN-004 | SC-05: Weak password + duplicate email (combined) | Negative/boundary | @regression |
| TC-MAN-005 | SC-06: Single Confirm does **not** create invoice | Negative | @regression |
| TC-MAN-006 | SC-08: Empty cart checkout blocked | Negative | @regression |
| TC-MAN-007 | SC-14: Out-of-stock add-to-cart blocked | Negative | @regression |
| TC-MAN-008 | SC-04 (session): Logout clears session | Negative | @regression |

**Design choice:** TC-MAN-002 combines many AC2 steps into one P0 smoke case instead of separate cases for search, browse, cart, and checkout.

### Validation Notes
All cases left at status **Not Executed** in `FunctionalTestCase.csv`. No manual execution evidence is recorded in this conversation.

### Changes Made
Accepted the 8-case suite and combined-flow approach for TC-MAN-002.

### Reason
Maximizes AC1 + AC2 + double-confirm coverage while reserving six regression slots for auth, registration, confirm trap, cart guard, OOS, and session risks.

---

## Prompt 4

### Prompt
Review `FunctionalTestCase.csv` as a senior QA reviewer (traceability, coverage, smoke/regression, duplication, test data, expected results, automation suitability). Document issues and recommend changes. Update CSV only after review. Do not exceed 8 cases.

### AI Response Summary
Overall verdict: suite well-structured for the limit; **targeted fixes only** (not a full rewrite). Issues identified and addressed:

| TC ID | Issue | Change applied |
|-------|-------|----------------|
| TC-MAN-001 | Ambiguous unique email pattern | Changed to `manual.reg.{YYYYMMDDhhmm}@example.com` with precondition that email must not exist |
| TC-MAN-002 | Weak preconditions / expected results; double-confirm not explicit enough | Added in-stock precondition; explicit steps 13–14 for two Confirm clicks; postcode lookup note for TG/1234AA |
| TC-MAN-002 vs TC-MAN-005 | Overlap risk on single-confirm assertion in smoke expected results | Clarified TC-MAN-005 as authoritative negative with baseline invoice count + screenshot evidence path |
| TC-MAN-005 | Missing execution evidence guidance | Added baseline invoice count before checkout and `execution-evidence/manual/` screenshot note |
| TC-MAN-008 | Traceability label unclear | Scenario label clarified as session/logout under SC-04 |

**Not changed (accepted gaps):**
- Boundary coverage remains partial (weak password only; no standalone pagination/name-length cases)
- TC-MAN-007 (OOS) kept manual-only in strategy; no new case added
- Case count stayed at 8

### Validation Notes
Review was performed by AI against the 12 review criteria. CSV was updated in-repo. Manual re-run of revised cases is not documented.

### Changes Made
Accepted targeted CSV edits. Rejected a full rewrite or adding a ninth case.

### Reason
Incremental review improved traceability and test data without breaking the assessment constraint or duplicating the single-confirm negative across smoke and regression assertions.

---

## Prompt 5

### Prompt
Inspect live Toolshop DOM and identify stable selectors for `FunctionalTestCase.csv` flows. Prioritize `data-testid`, roles, labels; avoid fragile CSS. Create `requirements/ui-selector-strategy.md`. Report elements that cannot be reliably identified.

### AI Response Summary
Ran Playwright DOM inspection scripts and produced `requirements/ui-selector-strategy.md`:
- **Key finding:** SUT uses `data-test`, **not** `data-testid` → configure `testIdAttribute: 'data-test'`
- Mapped selectors per manual TC (auth, browse, cart, checkout, invoices)
- Documented behaviors affecting test design: `/cart` redirects when empty; Confirm button is `data-test="finish"`; search only on home page
- **Gaps reported (not invented):**
  - Invoice list rows lack `data-test` → fallback to `table tbody tr` + billing street text
  - Invoice detail has no `page-title` with INV number → use `textbox` labels (Invoice Number, Street, City, State)
  - Duplicate-email registration shows plain text, **no** `email-error` hook
  - `getByLabel(/password/i)` on login matches Forgot Password link — rejected as primary selector

### Validation Notes
Selectors derived from live DOM capture (`selector-inspection-summary.json`, `inspect-dom-cart-output.json`). Playwright UI specs later confirmed some gaps (invoice detail assertions, duplicate-email message).

### Changes Made
- **Accepted:** `data-test` as primary locator strategy; `testIdAttribute` in config
- **Rejected:** Assuming `data-testid` exists; using `email-error` for duplicate registration; using `getByLabel(/password/i)` on login
- **Modified:** Invoice verification design to use table row filters and labeled textbox assertions instead of `page-title`

### Reason
Test design must match actual SUT instrumentation; reporting gaps avoids brittle invented selectors.

---

## Prompt 6

### Prompt
Implement UI Smoke suite (max 4 tests) from approved Page Objects and `FunctionalTestCase.csv`: registration/login, browse/search, cart + quantity, checkout + invoice with double-confirm. Tag `@smoke`, independent tests, meaningful assertions. Run suite and fix automation issues without weakening assertions.

### AI Response Summary
Implemented four smoke specs under `tests/ui/smoke/`:

| UI TC | Spec | Maps to | Coverage |
|-------|------|---------|----------|
| TC-UI-SMOKE-001 | `registration-login-profile.spec.js` | TC-MAN-001 / SC-01 | Register → login → profile |
| TC-UI-SMOKE-002 | `product-browse-search.spec.js` | TC-MAN-002 (steps 2–4) | Category browse + home search |
| TC-UI-SMOKE-003 | `cart-quantity-update.spec.js` | TC-MAN-002 (cart/qty) | Multi-item cart + quantity update |
| TC-UI-SMOKE-004 | `checkout-invoice.spec.js` | TC-MAN-002 (steps 9–17) / SC-02 | COD checkout, **confirmOrderTwice()**, My Invoices |

**Smoke/regression decision:** Split manual TC-MAN-002 into three UI smoke tests plus checkout, rather than one monolithic UI spec—keeps failures diagnosable while staying within the 4-test cap.

**Test-data decision:** Checkout smoke uses seeded customer + assessment billing (`buildCheckoutBillingUi()` + postcode lookup house number), not a freshly registered user—modified from an initial implementation that registered a new user for checkout.

### Validation Notes
Playwright runs recorded in conversation:
- After initial implementation: **3/4 passing**; `checkout-invoice.spec.js` failed on billing/invoice binding
- After later fixes: **checkout-invoice passed** (single-test rerun documented)
- Full UI suite rerun was attempted but interrupted; not all results recorded in conversation

### Changes Made
- **Accepted:** 4-test smoke split and `confirmOrderTwice()` as shared double-confirm pattern
- **Modified:** Checkout test data from new-user billing to seeded customer + `ensureCustomerBillingProfile()`
- **Modified:** Invoice detail assertions from `page-title` to `invoiceNumberField` and billing textbox locators (per selector gap findings)
- **Rejected:** Weakening invoice POST failure handling; arbitrary `waitForTimeout` fixes

### Reason
Smoke must prove AC1 and AC2 paths independently; checkout needed stable billing data and assertions aligned to actual invoice detail DOM.

---

## Prompt 7

### Prompt
Implement UI Regression suite (max 4 additional tests) from `FunctionalTestCase.csv`, covering negatives not in smoke: validation, cart/checkout guards, invoice behavior, session/logout. Tag `@regression`, no smoke duplication. Run all UI tests and report results.

### AI Response Summary
Implemented four regression specs under `tests/ui/regression/`:

| UI TC | Spec | Maps to | Coverage |
|-------|------|---------|----------|
| TC-UI-REG-001 | `invalid-login.spec.js` | TC-MAN-003 / SC-04 | Wrong password; profile route protected |
| TC-UI-REG-002 | `registration-validation.spec.js` | TC-MAN-004 / SC-05 | Weak password + duplicate email blocked |
| TC-UI-REG-003 | `single-confirm-no-invoice.spec.js` | TC-MAN-005 / SC-06 | One Confirm → no `POST /invoices`; invoice count unchanged |
| TC-UI-REG-004 | `empty-cart-checkout.spec.js` | TC-MAN-006 / SC-08 | Empty cart cannot proceed to checkout |

**Deferred from UI automation (per strategy + slot limit):**

| Manual TC | Scenario | UI automation decision |
|-----------|----------|------------------------|
| TC-MAN-007 | OOS add-to-cart | **Not automated in UI** — manual + optional API (SC-14) per strategy |
| TC-MAN-008 | Logout / session | **Not automated in UI** — no fourth regression slot remaining; session/logout listed in prompt but deprioritized vs P0 negatives |
| SC-07 | Dedicated product search regression | **Not automated** — partial search covered in smoke-002; strategy marked SC-07 manual-only |

**Registration regression fix:** Duplicate-email assertion uses `getByText(/customer with this email address already exists/i)` because SUT has no `email-error` `data-test` hook—AI's initial `email-error` expectation was **rejected** after DOM/SUT check.

### Validation Notes
Conversation records UI regression implementation followed by fixes for `registration-validation` and checkout billing sync. A reported state of **7/8 UI tests passing** with checkout smoke still failing was later addressed in the debugging session. Full final UI suite pass count for all 8 tests is not consistently recorded in the conversation.

### Changes Made
- **Accepted:** Four regression tests mapping to highest-priority manual negatives (login, registration, single-confirm, empty cart)
- **Rejected:** Adding UI tests for OOS (TC-MAN-007) and logout (TC-MAN-008) within the 4-regression cap
- **Rejected:** `email-error` locator for duplicate email; replaced with visible plain-text message locator on `RegisterPage`
- **Modified:** `single-confirm-no-invoice` monitors `POST /invoices` count rather than duplicating full checkout smoke assertions

### Reason
Regression slots target P0/P1 guards (auth, confirm trap, empty cart) that smoke intentionally does not re-test; OOS and session remain manual coverage within the 8-case design.

---

## Traceability Summary (As Implemented)

```
REQ-AC1-UI  → SC-01  → TC-MAN-001  → TC-UI-SMOKE-001
REQ-AC2-UI  → SC-02  → TC-MAN-002  → TC-UI-SMOKE-002, 003, 004
REQ-AC2-UI  → SC-03  → (embedded in TC-MAN-002 / TC-UI-SMOKE-003)
REQ-CONFIRM → SC-06  → TC-MAN-005  → TC-UI-REG-003
REQ-NEG     → SC-04  → TC-MAN-003  → TC-UI-REG-001
REQ-NEG     → SC-05  → TC-MAN-004  → TC-UI-REG-002
REQ-NEG     → SC-08  → TC-MAN-006  → TC-UI-REG-004
REQ-NEG     → SC-14  → TC-MAN-007  → (manual only)
REQ-NEG     → session → TC-MAN-008  → (manual only)
SC-07 search → TC-MAN-002 (manual steps) + partial TC-UI-SMOKE-002 → no dedicated UI regression
```

## Smoke vs Regression Decisions (Cross-Cutting)

| Decision | Rationale |
|----------|-----------|
| 2 manual smoke + 6 manual regression | AC1/AC2 positives in smoke; negatives efficient in regression |
| 4 UI smoke + 4 UI regression | Assessment per-tier caps; mirrors manual risk priorities |
| TC-MAN-002 split across 3 UI smoke specs | Isolates browse, cart, and checkout failures |
| Single-confirm only in regression (TC-MAN-005 / TC-UI-REG-003) | Authoritative negative; smoke must prove double-confirm succeeds |
| Search not a standalone UI regression | SC-07 manual-only per strategy; browse+search partially in smoke-002 |

## Items Outside This Document

- API smoke/regression test design → `ai-prompts/automation-and-debugging.md`, `requirements/api-analysis.md`
- Test data builders → `ai-prompts/test-data.md`
- Checkout invoice automation debugging → `ai-prompts/automation-and-debugging.md`
