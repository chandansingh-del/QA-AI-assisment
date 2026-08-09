# UI Tests

Import fixtures from `../../fixtures` — not `@playwright/test` directly.

```javascript
const { test, expect } = require('../../fixtures');

test.describe('Feature @smoke', () => {
  test('example', async ({ loginPage }) => {
    // assertions in spec; actions in page objects
  });
});
```

Tag tests with `@smoke` or `@regression` in the title for grep filtering.

**Status:** Framework ready — specs to be added in next phase.
