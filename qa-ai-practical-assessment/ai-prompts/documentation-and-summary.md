# AI Prompts – Documentation and Summary

Prompt history for assessment deliverable documentation: `project-info.md`, `readme.md`, traceability, execution reporting, and end-of-phase summaries in `ai-prompts/`.

**Important:** In this conversation, AI produced **drafts and scaffolds**. Final submission documents (`project-info.md`, `readme.md`, `execution-evidence/`) were **not completed** with execution results or a filled AI-workflow narrative. Summaries below distinguish what AI generated from what still requires human QA review and completion.

---

## Prompt 1 — Initial `project-info.md` (Aug 6)

### Prompt
Create `project-info.md` file.

### AI Response Summary
AI read the assessment PDF template and produced a **substantive first draft** at workspace root (`project-info.md`) including:

- Project metadata (AI tools, SUT, start date 6 August 2026)
- Project summary focused on E2E checkout + API invoice lifecycle
- AC1/AC2 mapping for UI and API
- Tools table (Cursor, Playwright/Prism, JavaScript, Chromium, HTML report)
- All **10 required "Setup Summary" sections** with starter narrative (context to AI, requirement analysis, test planning, manual design, automation design, validation, test data, debugging, secrets avoidance, reuse)
- Reference section (modules, double-confirm quirk, API endpoints)
- Target repo structure and planned run commands

### Edits I Made
- **Workspace reset (Aug 9):** Earlier `project-info.md` was deleted when the workspace was cleared to restart the assessment from scratch. The Aug 6 draft was **not carried forward** into `qa-ai-practical-assessment/`.
- **Re-scaffold:** Aug 9 assessment structure created a **new placeholder** `project-info.md` with section headings only.

### Reason for Edits
Fresh start aligned to the formal `qa-ai-practical-assessment/` folder layout. The Aug 6 draft served as exploration; the assessment deliverable was intentionally restarted with templates to fill as work progressed.

---

## Prompt 2 — Assessment Repository Scaffold (Aug 9)

### Prompt
Inspect workspace. Create required assessment repository structure (`FunctionalTestCase.csv`, `PrismStructure/`, `project-info.md`, `readme.md`, `requirements/`, `ai-prompts/`, `execution-evidence/`, Cursor rules). Do not write tests yet.

### AI Response Summary
AI confirmed empty workspace and created:

| Deliverable | What AI produced |
|-------------|------------------|
| `project-info.md` | **Template** — 10 Setup Summary sections with `_[placeholder]_` prompts |
| `readme.md` | **Starter** — SUT URLs, folder tree, setup/run commands, assessment notes |
| `execution-evidence/README.md` | Naming convention + artifact types to store |
| `ai-prompts/documentation-and-summary.md` | Entry template + submission checklist |
| `ai-prompts/*.md` (other phases) | Empty entry templates |
| `FunctionalTestCase.csv` | 2 placeholder rows |
| `PrismStructure/README.md` | Placeholder framework layout |
| `.cursor/rules/` | QA conventions (traceability, case limits, prompt history) |

### Edits I Made
- **Accepted** folder layout and template files as the submission skeleton.
- **Did not** populate `project-info.md` sections during the automation phase — left for post-implementation documentation pass.
- **Did not** update root `readme.md` after automation was implemented (still contains "npm scripts are placeholders" note).

### Reason for Edits
Scaffold-first approach: establish deliverable structure before filling content. Automation work took priority; top-level docs deferred to avoid documenting unimplemented commands.

---

## Prompt 3 — Requirement & Planning Documentation

### Prompt
Analyze assessment PDF. Create `requirements/requirement-risk-analysis.md`. Then flow analysis and test strategy with traceability structure.

### AI Response Summary
AI produced planning documents that became the **traceability backbone**:

| Document | Traceability / documentation role |
|----------|-----------------------------------|
| `requirements/requirement-risk-analysis.md` | Assessment constraints, deliverables list, AC definitions |
| `requirements/toolshop-flow-analysis.md` | Journeys J1–J8, SC-01…SC-14 scenario IDs, smoke/regression tags |
| `requirements/test-strategy.md` | REQ register, scenario register, anti-duplication rules, **REQ → SC → TC-MAN / TC-UI / TC-API** matrix (Section 19) |

These are not `project-info.md`, but they document scope and traceability decisions that downstream specs and CSV reference.

### Edits I Made
- **Accepted** `test-strategy.md` as the approved strategy referenced in later prompts.
- **Noted gap:** Strategy placeholder TC IDs do not exactly match final `FunctionalTestCase.csv` — CSV became authoritative for manual mapping after Prompt 4 review.
- **Did not** manually re-read the assessment PDF independently — relied on AI extraction plus iterative use of constraints in later prompts.

### Reason for Edits
Planning docs needed to exist before manual/automation design. CSV review corrected traceability without rewriting the entire strategy document.

