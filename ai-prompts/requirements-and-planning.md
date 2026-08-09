# AI Prompts – Requirements and Planning

Prompt history for requirement understanding, risk analysis, scope definition, and test strategy for the QA AI Capability Exercise (Practice Software Testing Toolshop).

**SUT:** https://practicesoftwaretesting.com/  
**API:** https://api.practicesoftwaretesting.com/api/documentation

---

## Prompt 1

### Prompt
Act as a Senior QA Architect. Analyze the complete Practice Software Testing application (modules, features, business flows, user roles, purchase workflow, API-dependent features, validations, edge cases). Produce Requirement Analysis and Risk Analysis in markdown. Do not generate code.

### AI Response Summary
Produced a broad application analysis covering Toolshop modules (catalog, auth, cart, checkout, invoices, account), user roles (guest, customer, admin), end-to-end purchase workflow, API-backed features, validations, and edge cases. Delivered structured requirement and risk analysis content used as early project context.

### Validation Notes
Not documented in this conversation. The analysis was produced before the formal assessment scaffold (Aug 6, 2026).

### Changes I Made
Accepted the analysis as initial SUT context. Later prompts (Aug 9) replaced informal planning with assessment-specific artifacts (`requirement-risk-analysis.md`, `toolshop-flow-analysis.md`).

### Reason
Early exploration established baseline understanding of the application before the structured QA AI exercise workflow began.

---

## Prompt 2

### Prompt
Create `project-info.md`.

### AI Response Summary
Created a `project-info.md` template with sections for AI workflow documentation: tools used, setup summary, how AI was used for requirement analysis, test planning, manual design, automation, validation, test data, debugging, and reuse.

### Validation Notes
Template placeholders remain (e.g. assessment dates, execution summaries). Not documented as manually completed in this conversation.

### Changes I Made
Kept the template structure. Content was not fully populated during the planning phase captured in this conversation.

### Reason
Assessment deliverable requires documenting AI workflow; template created early to be filled as work progressed.

---

## Prompt 3

### Prompt
Act as a senior QA automation architect. Inspect the workspace for existing Playwright/Prism conventions. Do not write tests yet. Create the required assessment repository structure (`qa-ai-practical-assessment/` with `FunctionalTestCase.csv`, `PrismStructure/`, `requirements/`, `ai-prompts/`, etc.).

### AI Response Summary
Confirmed workspace was empty (no existing Playwright or Prism setup). Scaffolded the assessment folder layout, placeholder `FunctionalTestCase.csv`, stub `readme.md`, `project-info.md`, and `ai-prompts/` files including this document.

### Validation Notes
Repository structure verified by subsequent prompts referencing paths under `qa-ai-practical-assessment/`.

### Changes I Made
Accepted the proposed folder structure and naming aligned to the assessment participant guide.

### Reason
A consistent repo layout is required for deliverables, traceability, and later automation tiers.

---

## Prompt 4

### Prompt
Analyze the QA assessment PDF requirements. Do not write automation code. Extract objectives, deliverables, UI/API/manual/smoke/regression expectations, test data and execution evidence requirements, prompt-history expectations, repo structure, git expectations, and test-count constraints. Create `requirements/requirement-risk-analysis.md` with an **Assessment Constraints** section. Mark assumptions clearly.

### AI Response Summary
Created `requirements/requirement-risk-analysis.md` sourced from the participant guide only. Documented:
- Part A (AI workflow, 30%) vs Part B (mini project, 70%)
- Mandatory deliverables (manual CSV, UI/API automation, test data strategy, execution evidence, prompt history, `readme.md`, `project-info.md`)
- UI AC1 (registration/login/profile) and UI AC2 (browse → cart → COD → invoice/My Invoices)
- API AC1 (register/login/token/cart) and API AC2 (products → cart → invoice)
- Smoke vs regression categorization expectation
- **Assessment Constraints**: ~5–8 cases per tier, Playwright + Cursor, invoice double-confirm on UI
- Assumptions clearly separated from stated requirements

### Validation Notes
Cross-checked against assessment PDF via AI extraction only. No manual re-read of the PDF is recorded in this conversation.

