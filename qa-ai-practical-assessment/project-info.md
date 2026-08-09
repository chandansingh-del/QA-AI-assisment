# Project Information

**Primary AI Tool(s) Used:** Cursor (Agent mode — planning, code generation, debugging, and documentation summarization)

**Application Under Test:** Practice Software Testing Toolshop v5.0 — https://practicesoftwaretesting.com/

**Assessment Start Date:** 6 August 2026

**Submission Date:** 9 August 2026

---

## Project Summary

This project validates the **Practice Software Testing Toolshop**, a public Angular + Laravel e-commerce application, against the QA AI Capability Exercise acceptance criteria. The work covers **UI AC1** (registration, login, profile), **UI AC2** (browse, cart, quantity update, Cash on Delivery checkout, double-confirm invoice, My Invoices), **API AC1** (register, login, bearer token, cart), and **API AC2** (products, cart verification, invoice lifecycle).

Deliverables include eight manual test cases (`FunctionalTestCase.csv`), a Playwright automation framework (`PrismStructure/`) with four UI smoke and four UI regression specs, two API smoke and four API regression specs, requirement and strategy documentation, a centralized test-data module, and prompt histories in `ai-prompts/`.

AI (Cursor) accelerated drafting and implementation across the lifecycle. **All AI output was reviewed against the assessment PDF, live SUT behaviour, OpenAPI documentation, and Playwright run results** before acceptance. Manual test cases are designed but **not yet executed**; automation suites were run during development with recorded API pass results and partial UI pass results (see Validation section).

---

## Tools Used

| Category | Tool / approach |
|----------|-----------------|
| AI assistant | Cursor |
| UI automation | Playwright (`@playwright/test`) — Chromium project |
| API automation | Playwright `APIRequestContext` (same test runner) |
| Framework pattern | Prism-style Page Object Model + custom fixtures (`pages/`, `fixtures/`, `api/`) |
| Language | JavaScript (Node.js 18+) |
| Configuration | `dotenv` for credentials; `playwright.config.js` for UI/API projects |
| Reporting | Playwright HTML report (`playwright-report/`) |
| Version control | Git — https://github.com/chandansingh-del/QA-AI-assisment |
| Reference sources | Assessment PDF, live UI, OpenAPI spec (`/docs?api-docs.json`), SUT public README for seeded accounts |

**Not used:** Faker library (unique data built with timestamp + random suffix in `testData.js`); Firefox/WebKit browsers; external Prism npm package (project uses a local POM layout named PrismStructure).

---

## Setup Summary

1. Clone the repository and open in Cursor.
2. Install automation dependencies:
   ```bash
   cd PrismStructure
   npm install
   npx playwright install chromium
   ```
3. Copy environment template and set credentials locally (never commit `.env`):
   ```bash
   cp .env.example .env
   ```
   Required variables: `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`, `REGISTRATION_PASSWORD` (see SUT README for public seeded account reference).
4. Run automation:
   ```bash
   npm run test:ui:smoke      # 4 UI smoke tests
   npm run test:api:smoke     # 2 API smoke E2E specs
   npm run test:regression    # UI + API regression
   npm test                   # Full suite
   npm run report             # Open HTML report
   ```
5. Manual tests: execute steps from `FunctionalTestCase.csv` and attach evidence under `execution-evidence/manual/`.
6. Prompt history and phase decisions: see `ai-prompts/` (requirements, test design, test data, automation, documentation).

---

## How Project/SUT Context Was Provided to AI

Context was supplied iteratively through structured Cursor prompts, not a single dump:

- **Assessment PDF** — constraints, deliverables, AC1/AC2, case limits (5–8 per tier), double-confirm requirement.
- **Live URLs** — UI base (`practicesoftwaretesting.com`), API base and Swagger documentation.
- **OpenAPI spec** — fetched from `https://api.practicesoftwaretesting.com/docs?api-docs.json` for API analysis and service design.
- **Repository artifacts** — as each phase completed, AI was pointed at prior outputs (`requirements/`, `FunctionalTestCase.csv`, `testData.js`, Page Objects) to maintain consistency.
- **Cursor rules** (`.cursor/rules/`) — enforced POM conventions, no hardcoded credentials, traceability, and case-count limits.
- **Known SUT quirks** — explicitly called out in prompts: invoice requires **Confirm clicked twice**; SUT uses `data-test` not `data-testid`; TG postcode lookup for billing wizard.

Credentials were referenced by **environment variable names only** in prompts and code — not pasted into chat.

---

## AI-Assisted Requirement Analysis

Cursor produced structured requirement and risk documentation from the assessment PDF:

