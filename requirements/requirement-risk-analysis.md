# Requirement and Risk Analysis

**Source:** QA AI Capability Exercise — Participant Guide (QA Practical Assessment PDF)  
**Application Under Test:** https://practicesoftwaretesting.com/  
**API Documentation:** https://api.practicesoftwaretesting.com/api/documentation

> This document extracts and organizes assessment requirements only. Items not stated in the assessment are marked as **Assumption**.

---

## 1. Assessment Objectives

### Part A — AI Workflow Foundation (30% emphasis)

- Demonstrate how AI is used in a **practical testing workflow** across the lifecycle: requirement understanding, test planning, manual and automation test design, test data generation, execution, debugging, and documentation.
- Show AI is used **thoughtfully**, not as a shortcut to “generate some test cases.”
- Make **testing thought process visible** — evaluators assess how AI was used for requirement analysis, test strategy, prompt design, coverage decisions, debugging, and reflection.
- Submit **`project-info.md`** documenting the AI-assisted workflow (see Mandatory Deliverables).

### Part B — QA Mini Project (70% emphasis)

- Demonstrate **AI-assisted QA delivery** on a realistic application.
- Project is split into **UI and API test scenarios**.
- A **clean, well-documented Core alone is a strong result**; depth of evidence distinguishes submissions.
- Test a small e-commerce application; include **all possible flows that can be tested**, categorized as **sanity or regression**.

### Overall Exercise Goal

- Build and make visible an **AI-assisted testing workflow**.
- A **smaller but well-tested Core with strong artifacts and reflection** beats a large, superficially tested surface.
- This is for **development and feedback**, not a pass/fail exam.

---

## 2. Mandatory Deliverables

Per **Common QA Requirements (Regardless of Option)**, the submission must include:

| # | Deliverable | Assessment Reference |
|---|-------------|----------------------|
| 1 | **Requirement and risk analysis** specific to the application under test | Common QA Requirements §1 |
| 2 | **`project-info.md`** — Project Info, UI, API, positive/negative/edge, Smoke/Regression | Common QA Requirements §2 |
| 3 | **Manual test suite** for key flows (`FunctionalTestCase.csv`) | Common QA Requirements §3 |
| 4 | **UI automation tier** (e.g., Playwright) covering **smoke and E2E/regression** flows | Common QA Requirements §4 |
| 5 | **API automation tier** (e.g., Playwright) covering **core lifecycle APIs** | Common QA Requirements §6 |
| 6 | **Test data strategy** — how data is designed and/or generated, including via AI | Common QA Requirements §7 |
| 7 | **Evidence of test execution** — logs, reports, screenshots, or API collections | Common QA Requirements §8 |
| 8 | **`readme.md`** with test setup and execution instructions | Common QA Requirements §10 |
| 9 | **Full prompt history** related to test design, automation, and debugging | Common QA Requirements §11 |
| 10 | All planning, design, testing, debugging, review, and reflection artifacts in a **clear repository or folder structure** | Common QA Requirements §12 |

### Tool-Specific Expectation

- Use **Playwright (Prism Framework)** and **Cursor**.

### Assignment Constraint (from Part B header)

- Assignment is to be done in **Playwright using Cursor AI**, managed **within the monthly limit**.

---

## 3. UI Testing Expectations

### System Under Test

- **URL:** https://practicesoftwaretesting.com/
- Small **e-commerce application**.

### Documented Acceptance Criteria (Examples)

**AC1 — User Registration & Login**

> The user should be able to register with valid details, log in using the registered credentials, and verify their profile information successfully.

**AC2 — End-to-End Purchase Flow**

> The user should be able to browse products, add multiple items to the cart (including updating quantity), complete the checkout using **Cash on Delivery**, and successfully view the generated invoice under **My Invoices**.

### Documented SUT Behavior (UI)

- **You need to press confirm twice to generate invoice.**
- **For Invoice ID, press confirm button on the application twice.**

### Core Acceptance Criteria — UI (QA Perspective)

UI tests should verify key user flows:

- create
- list
- view
- update
- comment
- search
- error handling

### Scope Guidance

- Include **all possible flows that can be tested**.
- Categorize flows as **sanity or regression**.
- Use acceptance-criteria style documentation (assessment suggests AC format).

