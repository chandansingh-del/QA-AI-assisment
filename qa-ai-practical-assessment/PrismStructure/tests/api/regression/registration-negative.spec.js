/**
 * TC-API-004 | SC-13, SC-05 (API) | Invalid registration data
 */
const { test, testData } = require('../../../fixtures');
const {
  assertHttpStatus,
  assertFieldValidationError,
  assertFieldErrorMatches,
} = require('../helpers/regressionAssertions');

test.describe('API Regression — Registration validation', () => {
  test('weak password, duplicate email, and missing required fields are rejected @regression', async ({
    usersApi,
  }) => {
    const weakRes = await usersApi.register(testData.buildWeakPasswordRegistration());
    assertHttpStatus(weakRes, 422, 'POST /users/register with weak password');
    const weakBody = await weakRes.json();
    assertFieldValidationError(weakBody, 'password', 'Weak password registration');
    assertFieldErrorMatches(
      weakBody,
      'password',
      /uppercase|lowercase|symbol|number|character/i,
      'Weak password registration'
    );

    const duplicateRes = await usersApi.register(testData.buildDuplicateEmailRegistration());
    assertHttpStatus(duplicateRes, 409, 'POST /users/register with duplicate email');
    const duplicateBody = await duplicateRes.json();
    assertFieldValidationError(duplicateBody, 'email', 'Duplicate email registration');
    assertFieldErrorMatches(
      duplicateBody,
      'email',
      /already exists/i,
      'Duplicate email registration'
    );

    const missingRes = await usersApi.register(testData.buildRegistrationMissingFields('email'));
    assertHttpStatus(missingRes, 422, 'POST /users/register without email');
    const missingBody = await missingRes.json();
    assertFieldValidationError(missingBody, 'email', 'Missing email registration');
    assertFieldErrorMatches(missingBody, 'email', /required/i, 'Missing email registration');
  });
});
