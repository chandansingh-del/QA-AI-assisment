# Automation Execution Summary

**Date:** 9 August 2026  
**Environment:** Windows 10, Node.js, Playwright `@playwright/test` ^1.49.0  
**SUT:** https://practicesoftwaretesting.com/ (public shared instance)  
**Working directory:** `PrismStructure/`  
**Worker setting:** `--workers=1` (recommended for shared SUT stability)

---

## Suite Results

| Suite | Command | Tests | Passed | Failed | Skipped | Duration |
|-------|---------|-------|--------|--------|---------|----------|
| UI Smoke | `npm run test:ui:smoke -- --workers=1` | 4 | **4** | 0 | 0 | 1.5 min |
| UI Regression | `npm run test:ui:regression -- --workers=1` | 4 | **4** | 0 | 0 | 43.5 s |
| API Smoke | `npm run test:api:smoke -- --workers=1` | 2 | **2** | 0 | 0 | 12.3 s |
| API Regression | `npm run test:api:regression -- --workers=1` | 4 | **4** | 0 | 0 | 43.3 s |
| **Complete suite** | `npx playwright test --workers=1` | **14** | **14** | **0** | **0** | **3.0 min** |

### Tag filter verification

| Filter | Command | Tests selected | Result |
|--------|---------|----------------|--------|
| `@smoke` (all projects) | `npm run test:smoke -- --workers=1` | 6 (4 UI + 2 API) | **6/6 passed** |
| `@regression` (all projects) | `npm run test:regression -- --workers=1` | 8 (4 UI + 4 API) | **8/8 passed** |

> **Note:** On PowerShell, quote grep patterns: `--grep "@regression"` (unquoted `@regression` is interpreted as a variable).

---

## Failure Classification

**No failures occurred** in this execution review. No test modifications were required.

| Classification | Count | Action taken |
|----------------|-------|--------------|
| Product defect | 0 | — |
| Automation defect | 0 | — |
| Data defect | 0 | — |
| Environment issue | 0 | — |

---

## Quality Checks

| Check | Result | Notes |
|-------|--------|-------|
| Skipped tests | **PASS** | No `test.skip`, `test.fixme`, or `describe.skip` in `tests/` |
| Disabled / focused tests | **PASS** | No `test.only` or `describe.only` |
| Empty / trivial assertions | **PASS** | `toBeTruthy()` used with meaningful context messages on required fields (IDs, tokens, validation bodies) |
| Arbitrary waits in tests/pages | **PASS** | No `waitForTimeout` in `tests/` or `pages/`; only in `scripts/inspect-dom*.js` (DOM inspection tools, not test suite) |
| Duplicate tests | **PASS** | 14 unique specs; TC-MAN-002 split across 3 UI smoke specs by design (not duplicate coverage) |
| Hardcoded secrets in specs | **PASS** | Credentials via `testData.js` + `.env`; no passwords in `tests/**/*.spec.js` |
| `@smoke` tag filter | **PASS** | Selects 6 tests across UI + API |
| `@regression` tag filter | **PASS** | Selects 8 tests across UI + API |
| HTML report generated | **PASS** | `PrismStructure/playwright-report/index.html` present after runs |
| Failure screenshots/traces | **N/A** | All tests passed; config captures screenshot/video on failure and trace on first retry |

---

## Reports and Artifacts

| Artifact | Location | Status |
|----------|----------|--------|
| HTML report | `PrismStructure/playwright-report/` | Generated |
| Last run status | `PrismStructure/test-results/.last-run.json` | `"status": "passed"` |
| Failure screenshots | `PrismStructure/test-results/` | None (all passed) |
| Failure traces | `PrismStructure/test-results/` | None (all passed) |

View report locally:

```bash
cd PrismStructure
npm run report
```

---

## Per-Spec Results (Complete Suite)

### UI — Smoke (4/4)