---

## 4. API Testing Expectations

### API Documentation

- **URL:** https://api.practicesoftwaretesting.com/api/documentation

### Scope

- Test a **flow/component** in this activity (per Part B).

### Documented Acceptance Criteria (Examples)

**AC1 — User Authentication & Cart Creation**

> A new user should be able to register via API, log in with the registered credentials, obtain a valid **bearer token**, and create a new cart successfully.

**AC2 — Product Selection & Invoice Generation**

> Using the bearer token, the user should be able to retrieve products, add selected products to the cart, verify the cart contents, and successfully generate an invoice with the required customer and order details.

### Example Invoice Generation Request Body (from assessment)

```json
{
  "billing_street": "Zoey Shore",
  "billing_city": "Hesselbury",
  "billing_state": "Florida",
  "billing_country": "TG",
  "billing_postal_code": "1234AA",
  "payment_method": "cash-on-delivery",
  "cart_id": "01kx0dctdxxg6sm4wtt1t0nf9r",
  "payment_details": {}
}
```

### Core Acceptance Criteria — API (QA Perspective)

API tests should verify key user flows:

- create
- list
- view
- update
- comment
- search
- error handling

### State Machine Coverage

- Cover **valid and invalid status transitions** with tests (**manual + API automation** for the state machine).

---

## 5. Manual Testing Expectations

- Provide a **manual test suite** for **key flows** as **`FunctionalTestCase.csv`** (Manual/Functional Test case).
- Part A (`project-info.md`) expects AI use for manual test case design covering:
  - **functional**
  - **edge**
  - **negative**
  - **non-functional**
- `project-info.md` must also cover positive/negative/edge and Smoke/Regression categorization.

---

## 6. Smoke Testing Expectations

The assessment uses **“sanity”** and **“smoke”** in different places:

| Term Used | Context |
|-----------|---------|
| **sanity or regression** | Flow categorization for testable flows (Part B) |
| **smoke And E2E/regression flows** | UI automation tier coverage (Common QA Requirements) |
| **@Smoke, @regression** | Test tagging in test-count constraint |

### Explicit Expectations

- UI automation must cover **smoke** flows.
- Test cases (manual, UI, API) should include **`@Smoke`** tagging (per test-count constraint).
- `readme.md` must include commands to run **Smoke** tests separately.
- `project-info.md` must describe test planning strategy including **smoke vs regression**.

**Assumption:** “Sanity” in Part B and “smoke” in automation/readme refer to the same priority tier unless your team defines them differently. The assessment does not define the difference explicitly.

---

## 7. Regression Testing Expectations

### Explicit Expectations

- Categorize testable flows as **sanity or regression**.
- UI automation must cover **E2E/regression** flows.
- Test cases (manual, UI, API) should include **`@regression`** tagging (per test-count constraint).
- `readme.md` must include commands to run **Regression** tests separately.
- `project-info.md` must describe **smoke vs regression** strategy.

---

## 8. Test Data Expectations

### Mandatory

- Submit a **test data strategy** describing how data is designed and/or generated, **including via AI** (Common QA Requirements §7).
- `project-info.md` must document AI use for **test data generation**, **environment assumptions**, and **API payloads**.

### Core Acceptance Criteria

- Test data is **well-planned** (e.g., different priorities, statuses, edge case titles/descriptions).

### Prompt History

- Maintain **`ai-prompts/test-data.md`** with prompts used to generate test data for UI + API.
- Per entry: Prompt, AI Response Summary, Validation Notes.

### Example Payload (Assessment-Provided)

- Invoice example uses `payment_method: "cash-on-delivery"` and `payment_details: {}` (see Section 4).

**Assumption:** The example `cart_id` in the sample payload is illustrative; the assessment does not require using that exact value.

---

## 9. Execution Evidence Expectations

### Mandatory

- Provide **evidence of test execution**: logs, reports, screenshots, or API collections (Common QA Requirements §8).

### Completion Criteria (What Counts as Complete)

- Project should include **execution reports**.
- **Status of all test cases should be `Passed`.**

### README Expectations

- Document **where the final reports are generated**.

