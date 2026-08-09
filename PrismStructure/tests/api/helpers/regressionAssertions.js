/**
 * Shared assertion helpers for API regression (negative / boundary) tests.
 */
const { expect } = require('@playwright/test');

/**
 * @param {import('../../../api/ApiResponse').ApiResponse} response
 * @param {number} expectedStatus
 * @param {string} context
 */
function assertHttpStatus(response, expectedStatus, context) {
  expect(
    response.status,
    `${context}: expected HTTP ${expectedStatus} but received ${response.status}`
  ).toBe(expectedStatus);
}

/**
 * @param {unknown} body
 */
function assertJsonObject(body, context = 'Response body') {
  expect(body, `${context} should be a JSON object`).toBeTruthy();
  expect(typeof body, `${context} should be an object`).toBe('object');
  expect(Array.isArray(body), `${context} should not be an array`).toBe(false);
}

/**
 * Laravel-style field errors: top-level key or nested errors object.
 * @param {Record<string, unknown>} body
 * @param {string} field
 * @param {string} [context]
 */
function assertFieldValidationError(body, field, context = 'Validation response') {
  assertJsonObject(body, context);
  const topLevel = body[field];
  const nested = body.errors?.[field];
  const messages = Array.isArray(topLevel) ? topLevel : Array.isArray(nested) ? nested : null;
  expect(messages, `${context}: expected validation errors for "${field}"`).toBeTruthy();
  expect(messages.length, `${context}: "${field}" should have at least one message`).toBeGreaterThan(
    0
  );
  expect(typeof messages[0], `${context}: "${field}" message should be a string`).toBe('string');
}

/**
 * @param {Record<string, unknown>} body
 * @param {string} [context]
 */
function assertUnauthorizedBody(body, context = 'Unauthorized response') {
  assertJsonObject(body, context);
  const indicator = body.message ?? body.error;
  expect(indicator, `${context}: should include message or error`).toBeTruthy();
  expect(String(indicator).toLowerCase(), `${context}: should indicate unauthorized`).toContain(
    'unauthorized'
  );
}

/**
 * @param {Record<string, unknown>} body
 * @param {string} [context]
 */
function assertNotFoundBody(body, context = 'Not found response') {
  assertJsonObject(body, context);
  expect(body.message, `${context}: should include message`).toBeTruthy();
  expect(String(body.message).toLowerCase(), `${context}: message should mention not found`).toMatch(
    /not found/
  );
}

/**
 * @param {Record<string, unknown>} body
 * @param {string} field
 * @param {RegExp|string} pattern
 * @param {string} [context]
 */
function assertFieldErrorMatches(body, field, pattern, context = 'Validation response') {
  assertFieldValidationError(body, field, context);
  const messages = Array.isArray(body[field]) ? body[field] : body.errors[field];
  const matcher = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
  expect(
    messages.some((msg) => matcher.test(msg)),
    `${context}: "${field}" messages ${JSON.stringify(messages)} should match ${matcher}`
  ).toBe(true);
}

module.exports = {
  assertHttpStatus,
  assertJsonObject,
  assertFieldValidationError,
  assertUnauthorizedBody,
  assertNotFoundBody,
  assertFieldErrorMatches,
};
