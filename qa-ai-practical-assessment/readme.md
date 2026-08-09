# QA AI Practical Assessment

Automation project for the **Practice Software Testing Toolshop** using Playwright (JavaScript), Prism-style structure, and Cursor AI.

## System Under Test

| Resource | URL |
|----------|-----|
| Web UI | https://practicesoftwaretesting.com/ |
| API Docs | https://api.practicesoftwaretesting.com/api/documentation |

## Prerequisites

- Node.js 18+ and npm
- Git
- Cursor IDE

## Project Structure

```
qa-ai-practical-assessment/
├── FunctionalTestCase.csv      # Manual test cases
├── PrismStructure/             # Playwright UI + API automation
├── project-info.md             # AI workflow documentation
├── readme.md                   # This file
├── requirements/               # Requirement and risk analysis
├── ai-prompts/                 # Prompt history by phase
├── execution-evidence/         # Screenshots, logs, reports
└── .cursor/                    # Cursor rules for QA conventions
```

## Setup

```bash
cd PrismStructure
npm install
npx playwright install
```

Copy environment template and fill in values locally (do not commit secrets):

```bash
cp .env.example .env
```

## Run Tests

```bash
# Smoke tests
npm run test:smoke

# Regression tests
npm run test:regression

# Full suite
npm test

# View HTML report
npm run report
```

> **Note:** npm scripts and Playwright config are placeholders until automation is implemented.

## Test Data

- Seeded accounts and data strategy: see `PrismStructure/test-data/README.md`
- Use unique generated emails for registration tests on the shared public environment

## Reports

Execution reports are generated under:

- `PrismStructure/playwright-report/`
- Evidence copies: `execution-evidence/`

## Assessment Notes

- Press **Confirm twice** on checkout to generate an invoice (documented SUT behavior)
- Target: 5–8 test cases each for manual, UI, and API tiers
- Tag tests with `@smoke` and `@regression`

## Repository

Public Git URL: _[Add after repository is created]_