### What Good Looks Like

- Include **evidence of execution and logs**.

**Assumption:** A dedicated `execution-evidence/` folder is a reasonable way to satisfy deliverable §8, but the assessment does not mandate that folder name.

---

## 10. Prompt-History Expectations

### Mandatory

- **Full prompt history** related to test design, automation, and debugging (Common QA Requirements §11).
- Prompt history must show **thoughtful AI use**, not copy-paste of unreviewed outputs (Core Acceptance Criteria §8).

### Required Folder and Files

```
ai-prompts/
├── requirements-and-planning.md
├── test-design.md
├── test-data.md
├── automation-and-debugging.md
└── documentation-and-summary.md
```

### Per-File Entry Format

| File | Required Fields per Entry |
|------|---------------------------|
| `requirements-and-planning.md` | Prompt, AI Response (short summary) |
| `test-design.md` | Prompt, AI Response Summary, Validation Notes |
| `test-data.md` | Prompt, AI Response Summary, Validation Notes |
| `automation-and-debugging.md` | Prompt, AI Response Summary, Debugging Outcome |
| `documentation-and-summary.md` | Prompt, AI Response Summary, Edits You Made, Reason for Edits |

### Process Expectations

- Follow **iterative development methodology while prompting**.
- Demonstrate **iterative prompting** and careful review of AI output (What Good Looks Like).

---

## 11. Repository Structure Expectations

### Required Structure (from assessment)

```
QA-AI-assisment/             # Repository root (assessment deliverables at top level)
├── FunctionalTestCase.csv
├── PrismStructure/          # Playwright for API+UI + Execution Report
├── project-info.md
├── readme.md
└── ai-prompts/
    ├── requirements-and-planning.md
    ├── test-design.md
    ├── automation-and-debugging.md
    └── documentation-and-summary.md
```

### Optional (from assessment)

```
.cursor/                     # Rules, Skills, agent/mcp (Optional)
```

**Note:** The **AI Prompts Folder** section (later in the assessment) also lists `test-data.md` under `ai-prompts/`. Include it to satisfy prompt-history expectations even though the abbreviated repository tree omits it.

### `readme.md` Must Include

- What framework is used
- How to run tests
- Where test data lives
- Fields required to run automation or manual test cases
- **Smoke** and **Regression** run commands
- Where final reports are generated

### `project-info.md` Must Include

- Primary AI tool(s) used
- Application Under Test: **Practice Software Testing Toolshop – Checkout & Application Flow**
- Assessment Start Date / Submission Date
- Project Summary (1–3 sentences)
- Tools Used
- Setup Summary (10 sections — see Part A Expected Submission)

---

## 12. Git / Iteration Expectations

| Requirement | Source |
|-------------|--------|
| Submit assignment over **public git** and **share the URL** | What Counts as Complete |
| **Git push should not be done in a single commit** — iterative development and push | What Counts as Complete |
| Follow **iterative development methodology while prompting** | What Counts as Complete |
| Work may be done in **any order**; no required day-wise plan | Time and Effort |
| Complete within **one week** (self-paced) | Time and Effort |

---

## 13. Important Constraints

| Constraint | Detail |
|------------|--------|
| **Test count limit** | No more than **5–8 test cases of each type** (manual + UI + API), including `@Smoke` and `@regression` |
| **All tests must pass** | Status of all test cases should be **`Passed`** |
| **Core effort** | Mandatory Core QA project scoped for roughly **5–10 focused hours** |
| **Do not over-automate** | Do not expand automation surface area at the expense of lifecycle artifacts |
| **Cursor usage** | Use Playwright with Cursor AI; manage within **monthly limit** |
| **Automation runnable from README** | At least one automation suite executable from README **without manual intervention beyond environment setup** |
| **Traceability** | Clear mapping from requirements / state machine to test scenarios and cases |
| **Not a graded exam** | Exercise is for development and feedback |

---

## Assessment Constraints

> **Reference section for future automation and test-design prompts. Only constraints stated in the assessment are listed.**

### Scope and Volume

1. Maximum **5–8 test cases per type**: manual, UI, and API (each).
2. Tags must include **`@Smoke`** and **`@regression`** within those limits.
3. Do **not** expand automation scope at the expense of planning artifacts, prompt history, or documentation.
4. Core project effort target: **5–10 focused hours**.