### Changes I Made
Accepted the document as the authoritative constraints reference for downstream prompts (strategy, manual suite, automation).

### Reason
Future prompts explicitly referenced `Assessment Constraints` to avoid scope creep and test-count violations.

---

## Prompt 5

### Prompt
Act as a senior exploratory QA engineer. Analyze Toolshop user journeys (auth, browse/search/filter, cart, checkout, COD, invoice, My Invoices, session/logout, validations, negatives, edge cases, error handling, high-risk areas). Treat invoice **double-confirm** as explicit. Categorize Smoke vs Regression. Do not create automation.

### AI Response Summary
Created `requirements/toolshop-flow-analysis.md` with:
- P0/P1/P2 risk priority matrix (purchase + auth = P0; double-confirm = P1 high automation risk)
- 8 main user journeys (J1–J8) with smoke/regression tags
- Auth, catalog, cart, checkout, invoice, and session flows
- Validation messages and negative scenarios
- Verification legend: ✅ live API, 🔍 UI needs confirmation, 📋 assessment requirement
- Explicit callout: UI invoice requires **Confirm clicked twice**

### Validation Notes
AI verified some behaviors via live API and OpenAPI (e.g. invalid login → 401, unauthenticated invoice → 401, cart without login). UI-specific steps marked 🔍 where not directly observed. Manual execution not recorded in this conversation.

### Changes I Made
Accepted flow analysis as input to test strategy. Used risk priorities (P0 purchase path, P1 double-confirm) to drive manual and automation scope.

### Reason
Exploratory analysis bridges assessment ACs to concrete flows and risk-based prioritization within the 5–8 case limit.

---

## Prompt 6

### Prompt
Using requirement analysis and flow analysis, create a practical QA test strategy (scope, out of scope, objectives, risk priorities, manual/UI/API approaches, smoke and regression suites, positive/negative/boundary testing, test data, auth/session, invoice validation, API-to-UI relationship, execution and reporting). Optimize for max coverage with min duplication under ~5–8 cases per tier. Create `requirements/test-strategy.md` with traceability structure.

### AI Response Summary
Created `requirements/test-strategy.md` defining:
- **In scope:** UI AC1/AC2, API AC1/AC2, smoke/regression tags, double-confirm, traceability
- **Out of scope:** Admin PIM, TOTP/OAuth, non-COD payments (stretch), performance, full cross-browser matrix
- Tier responsibilities: Manual (UX + double-confirm proof), UI (E2E journeys), API (lifecycle + contract negatives)
- Target counts: ~6–7 manual, ~6–7 UI, ~6–7 API
- Anti-duplication rules (e.g. SC-06 single-confirm = manual + UI only; search SC-07 manual-only to save automation slots)
- Traceability map: Requirement → Scenario (SC-01…) → Manual / UI / API TC IDs
- Invoice validation strategy including assessment billing payload (`Zoey Shore`, `Hesselbury`, `Florida`, `TG`, `1234AA`, COD)

### Validation Notes
Strategy internally consistent with `requirement-risk-analysis.md` and `toolshop-flow-analysis.md`. Subsequent prompts referred to this as the "approved test strategy." No independent manual strategy review is documented in the conversation.

### Changes I Made
Accepted tier split and anti-duplication rules. Used SC-IDs and traceability structure for manual CSV and later automation mapping.

### Reason
A single strategy document prevents smoke/regression overlap across manual, UI, and API tiers within assessment limits.

---

## Prompt 7

### Prompt
Create a compact manual test suite (max 8 cases) covering highest-risk ecommerce flows: registration, login, browse/search, product detail, multi-product cart, quantity update, COD checkout, invoice generation, My Invoices, and efficient negatives. Include full CSV fields, realistic data, explicit double-confirm steps. Output `FunctionalTestCase.csv`.