---

## Prompt 4 — Manual CSV Traceability & Review Documentation

### Prompt
Create `FunctionalTestCase.csv` (8 cases). Senior-review for traceability, coverage, smoke/regression, duplication. Update CSV only after review.

### AI Response Summary
AI authored 8 manual cases with TC-MAN-001…008, tags, and steps. Review applied **targeted traceability fixes**:

| TC | Documentation / traceability change |
|----|-------------------------------------|
| TC-MAN-001 | Clearer unique email pattern in test data column |
| TC-MAN-002 | Explicit double-confirm steps; postcode lookup note |
| TC-MAN-005 | Baseline invoice count; screenshot path `execution-evidence/manual/` |
| TC-MAN-008 | Session/logout scenario label clarified |

All cases remain **Status: Not Executed** in CSV.

### Edits I Made
- **Accepted** targeted CSV edits; **rejected** full rewrite or ninth case.
- **Did not** execute manual tests or attach screenshots to `execution-evidence/manual/` — path documented only.

### Reason for Edits
Traceability and execution-evidence guidance improved without exceeding the 8-case cap. Manual execution evidence is a **pending human task**, not AI-completed.

---

## Prompt 5 — Technical Reference Documentation (Selectors & API)

### Prompt
Create `requirements/ui-selector-strategy.md` from live DOM. Later: create `requirements/api-analysis.md` from OpenAPI.

### AI Response Summary
AI produced **technical reference docs** supporting automation and traceability to real SUT behavior:

- **`ui-selector-strategy.md`** — `data-test` vs `data-testid` correction, per-flow locators, uninstrumented elements (invoice detail, duplicate email)
- **`api-analysis.md`** — Endpoint catalog from live OpenAPI v5.0.0; auth model; invoice payload fields; documented vs live status codes

Spec file headers (`TC-UI-SMOKE-004`, `TC-API-002`, etc.) and README mapping tables reference these SC/TC IDs.

### Edits I Made
- **Accepted** selector strategy as Page Object source of truth.
- **Corrected via automation:** Invoice detail and duplicate-email gaps found during test runs were already flagged in selector strategy — automation fixes aligned to documented gaps rather than updating the strategy doc again.

### Reason for Edits
Reference docs reduce invented selectors/endpoints. Gaps explicitly documented so assertions are designed around real DOM/API behavior.

---

## Prompt 6 — Framework & Test README Updates

### Prompt
Build Playwright framework. Implement UI/API suites. (Documentation produced as side effect of implementation prompts.)

### AI Response Summary
AI updated **in-repo technical documentation** during automation:

| File | Content |
|------|---------|
| `PrismStructure/README.md` | Architecture diagram, layer responsibilities, setup/run commands, design patterns (double confirm, no hardcoded IDs) |
| `PrismStructure/tests/api/README.md` | Service class table, fixture usage, **smoke/regression spec mapping** (TC-API-001…006, SC-09…SC-14), run commands |
| `PrismStructure/package.json` | Working npm scripts (`test:smoke`, `test:ui:smoke`, `test:api:smoke`, `report`, etc.) |
| UI/API spec headers | Inline traceability comments (`TC-UI-SMOKE-004 | SC-02 | Maps to TC-MAN-002`) |

**Stale sections (not updated by AI after specs landed):**

- `PrismStructure/README.md` — still says "Test specs — next phase"
- Root `readme.md` — still says npm scripts are "placeholders until automation is implemented"

### Edits I Made
- **Used** `tests/api/README.md` and spec headers as the most accurate run/traceability reference during the project.
- **Did not** sync root `readme.md` or `PrismStructure/README.md` status sections after suites passed — **pending human edit**.

### Reason for Edits
Implementation prompts prioritized working tests over polishing top-level README status. API README was updated because it directly supports running and mapping API specs.

---

## Prompt 7 — Execution Reporting (Planned, Not Completed)

### Prompt
_(Implicit assessment requirement — execution evidence deliverable. No dedicated "write execution report" prompt in conversation.)_

### AI Response Summary
**What exists:**

| Artifact | Status |
|----------|--------|
| `execution-evidence/README.md` | Naming convention + artifact types (reports, traces, manual notes) |
| `PrismStructure/playwright-report/` | HTML report **generated during test runs** in workspace |
| `PrismStructure/test-results/` | Failure screenshots/traces from debugging (e.g. checkout-invoice) |
| `execution-evidence/` copies | **Not created** — no exports copied to submission folder |
| Manual execution report | **Not created** — CSV status `Not Executed` |

**Recorded automation results (from conversation, not formal report file):**

| Suite | Recorded result |
|-------|-----------------|
| API full | 6/6 passed |
| UI smoke (initial) | 3/4 passed |
| UI all (mid-session) | 7/8 passed |
| UI `checkout-invoice` (post-debug) | Single test passed |
| UI full post-fix | Run interrupted — final count not recorded |
| API connectivity | 5/5 probes passed |

