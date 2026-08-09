# AI Prompts – Test Data

Prompts used to generate test data for UI + API.

---

## Entry Template

### Entry 1

- **Prompt:**
- **AI Response Summary:**
- **Validation Notes:** _(how you verified data suitability on the live SUT)_

---

## Test Data Principles

- Use unique emails for registration (timestamp or faker)
- Select in-stock products for cart/checkout flows
- Create a fresh cart per API test run
- Load credentials from environment variables, not source code
