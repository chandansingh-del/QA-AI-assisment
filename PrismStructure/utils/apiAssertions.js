const { expect } = require('@playwright/test');

/**
 * Assert HTTP status and parse JSON body.
 * @param {import('@playwright/test').APIResponse} response
 * @param {number} expectedStatus
 */
async function expectStatus(response, expectedStatus) {
  expect(response.status(), `Expected status ${expectedStatus}`).toBe(expectedStatus);
  return response;
}

/**
 * @param {import('@playwright/test').APIResponse} response
 * @param {number} expectedStatus
 */
async function expectJson(response, expectedStatus) {
  await expectStatus(response, expectedStatus);
  const contentType = response.headers()['content-type'] ?? '';
  expect(contentType).toContain('application/json');
  return response.json();
}

module.exports = { expectStatus, expectJson };
