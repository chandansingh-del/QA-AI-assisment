/**
 * TC-UI-REG-003 | SC-06 | Maps to TC-MAN-005
 * Authoritative negative for double-confirm rule — one Confirm must not create an invoice.
 */
const { test, expect, testData } = require('../../../fixtures');
const {
  loginAsSeededCustomer,
  addProductById,
  ensureCustomerBillingProfile,
  clearAllCartLines,
} = require('../helpers/smokeSetup');
const { getProductByName } = require('../../../utils/productResolver');

test.describe('Regression — Single confirm', () => {
  test('one Confirm click does not add a new invoice in My Invoices @regression', async ({
    page,
    request,
    loginPage,
    profilePage,
    productDetailPage,
    cartPage,
    checkoutPage,
    invoicesPage,
  }) => {
    const billing = {
      ...testData.buildCheckoutBillingUi(),
      houseNumber: testData.buildPostcodeLookupParams().house_number,
    };
    const { apiBaseUrl } = testData.getUrls();
    const primary = await getProductByName(
      request,
      apiBaseUrl,
      testData.PRODUCT_NAMES.inStockPrimary
    );

    await loginAsSeededCustomer(loginPage);
    await clearAllCartLines(cartPage, page);
    await ensureCustomerBillingProfile(profilePage, billing);

    await invoicesPage.open();
    const invoiceCountBefore = await invoicesPage.countInvoiceRows();

    await addProductById(productDetailPage, page, primary.id, 1);
    await cartPage.open();
    const resolvedBilling = await checkoutPage.completeBillingAndPayment(cartPage, billing);
    await expect(checkoutPage.confirmButton).toBeEnabled();
    await checkoutPage.ensureBillingBoundForInvoice(billing);

    let invoicePostCount = 0;
    page.on('request', (req) => {
      if (req.method() === 'POST' && /\/invoices$/.test(req.url())) {
        invoicePostCount += 1;
      }
    });

    await checkoutPage.confirmOrderOnce();
    await expect(page.getByText(/payment was successful/i)).toBeVisible({ timeout: 15_000 });

    await expect.poll(() => invoicePostCount).toBe(0);

    await invoicesPage.open();
    await expect(invoicesPage.pageTitle).toContainText(/invoice/i);
    await expect(invoicesPage.invoiceTableRows).toHaveCount(invoiceCountBefore);

    await clearAllCartLines(cartPage, page);
  });
});
