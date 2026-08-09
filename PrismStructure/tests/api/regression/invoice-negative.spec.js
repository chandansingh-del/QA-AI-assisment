/**
 * TC-API-006 | SC-12 | Invalid invoice payload and authorization
 */
const { test, testData } = require('../../../fixtures');
const {
  assertHttpStatus,
  assertFieldValidationError,
  assertFieldErrorMatches,
  assertUnauthorizedBody,
  assertNotFoundBody,
} = require('../helpers/regressionAssertions');

test.describe('API Regression — Invoice validation', () => {
  test('unauthenticated, incomplete, and invalid-cart invoice requests are rejected @regression', async ({
    authenticatedApi,
    invoiceApi,
    cartApi,
  }) => {
    const { cartId } = await cartApi.createCart();

    const unauthRes = await invoiceApi.create(testData.buildInvoicePayload(cartId));
    assertHttpStatus(unauthRes, 401, 'POST /invoices without token');
    assertUnauthorizedBody(await unauthRes.json(), 'Unauthenticated invoice');

    const missingBillingRes = await authenticatedApi.invoiceApi.create(
      testData.buildInvoicePayloadMissingFields(cartId, 'billing_street')
    );
    assertHttpStatus(missingBillingRes, 422, 'POST /invoices without billing_street');
    const missingBillingBody = await missingBillingRes.json();
    assertFieldValidationError(missingBillingBody, 'billing_street', 'Missing billing_street');
    assertFieldErrorMatches(
      missingBillingBody,
      'billing_street',
      /required/i,
      'Missing billing_street'
    );

    const invalidCartRes = await authenticatedApi.invoiceApi.create(
      testData.buildInvoicePayloadInvalidCartId()
    );
    assertHttpStatus(invalidCartRes, 404, 'POST /invoices with unknown cart_id');
    assertNotFoundBody(await invalidCartRes.json(), 'Invalid cart_id invoice');

    const missingPaymentRes = await authenticatedApi.invoiceApi.create(
      testData.buildInvoicePayloadMissingFields(cartId, 'payment_method')
    );
    assertHttpStatus(missingPaymentRes, 422, 'POST /invoices without payment_method');
    const missingPaymentBody = await missingPaymentRes.json();
    assertFieldValidationError(missingPaymentBody, 'payment_method', 'Missing payment_method');
    assertFieldErrorMatches(
      missingPaymentBody,
      'payment_method',
      /required/i,
      'Missing payment_method'
    );
  });
});
