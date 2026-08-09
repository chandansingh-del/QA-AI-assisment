/**
 * Shared assertion helpers for API smoke tests.
 */
const { expect } = require('@playwright/test');
const testData = require('../../../test-data/testData');

/**
 * @param {import('../../../api/ApiResponse').ApiResponse} response
 * @param {number[]} acceptedStatuses
 * @param {string} context
 */
function expectStatusOneOf(response, acceptedStatuses, context) {
  expect(
    acceptedStatuses,
    `${context}: expected one of [${acceptedStatuses.join(', ')}] but received ${response.status}`
  ).toContain(response.status);
}

/**
 * @param {unknown} token
 * @param {string} [context]
 */
function assertBearerToken(token, context = 'Login response') {
  expect(token, `${context}: access_token must be present`).toBeTruthy();
  expect(typeof token, `${context}: access_token must be a string`).toBe('string');
  expect(String(token).length, `${context}: access_token must not be empty`).toBeGreaterThan(0);
}

/**
 * @param {object} user
 * @param {object} registration
 */
function assertUserMatchesRegistration(user, registration) {
  expect(user.email, 'GET /users/me email should match registered email').toBe(registration.email);
  expect(user.first_name, 'GET /users/me first_name should match registration').toBe(
    registration.first_name
  );
  expect(user.last_name, 'GET /users/me last_name should match registration').toBe(
    registration.last_name
  );
}

/**
 * @param {string} cartId
 * @param {object} cartBody
 */
function assertCartIdMatches(cartId, cartBody) {
  expect(cartBody.id, 'GET /carts/{id} should return the same cart id').toBe(cartId);
}

/**
 * @param {object} cartBody
 * @param {Array<{ productId: string, quantity: number, name?: string }>} expectedItems
 */
function assertCartContainsItems(cartBody, expectedItems) {
  expect(Array.isArray(cartBody.cart_items), 'Cart response should include cart_items array').toBe(
    true
  );
  expect(
    cartBody.cart_items.length,
    `Cart should contain ${expectedItems.length} line item(s)`
  ).toBe(expectedItems.length);

  for (const expected of expectedItems) {
    const line = cartBody.cart_items.find((item) => item.product_id === expected.productId);
    expect(line, `Cart missing product_id ${expected.productId}`).toBeTruthy();
    expect(line.quantity, `Quantity mismatch for product ${expected.productId}`).toBe(
      expected.quantity
    );
    if (expected.name) {
      expect(line.product?.name, `Product name mismatch for ${expected.productId}`).toBe(
        expected.name
      );
    }
  }
}

/**
 * @param {object} invoice
 * @param {object} invoicePayload
 */
function assertInvoiceRequiredFields(invoice, invoicePayload) {
  expect(invoice.id, 'Invoice response must include id').toBeTruthy();
  expect(invoice.invoice_number, 'Invoice response must include invoice_number').toMatch(/^INV-/);
  if (invoice.status !== undefined) {
    expect(invoice.status, 'Invoice response must include status').toBeTruthy();
  }
  expect(invoice.total, 'Invoice total must be greater than zero').toBeGreaterThan(0);
  expect(invoice.billing_street, 'billing_street should match request payload').toBe(
    invoicePayload.billing_street
  );
  expect(invoice.billing_city, 'billing_city should match request payload').toBe(
    invoicePayload.billing_city
  );
  expect(invoice.billing_state, 'billing_state should match request payload').toBe(
    invoicePayload.billing_state
  );
  expect(invoice.billing_country, 'billing_country should match request payload').toBe(
    invoicePayload.billing_country
  );
  expect(invoice.billing_postal_code, 'billing_postal_code should match request payload').toBe(
    invoicePayload.billing_postal_code
  );
}

/**
 * @param {object} invoiceDetail
 * @param {Array<{ productId: string, quantity: number }>} expectedItems
 */
function assertInvoiceLinesMatchCart(invoiceDetail, expectedItems) {
  expect(
    Array.isArray(invoiceDetail.invoicelines),
    'Invoice detail must include invoicelines array'
  ).toBe(true);
  expect(
    invoiceDetail.invoicelines.length,
    `Invoice should have ${expectedItems.length} line(s)`
  ).toBe(expectedItems.length);

  for (const expected of expectedItems) {
    const line = invoiceDetail.invoicelines.find((row) => row.product_id === expected.productId);
    expect(line, `Invoice missing line for product ${expected.productId}`).toBeTruthy();
    expect(line.quantity, `Invoice quantity mismatch for ${expected.productId}`).toBe(
      expected.quantity
    );
  }
}

/**
 * @param {object} listBody
 * @param {string} invoiceId
 */
function assertInvoiceListed(listBody, invoiceId) {
  const rows = listBody.data ?? listBody;
  expect(Array.isArray(rows), 'GET /invoices should return paginated data array').toBe(true);
  const match = rows.find((row) => row.id === invoiceId);
  expect(match, `Invoice ${invoiceId} should appear in GET /invoices list`).toBeTruthy();
  expect(match.invoice_number, 'Listed invoice should include invoice_number').toMatch(/^INV-/);
}

module.exports = {
  expectStatusOneOf,
  assertBearerToken,
  assertUserMatchesRegistration,
  assertCartIdMatches,
  assertCartContainsItems,
  assertInvoiceRequiredFields,
  assertInvoiceLinesMatchCart,
  assertInvoiceListed,
  BILLING_ADDRESS: testData.BILLING_ADDRESS,
};
