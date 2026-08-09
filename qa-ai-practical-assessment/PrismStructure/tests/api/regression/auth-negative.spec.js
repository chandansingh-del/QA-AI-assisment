/**
 * TC-API-003 | SC-04 | Invalid authentication and unauthorized access
 */
const { test, testData } = require('../../../fixtures');
const {
  assertHttpStatus,
  assertUnauthorizedBody,
} = require('../helpers/regressionAssertions');

test.describe('API Regression — Authentication', () => {
  test('invalid credentials and missing or invalid tokens are rejected @regression', async ({
    authApi,
    usersApi,
    invoiceApi,
    cartApi,
  }) => {
    const invalidLogin = testData.buildInvalidLoginPayload('wrongPassword');
    const loginRes = await authApi.login(invalidLogin);
    assertHttpStatus(loginRes, 401, 'POST /users/login with wrong password');
    assertUnauthorizedBody(await loginRes.json(), 'Invalid login');

    const meUnauthRes = await usersApi.me();
    assertHttpStatus(meUnauthRes, 401, 'GET /users/me without token');
    assertUnauthorizedBody(await meUnauthRes.json(), 'Unauthenticated profile');

    const invalidTokenUsers = usersApi.withToken('invalid-token-not-a-jwt');
    const meInvalidRes = await invalidTokenUsers.me();
    assertHttpStatus(meInvalidRes, 401, 'GET /users/me with invalid token');
    assertUnauthorizedBody(await meInvalidRes.json(), 'Invalid token profile');

    const { cartId } = await cartApi.createCart();
    const invoiceRes = await invoiceApi.create(testData.buildInvoicePayload(cartId));
    assertHttpStatus(invoiceRes, 401, 'POST /invoices without token');
    assertUnauthorizedBody(await invoiceRes.json(), 'Unauthenticated invoice');
  });
});
