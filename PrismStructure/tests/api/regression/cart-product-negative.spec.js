/**
 * TC-API-005 | SC-14 (API boundary) | Invalid cart and product data
 */
const { test, expect, testData } = require('../../../fixtures');
const { getProductByName } = require('../../../utils/productResolver');
const {
  assertHttpStatus,
  assertFieldValidationError,
  assertFieldErrorMatches,
  assertNotFoundBody,
} = require('../helpers/regressionAssertions');

const NONEXISTENT_ID = '000000000000000000000000';

test.describe('API Regression — Cart and product boundaries', () => {
  test('invalid product, missing fields, quantity bounds, and unknown cart are rejected @regression', async ({
    request,
    cartApi,
    productsApi,
  }) => {
    const { apiBaseUrl } = testData.getUrls();
    const { cartId } = await cartApi.createCart();

    const invalidProductRes = await cartApi.addItem(cartId, NONEXISTENT_ID, 1, {
      expectedStatus: 422,
    });
    assertHttpStatus(invalidProductRes, 422, 'POST /carts/{id} with invalid product_id');
    const invalidProductBody = await invalidProductRes.json();
    assertFieldValidationError(invalidProductBody, 'product_id', 'Invalid product_id');
    assertFieldErrorMatches(invalidProductBody, 'product_id', /invalid/i, 'Invalid product_id');

    const missingFieldRes = await cartApi.post(`/carts/${cartId}`, {
      data: { quantity: 1 },
    });
    assertHttpStatus(missingFieldRes, 422, 'POST /carts/{id} without product_id');
    const missingFieldBody = await missingFieldRes.json();
    assertFieldValidationError(missingFieldBody, 'product_id', 'Missing product_id');
    assertFieldErrorMatches(missingFieldBody, 'product_id', /required/i, 'Missing product_id');

    const product = await getProductByName(
      request,
      apiBaseUrl,
      testData.PRODUCT_NAMES.inStockPrimary
    );
    const { cartId: qtyCartId } = await cartApi.createCart();
    await cartApi.addItem(qtyCartId, product.id, 1, { expectedStatus: 200 });

    const zeroQtyRes = await cartApi.updateQuantity(qtyCartId, product.id, testData.QUANTITY_EDGE.zero);
    assertHttpStatus(zeroQtyRes, 422, 'PUT cart quantity with zero');
    const zeroQtyBody = await zeroQtyRes.json();
    assertFieldValidationError(zeroQtyBody, 'quantity', 'Zero quantity');
    assertFieldErrorMatches(zeroQtyBody, 'quantity', /at least 1/i, 'Zero quantity');

    const negativeQtyRes = await cartApi.updateQuantity(
      qtyCartId,
      product.id,
      testData.QUANTITY_EDGE.negative
    );
    assertHttpStatus(negativeQtyRes, 422, 'PUT cart quantity with negative value');
    const negativeQtyBody = await negativeQtyRes.json();
    assertFieldValidationError(negativeQtyBody, 'quantity', 'Negative quantity');
    assertFieldErrorMatches(negativeQtyBody, 'quantity', /at least 1/i, 'Negative quantity');

    const unknownCartRes = await cartApi.getCart(NONEXISTENT_ID);
    assertHttpStatus(unknownCartRes, 404, 'GET /carts/{cartId} for unknown cart');
    assertNotFoundBody(await unknownCartRes.json(), 'Unknown cart');

    const unknownProductRes = await productsApi.getById(NONEXISTENT_ID);
    assertHttpStatus(unknownProductRes, 404, 'GET /products/{productId} for unknown product');
    assertNotFoundBody(await unknownProductRes.json(), 'Unknown product');

    const qtyCartAfter = await cartApi.getCart(qtyCartId, { expectedStatus: 200 });
    const cartBody = await qtyCartAfter.json();
    expect(cartBody.cart_items?.[0]?.quantity, 'Quantity should remain unchanged after rejected updates').toBe(1);
  });
});