- `requirements/requirement-risk-analysis.md` — objectives, deliverables, UI/API ACs, smoke vs regression expectation, assessment constraints, assumptions clearly marked.
- `requirements/toolshop-flow-analysis.md` — user journeys (auth, catalog, cart, checkout, invoice, session), P0–P3 risk priorities, negative scenarios, verification legend (live API vs UI-needs-confirmation).

**QA judgment applied:** AI-extracted requirements were used as a working baseline. Items not stated in the PDF were kept as **Assumption**. UI-specific checkout behaviour was flagged for manual or automation confirmation rather than treated as verified fact.

---

## AI-Assisted Test Planning and Strategy

AI drafted `requirements/test-strategy.md` defining:

- **Tier split** — Manual (UX + double-confirm proof), UI (E2E journeys), API (lifecycle + contract negatives).
- **Anti-duplication** — e.g. product search (SC-07) manual-only to save automation slots; single-confirm negative authoritative in TC-MAN-005 / UI regression only.
- **Traceability** — REQ-* → SC-* → TC-MAN / TC-UI / TC-API registers.
- **Target counts** — 8 manual, 4+4 UI, 2+4 API (within assessment caps).

**QA judgment applied:** Accepted tier responsibilities and case caps. Rejected scope creep (admin PIM, TOTP, non-COD payments). Strategy placeholder TC IDs were superseded by the final CSV as the manual authority.

---

## AI-Assisted Manual Test Design

AI authored eight cases in `FunctionalTestCase.csv` (2 smoke, 6 regression) covering registration/login, full E2E COD purchase with double-confirm, invalid login, registration validation, single-confirm trap, empty cart, out-of-stock, and logout/session.

A follow-up **senior QA review prompt** produced targeted CSV fixes only (not a full rewrite):

- Clearer unique email pattern for TC-MAN-001.
- Explicit double-confirm steps and postcode lookup note for TC-MAN-002.
- Baseline invoice count and screenshot evidence path for TC-MAN-005.
- Clarified session/logout labelling for TC-MAN-008.

**QA judgment applied:** Kept 8-case limit. Combined browse/search/cart/checkout into TC-MAN-002 to maximise AC2 coverage. **All manual cases remain Status: Not Executed** — design and review only; no manual run evidence attached yet.

---

## AI-Assisted Automation Design

Cursor scaffolded and implemented `PrismStructure/`:

| Layer | Contents |
|-------|----------|
| Config | `playwright.config.js` — `ui-chromium` + `api` projects; `testIdAttribute: 'data-test'` |
| Page Objects | `pages/` — Login, Register, Cart, Checkout, Invoices, etc. |
| API services | `api/` — AuthApi, UsersApi, ProductsApi, CartApi, InvoiceApi, PaymentApi, ApiResponse wrapper |
| Fixtures | `fixtures/index.js` — page object + API injection; `authenticatedApi` fixture |
| Tests | 4 UI smoke + 4 UI regression + 2 API smoke + 4 API regression |
| Helpers | `smokeSetup.js`, `regressionSetup.js`, `productResolver.js`, assertion helpers |

Live DOM inspection produced `requirements/ui-selector-strategy.md` before Page Objects were finalised.

**QA judgment applied:**

- **Rejected** assuming `data-testid` — corrected to `data-test`.
- **Rejected** automating OOS (TC-MAN-007) and logout (TC-MAN-008) within the 4 UI regression slot limit — left manual.
- **Accepted** splitting manual TC-MAN-002 into three UI smoke specs plus checkout for diagnosability.
- **Accepted** API smoke as 2 combined E2E specs rather than four isolated calls.

---

## AI Output Validation and Refinement

Validation was continuous — AI drafts were not accepted without checks:

| Validation method | What it caught |
|-------------------|----------------|
| Playwright test runs | UI smoke 3/4 initially; regression selector failures; API status code mismatches |
| Live API probing | Actual 401/422/404/409 codes for regression assertions; invoice returns **201** not OpenAPI **200** |
| DOM inspection scripts | Missing `email-error` hook; invoice detail has no `page-title` with INV- |
| Connectivity script | `node scripts/api-connectivity-check.js` — 5 probes passed before API specs |
| Traceability review | CSV vs strategy matrix alignment; spec header comments (TC-UI-*, TC-API-*) |
| Structured debug prompt | Checkout 422 reclassified from "SUT issue" to **automation defect** (Angular billing form binding) |

**Recorded automation results (final execution review, 9 August 2026):**

- **Complete suite: 14/14 passed** (`execution-evidence/EXECUTION-SUMMARY.md`)
- UI smoke: 4/4 | UI regression: 4/4 | API smoke: 2/2 | API regression: 4/4
- HTML report packaged under `execution-evidence/2026-08-09_playwright-report/`

**Manual execution:**