### AI Response Summary
Authored 8 manual test cases (TC-MAN-001 … TC-MAN-008):
| TC | Focus | Tag |
|----|-------|-----|
| TC-MAN-001 | Registration + login + profile (AC1) | @smoke |
| TC-MAN-002 | Full E2E COD purchase with double-confirm + My Invoices (AC2) | @smoke |
| TC-MAN-003 | Invalid login | @regression |
| TC-MAN-004 | Weak password + duplicate email | @regression |
| TC-MAN-005 | Single confirm does **not** create invoice | @regression |
| TC-MAN-006 | Empty cart checkout blocked | @regression |
| TC-MAN-007 | Out-of-stock add-to-cart blocked | @regression |
| TC-MAN-008 | Logout clears session | @regression |

Combined browse, search, cart, qty, checkout, and invoice into TC-MAN-002 to stay within the 8-case cap.

### Validation Notes
All cases marked **Not Executed** in `FunctionalTestCase.csv`. No manual test run evidence is recorded in this conversation.

### Changes I Made
Accepted the 8-case suite and selection rationale (2 smoke, 6 regression).

### Reason
Maximizes AC1/AC2 and double-confirm coverage while reserving regression slots for auth, registration, cart, OOS, and session risks.

---

## Prompt 8

### Prompt
Review `FunctionalTestCase.csv` as a senior QA reviewer. Evaluate traceability, coverage, smoke/regression classification, duplication, missing scenarios, test data, expected results, automation suitability, and business risk. Document issues and recommend changes. Update CSV only after review. Do not exceed 8 cases unless necessary.

### AI Response Summary
Performed structured review. Overall verdict: suite well-structured for 8-case limit. Targeted fixes applied (not a full rewrite):
- **TC-MAN-001:** Email placeholder changed to `{YYYYMMDDhhmm}` pattern to reduce collision risk
- **TC-MAN-002:** Preconditions strengthened (in-stock check); postcode lookup note for TG/1234AA; double-confirm steps 13–14 explicit
- **TC-MAN-005:** Baseline invoice count before checkout; screenshot evidence path for execution-evidence
- **TC-MAN-008:** Scenario label clarified (session/logout)
- Removed redundant single-confirm assertion overlap between smoke and regression where applicable
- Improved expected-result specificity (error feedback, invoice count unchanged after one confirm)

### Validation Notes
Review was AI-led against the 12 evaluation criteria. CSV updated in-repo. Manual re-execution of revised cases not documented in this conversation.

### Changes I Made
Accepted targeted CSV updates. Kept 8-case total. Used revised CSV as the baseline for UI automation prompts ("approved FunctionalTestCase.csv").

### Reason
Incremental review improved traceability and test data without expanding scope beyond assessment constraints.

---

## Planning Phase Outcomes

| Artifact | Path | Purpose |
|----------|------|---------|
| Requirement & risk extraction | `requirements/requirement-risk-analysis.md` | Assessment constraints and deliverables |
| Flow & risk analysis | `requirements/toolshop-flow-analysis.md` | Journeys, negatives, P0–P3 priorities |
| Test strategy | `requirements/test-strategy.md` | Scope, tier split, traceability, anti-duplication |
| Manual suite | `FunctionalTestCase.csv` | 8 reviewed manual cases (2 smoke, 6 regression) |
| Workflow template | `project-info.md` | AI usage documentation (to be completed) |

## Key Planning Decisions (Cross-Prompt)

1. **Scope discipline:** Admin, TOTP, non-COD payments, and performance excluded from core scope.
2. **Double-confirm:** Treated as P0/P1 risk; TC-MAN-005 is the authoritative negative; UI smoke must validate two confirms.
3. **Tier separation:** Same business outcome may appear in UI and API with different assertions—not copy-pasted identical tests.
4. **Test count:** Hard cap of 8 manual; strategy targets ~6–7 per automation tier.
5. **Assessment billing data:** `Zoey Shore / Hesselbury / Florida / TG / 1234AA` used consistently for checkout/invoice scenarios.

## Items Not Covered in This File

Per assessment prompt-history split, the following are documented elsewhere:
- Test data strategy → `ai-prompts/test-data.md`
- Selector strategy and manual-to-automation mapping → `ai-prompts/test-design.md`, `requirements/ui-selector-strategy.md`
- Framework, suites, and debugging → `ai-prompts/automation-and-debugging.md`
- API endpoint analysis → `requirements/api-analysis.md`
