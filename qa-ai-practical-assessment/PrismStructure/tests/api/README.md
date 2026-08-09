# API Tests

Import fixtures from `../../fixtures`.

```javascript
const { test, expect } = require('../../fixtures');
const { expectJson } = require('../../utils/apiAssertions');

test('example @smoke', async ({ authenticatedApi, cartApi }) => {
  const cartRes = await authenticatedApi.cartApi.create();
  const body = await expectJson(cartRes, 201);
  expect(body.id).toBeTruthy();
});
```

Use `authenticatedApi` fixture for bearer-token flows.
Use raw `authApi` / `cartApi` for negative tests.

**Status:** Framework ready — specs to be added in next phase.