### Edits I Made
- **Did not** copy Playwright HTML report or failure artifacts into `execution-evidence/`.
- **Did not** write a formal execution summary markdown for submission.
- TC-MAN-005 review added screenshot path guidance — **not executed**.

### Reason for Edits
Execution reporting was deferred. Test runs validated automation during development; packaging evidence for assessors remains a **manual completion step**.

---

## Prompt 8 — Phase Summaries into `ai-prompts/` (End of Conversation)

### Prompt
Summarize this Cursor conversation into phase-specific `ai-prompts/` files:

- `requirements-and-planning.md`
- `test-design.md`
- `test-data.md`
- `automation-and-debugging.md`
- `documentation-and-summary.md` (this file)

### AI Response Summary
AI produced **retrospective prompt histories** from the conversation transcript and repo artifacts:

| File | Status |
|------|--------|
| `ai-prompts/requirements-and-planning.md` | **Completed** — 8 planning prompts |
| `ai-prompts/test-design.md` | **Completed** — 7 test-design prompts |
| `ai-prompts/test-data.md` | **Completed** — 9 test-data prompts |
| `ai-prompts/automation-and-debugging.md` | **Completed** — 9 automation/debug prompts |
| `ai-prompts/documentation-and-summary.md` | **This file** |

Each summary uses a consistent structure, documents **rejections and corrections** where the conversation supports them, and avoids fabricating validation or execution that did not occur.

### Edits I Made
- **Directed** AI to summarize from transcript evidence rather than inventing outcomes.
- **Required** explicit notation where manual validation or execution did not happen.
- **Did not** treat these summaries as substitutes for completing `project-info.md` or `readme.md` — they document *how AI was used*, not the final assessor-facing narrative.

### Reason for Edits
Assessment Part A (30%) requires prompt history demonstrating AI-assisted workflow with human oversight. Summaries capture decisions, corrections, and gaps for submission review.

---

## Documentation Status Summary

### Complete or substantially drafted (AI-assisted)

| Artifact | Completeness |
|----------|--------------|
| `requirements/requirement-risk-analysis.md` | Complete |
| `requirements/toolshop-flow-analysis.md` | Complete |
| `requirements/test-strategy.md` | Complete (traceability matrix; CSV is manual authority) |
| `requirements/ui-selector-strategy.md` | Complete |
| `requirements/api-analysis.md` | Complete |
| `FunctionalTestCase.csv` | Populated; **not executed** |
| `PrismStructure/tests/api/README.md` | Complete with mappings |
| `ai-prompts/*.md` (phase histories) | Complete per conversation scope |

### Template / incomplete (requires human QA review)

| Artifact | Gap |
|----------|-----|
| `project-info.md` | All 10 Setup Summary sections still placeholders |
| `readme.md` | Outdated placeholder note; missing public Git URL |
| `PrismStructure/README.md` | Status says specs "next phase" |
| `execution-evidence/` | Only README; no attached reports/screenshots |
| Manual execution evidence | TC-MAN-005 screenshot path documented but empty |

---

## How AI Assisted vs. What QA Still Owns

| Activity | AI role | Human / QA role |
|----------|---------|-----------------|
| `project-info.md` structure | Drafted Aug 6 narrative; Aug 9 template | **Fill all 10 sections** with actual workflow, dates, validation examples |
| `readme.md` | Starter structure and commands | **Update** for implemented scripts; add Git URL; verify commands on clean machine |
| Traceability | REQ/SC/TC registers, CSV, spec headers | **Verify** matrix matches final specs; execute manual cases |
| Execution reporting | Report paths, failure artifacts during runs | **Copy** reports to `execution-evidence/`; write pass/fail summary |
| Technical accuracy | OpenAPI/DOM-based reference docs | **Review** AI extractions against PDF and live SUT |
| Prompt history | Retrospective summaries in `ai-prompts/` | **Review** for accuracy before submission |

---

## Submission Checklist (Current State)

- [ ] `project-info.md` complete (10 Setup Summary sections filled)
- [ ] `readme.md` has verified run instructions and public Git URL
- [ ] `FunctionalTestCase.csv` populated *(done)* — manual execution evidence attached
- [ ] Execution evidence attached in `execution-evidence/`
- [x] `ai-prompts/` phase histories populated
- [ ] Final pass: reconcile stale README status lines with implemented suites

---

## Cross-References

| Topic | Location |
|-------|----------|
| Planning & strategy | `ai-prompts/requirements-and-planning.md` |
| Test design & CSV | `ai-prompts/test-design.md` |
| Test data | `ai-prompts/test-data.md` |
| Automation & debugging | `ai-prompts/automation-and-debugging.md` |
| Traceability registers | `requirements/test-strategy.md` Section 19 |
| API spec mapping | `PrismStructure/tests/api/README.md` |