### Tools and Environment

5. Use **Playwright (Prism Framework)** and **Cursor**.
6. Manage Cursor usage within the **monthly limit**.
7. Automation must be runnable from **`readme.md`** instructions with only environment setup as manual prerequisite.

### SUT and Documented Flows

8. **UI SUT:** https://practicesoftwaretesting.com/
9. **API docs:** https://api.practicesoftwaretesting.com/api/documentation
10. UI example flows: **AC1** (registration/login/profile), **AC2** (browse → cart → quantity update → COD checkout → My Invoices).
11. API example flows: **AC1** (register → login → bearer token → cart), **AC2** (products → add to cart → verify cart → invoice).
12. Checkout payment method in examples: **`cash-on-delivery`**.
13. **Press Confirm twice** on the application to generate invoice (documented SUT behavior).

### Quality and Evidence

14. All test cases must have execution status **`Passed`**.
15. Include **execution reports** and execution evidence (logs, reports, screenshots, or API collections).
16. Prompt history must demonstrate **thoughtful, reviewed** AI use — not unreviewed copy-paste.
17. Maintain **traceability** from requirements to test scenarios/cases.
18. Cover **valid and invalid status transitions** (manual + API for state machine).

### Git and Submission

19. Submit via **public Git** repository; share URL.
20. Use **iterative commits and pushes** — not a single commit.
21. Follow **iterative prompting** aligned with iterative development.

### README Commands (Required)

22. Separate commands for **Smoke** and **Regression** test execution.
23. Document where **final reports** are generated.

---

## Core Acceptance Criteria Summary (QA Perspective)

Your Core submission should show that:

1. You can derive **clear test objectives and scope** from the application or tickets.
2. You have **traceable mapping** from requirements / state machine to test scenarios and cases.
3. You cover **valid and invalid status transitions** with tests (manual + API automation for the state machine).
4. UI tests verify key flows: create, list, view, update, comment, search, error handling.
5. API tests verify key flows: create, list, view, update, comment, search, error handling.
6. Test data is well-planned.
7. At least one automation suite runs from README without manual steps beyond environment setup.
8. Prompt history shows thoughtful AI use.

---

## What Good Looks Like (Assessment Criteria)

- Use AI to **augment** testing judgment, not replace it.
- Show a **clear, traceable line** from requirements to test design and automation.
- Demonstrate **iterative prompting** and careful review of AI output.
- Keep tests **maintainable and explainable**, not just auto-generated.
- Include **evidence of execution and logs**.

---

## Assumptions (Not Stated in Assessment)

The following are **not** explicit assessment requirements; they are working assumptions for this project:

| # | Assumption |
|---|------------|
| A1 | **“Sanity”** (Part B) and **“smoke”** (automation/readme) refer to the same test priority tier. |
| A2 | **JavaScript** is the Playwright language — assessment names Playwright but does not specify JS vs TS. |
| A3 | **`requirements/`** folder is a logical place for this document; the assessment requires the artifact, not this folder name. |
| A4 | **`execution-evidence/`** folder is optional naming for deliverable §8. |
| A5 | Example **`cart_id`** in the invoice payload is illustrative, not a fixed test data value. |
| A6 | **Selenium** mentioned alongside Playwright in PrismStructure description is an alternative example — tool expectation specifies **Playwright**. |
| A7 | Quick Tips (model strategy, Caveman skill, phase-wise flow) are **guidance**, not mandatory submission requirements. |

---

## Application-Specific Risk Notes (From Assessment Only)

| Risk / Behavior | Source | Impact on Testing |
|-----------------|--------|-------------------|
| Invoice requires **Confirm pressed twice** | Part B SUT notes | UI checkout/invoice tests must account for this behavior or risk false failures |
| Shared public hosted environment | **Assumption** — not stated in assessment; public git is required but shared SUT instability is not mentioned | May affect test data isolation |

> Only the double-confirm behavior is explicitly documented in the assessment. Other application risks (out-of-stock, token expiry, data pollution) are **not** in the assessment and should be derived separately during live SUT analysis if needed.
