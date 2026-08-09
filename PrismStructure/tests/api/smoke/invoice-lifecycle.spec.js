/**
 * TC-API-002 | SC-10 | API AC2 — products, cart, verify, payment check, invoice
 */
const { test, expect, testData } = require('../../../fixtures');
const { getInStockSmokeProducts } = require('../../../utils/productResolver');
const {
  expectStatusOneOf,
  assertCartIdMatches,
  assertCartContainsItems,
  assertInvoiceRequiredFields,
  assertInvoiceLinesMatchCart,
  assertInvoiceListed,
} = require('../helpers/smokeAssertions');

test.describe('API Smoke — Purchase and invoice lifecycle', () => {
  test('products to cart verification to COD invoice and retrieval succeed @smoke', async ({
    request,
    authenticatedApi,
  }) => {
    const { apiBaseUrl } = testData.getUrls();
    const { productsApi, cartApi, invoiceApi, paymentApi } = authenticatedApi;
    const updatedQty = testData.QUANTITY_EDGE.multiItemSecondary;

    const { primary, secondary } = await getInStockSmokeProducts(request, apiBaseUrl);

    const catalogRes = await productsApi.list({}, { expectedStatus: 200 });
    const catalog = await catalogRes.json();
    const catalogItems = catalog.data ?? catalog;
    expect(catalogItems.length, 'Product catalog should not be empty').toBeGreaterThan(0);
    const catalogMatch = catalogItems.find((p) => p.id === primary.id);
    expect(catalogMatch, 'Selected product should exist in GET /products').toBeTruthy();
    expect(catalogMatch.in_stock, 'Selected product should be in stock').toBe(true);

    const searchRes = await productsApi.search(testData.PRODUCT_SEARCH.hammer, {}, {
      expectedStatus: 200,
    });
    const searchBody = await searchRes.json();
    const searchItems = searchBody.data ?? searchBody;
    expect(searchItems.length, 'Product search should return results').toBeGreaterThan(0);

    const detailRes = await productsApi.getById(primary.id, { expectedStatus: 200 });
    const productDetail = await detailRes.json();
    expect(productDetail.id, 'GET /products/{id} should return requested product').toBe(primary.id);
    expect(productDetail.in_stock, 'Product detail should confirm in_stock').toBe(true);

    const { cartId } = await cartApi.createCart();
    await cartApi.addItem(cartId, primary.id, 1, { expectedStatus: 200 });
    await cartApi.addItem(cartId, secondary.id, 1, { expectedStatus: 200 });
    await cartApi.updateQuantity(cartId, secondary.id, updatedQty, { expectedStatus: 200 });

    const cartRes = await cartApi.getCart(cartId, { expectedStatus: 200 });
    const cartBody = await cartRes.json();
    assertCartIdMatches(cartId, cartBody);
    assertCartContainsItems(cartBody, [
      { productId: primary.id, quantity: 1, name: primary.name },
      { productId: secondary.id, quantity: updatedQty, name: secondary.name },
    ]);

    const paymentRes = await paymentApi.check(testData.buildPaymentCheckCod(), {
      expectedStatus: 200,
    });
    const paymentBody = await paymentRes.json();
    expect(paymentBody.message, 'Payment check should return success message').toBeTruthy();

    const invoicePayload = testData.buildInvoicePayload(cartId);
    const createInvoiceRes = await invoiceApi.create(invoicePayload);
    expectStatusOneOf(createInvoiceRes, [200, 201], 'POST /invoices');
    const invoice = await createInvoiceRes.json();
    assertInvoiceRequiredFields(invoice, invoicePayload);

    const detailInvoiceRes = await invoiceApi.getById(invoice.id, { expectedStatus: 200 });
    const invoiceDetail = await detailInvoiceRes.json();
    expect(invoiceDetail.status, 'Invoice detail must include status').toBeTruthy();
    expect(invoiceDetail.id, 'Invoice detail id should match created invoice').toBe(invoice.id);
    expect(invoiceDetail.invoice_number, 'Invoice detail number should match create response').toBe(
      invoice.invoice_number
    );
    assertInvoiceLinesMatchCart(invoiceDetail, [
      { productId: primary.id, quantity: 1 },
      { productId: secondary.id, quantity: updatedQty },
    ]);

    const listRes = await invoiceApi.list({}, { expectedStatus: 200 });
    const listBody = await listRes.json();
    assertInvoiceListed(listBody, invoice.id);
  });
});