| Spec | Result | Time |
|------|--------|------|
| `registration-login-profile.spec.js` | PASS | 7.1 s |
| `product-browse-search.spec.js` | PASS | 5.1 s |
| `cart-quantity-update.spec.js` | PASS | 33.2 s |
| `checkout-invoice.spec.js` | PASS | 36.6 s |

### UI — Regression (4/4)

| Spec | Result | Time |
|------|--------|------|
| `invalid-login.spec.js` | PASS | 4.1 s |
| `registration-validation.spec.js` | PASS | 2.7 s |
| `single-confirm-no-invoice.spec.js` | PASS | 56.4 s |
| `empty-cart-checkout.spec.js` | PASS | 7.1 s |

### API — Smoke (2/2)

| Spec | Result | Time |
|------|--------|------|
| `auth-registration-cart.spec.js` | PASS | 3.0 s |
| `invoice-lifecycle.spec.js` | PASS | 8.8 s |

### API — Regression (4/4)

| Spec | Result | Time |
|------|--------|------|
| `auth-negative.spec.js` | PASS | 2.9 s |
| `registration-negative.spec.js` | PASS | 2.0 s |
| `cart-product-negative.spec.js` | PASS | 6.5 s |
| `invoice-negative.spec.js` | PASS | 3.2 s |

---

## Documented Product / Environment Observations (Not Failures)

These are known behaviours documented in requirements and `readme.md` — not hidden by tests:

| Observation | Type | Documentation |
|-------------|------|---------------|
| Invoice requires Confirm clicked **twice** on UI | Product (assessment) | `readme.md`, `CheckoutPage.confirmOrderTwice()` |
| `POST /invoices` returns **201** (OpenAPI lists 200) | Product/API drift | `api-analysis.md`; tests assert 201 |
| Out-of-stock product may return 200 on API add-to-cart | Product behaviour | Not asserted in API regression by design |
| Shared public SUT — cart/session collisions under parallel workers | Environment | Use `--workers=1` for UI |
| TC-MAN-007 (OOS) and TC-MAN-008 (logout) not in UI automation | Scope limit | Manual evidence captured — see `execution-evidence/manual/` |
| Manual `FunctionalTestCase.csv` cases | Executed 9 Aug 2026 | 8/8 **Passed** — see `manual/MANUAL-EXECUTION-LOG.md` |

---

## Manual Test Status

All eight manual cases in `FunctionalTestCase.csv` are **Passed** (9 August 2026):

| TC ID | Status | Evidence |
|-------|--------|----------|
| TC-MAN-001 … TC-MAN-006 | Passed (automation-backed) | Passing UI specs — see traceability in `readme.md` |
| TC-MAN-007 | Passed (manual evidence) | `manual/2026-08-09_TC-MAN-007_*.png` |
| TC-MAN-008 | Passed (manual evidence) | `manual/2026-08-09_TC-MAN-008_*.png` |

**Capture command (TC-MAN-007/008):** `node scripts/capture-manual-evidence.js` (from `PrismStructure/`)

Full log: `execution-evidence/manual/MANUAL-EXECUTION-LOG.md`

---

## Packaged Artifacts

| Artifact | Path |
|----------|------|
| Playwright HTML report | `execution-evidence/2026-08-09_playwright-report/index.html` |
| Manual screenshots | `execution-evidence/manual/` |

---

## Conclusion

**Automation execution review: PASS**

- **14/14** automated tests passed across UI and API smoke and regression tiers.
- No automation fixes were required during this review.
- Suite quality checks passed (no skips, no arbitrary waits in tests, no hardcoded secrets in specs).
- HTML report generated and packaged under `execution-evidence/2026-08-09_playwright-report/`.
- Manual execution complete — 8/8 cases passed (`FunctionalTestCase.csv`, `execution-evidence/manual/`).
- Known product/environment limitations are documented, not masked.

**Reviewer:** QA execution review (Cursor-assisted run, 9 August 2026)
