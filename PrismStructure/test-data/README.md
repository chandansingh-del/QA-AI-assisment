# Test Data

Builders and constants live in **`testData.js`**.

## Quick start

```bash
cp ../.env.example ../.env   # set CUSTOMER_EMAIL, CUSTOMER_PASSWORD, REGISTRATION_PASSWORD
```

```javascript
const td = require('./testData');
const user = td.buildValidRegistrationUser();
const invoice = td.buildInvoicePayload(cartId);
```

## Guidelines

- Credentials: environment variables only (see `.env.example`)
- Product/cart IDs: resolve at runtime from API
- Unique emails: `td.uniqueEmail('reg')`
- Full strategy: `ai-prompts/test-data.md`