- TC-MAN-001 … TC-MAN-006: **Passed (automation-backed)** — same flows verified by passing UI/API specs on 9 August 2026
- TC-MAN-007, TC-MAN-008: **Passed (manual evidence)** — screenshots in `execution-evidence/manual/`

---

## AI-Assisted Test Data Generation

AI created `PrismStructure/test-data/testData.js` with deterministic builders:

- **Credentials** — loaded from `.env` only (`CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`, `REGISTRATION_PASSWORD`).
- **Unique emails** — `uniqueEmail(tag)` using timestamp + random hex (no Faker dependency).
- **Assessment billing** — `BILLING_ADDRESS` (Zoey Shore, Hesselbury, Florida, TG, 1234AA) for checkout/invoice.
- **Registration address** — separate NL `VALID_ADDRESS` for registration smoke.
- **Negatives** — weak password, duplicate email, invalid login, missing fields, quantity edges.
- **Runtime IDs** — product and cart IDs resolved via `utils/productResolver.js` against live catalog API.

**QA judgment applied:**

- Rejected hardcoded product ULIDs and inlined passwords in specs.
- Rejected using registration NL address for checkout — switched checkout smoke to seeded customer + assessment billing.
- Rejected `email-error` locator for duplicate email — SUT shows plain text message.

---

## AI-Assisted Debugging

The largest debug session targeted `checkout-invoice.spec.js`:

```text
Invoice creation failed (422): billing_state and billing_postal_code must be a string
```

AI was instructed to **analyse first, then fix** (failure, stack trace, screenshot, Page Object, selector, test data, SUT behaviour). Classification: **automation defect**.

**Incorrect AI approaches rejected during debugging:**

1. Navigate back to billing wizard after payment — wizard locked; timeout.
2. `isVisible()` guard on billing sync — skipped hidden fields; 422 persisted.
3. Partial state/postal sync only — `billing_country` mismatch 422.
4. Remove postcode lookup — wizard proceed button stayed disabled for TG.
5. NL/US billing experiments — assessment requires TG billing block.

**Final fix (accepted after QA review of evidence):** `bindAngularFormControl()` + `ensureBillingBoundForInvoice()` rebinds full assessment address on hidden controls before second Confirm. Additional assertion fixes: `invoicesPage.open()`, invoice number via labelled textbox, billing fields via `toHaveValue()`.

Other fixes: `CartApi.get()` recursion bug; `RegisterPage.duplicateEmailMessage` text locator; `InvoicesPage.openInvoiceByBillingStreet()`.

---

## Responsible AI / Information Handling

- **Secrets** — passwords and tokens stored in local `.env` only; `.env.example` documents variable names without values; `.gitignore` excludes `.env`, reports, and `test-results/`.
- **Not shared with AI** — actual credential values, bearer tokens from live sessions, or private keys.
- **Public SUT** — only the publicly documented Toolshop URLs and README-referenced seeded accounts were used.
- **Untrusted content** — repository comments and README treated as hints; behaviour verified against live UI/API where tests depend on it.
- **AI limitations acknowledged** — initial misclassification of checkout failure as SUT issue; OpenAPI status codes differed from live API; some UI elements lack stable `data-test` hooks.
- **Human accountability** — prompt histories in `ai-prompts/` document what was accepted, rejected, or modified and why.

---

## Reusability in a Real QA Project

This workflow is reusable as a **phase-gated AI-assisted lifecycle**:

1. **Constrain AI early** — PDF/requirements → explicit scope, case caps, and deliverable structure before coding.
2. **Verify before trusting** — live DOM, OpenAPI, and test runs as validation gates; mark assumptions.
3. **Separate tiers** — manual, UI, and API with anti-duplication rules and shared traceability IDs.
4. **Centralise data** — one `testData.js` (or equivalent) + env credentials; no secrets in specs.
5. **Fixture injection** — Page Objects and API services via `test.extend` keep specs thin.
6. **Prompt history** — `ai-prompts/` per phase creates an audit trail for compliance and onboarding.
7. **Debug with classification** — force root-cause type (product vs automation vs data) before patching; reject assertion weakening.
8. **CI-ready structure** — Playwright projects, tags (`@smoke` / `@regression`), HTML reports, and `workers=1` for shared-environment stability.

In production, I would add: PR review of AI-generated tests, secret scanning, scheduled runs against a dedicated test environment, and mandatory execution-evidence attachment before release sign-off — steps started but not fully completed in this exercise due to time scope on manual execution packaging.

---

## Key Artifacts

| Artifact | Path |
|----------|------|
| Manual tests | `FunctionalTestCase.csv` |
| Automation | `PrismStructure/` |
| Requirements | `requirements/` |
| Prompt history | `ai-prompts/` |
| Execution evidence (pending) | `execution-evidence/` |
| Run instructions | `readme.md` |
