/**
 * TC-UI-SMOKE-004 | SC-02 (checkout/invoice) | Maps to TC-MAN-002 (steps 9–17)
 * Validates double-confirm invoice generation (assessment requirement).
 */
const { test, expect, testData } = require('../../../fixtures');
const { loginAsSeededCustomer, resolveSmokeProducts, addProductById, ensureCustomerBillingProfile, clearAllCartLines } = require('../helpers/smokeSetup');

test.describe('Smoke — Checkout and invoice', () => {
  test('COD checkout with double-confirm creates invoice visible in My Invoices @smoke', async ({
    page,
    request,
    loginPage,
    profilePage,
    productDetailPage,
    cartPage,
    checkoutPage,
    invoicesPage,
    invoiceDetailPage,
  }) => {
    const { primary, secondary } = await resolveSmokeProducts(request);
    const billing = {
      ...testData.buildCheckoutBillingUi(),
      houseNumber: testData.buildPostcodeLookupParams().house_number,
    };
    const updatedQty = testData.QUANTITY_EDGE.multiItemSecondary;

    await loginAsSeededCustomer(loginPage);
    await clearAllCartLines(cartPage, page);
    await ensureCustomerBillingProfile(profilePage, billing);

    await addProductById(productDetailPage, page, primary.id, 1);
    await addProductById(productDetailPage, page, secondary.id, 1);

    await cartPage.open();
    await cartPage.updateLineQuantity(secondary.name, updatedQty);

    await checkoutPage.completeBillingAndPayment(cartPage, billing);
    await expect(checkoutPage.confirmButton).toBeEnabled();
    await checkoutPage.confirmOrderTwice(billing);

    await invoicesPage.open();
    await expect(invoicesPage.pageTitle).toContainText(/invoice/i);

    await expect
      .poll(async () => invoicesPage.invoiceRowByBillingStreet(billing.street).count(), {
        timeout: 30_000,
      })
      .toBeGreaterThan(0);

    await invoicesPage.openInvoiceByBillingStreet(billing.street);
    await expect(invoiceDetailPage.invoiceNumberField).toHaveValue(/INV-/i);
    await expect(invoiceDetailPage.lineRow(primary.name)).toBeVisible();
    await expect(invoiceDetailPage.lineRow(secondary.name)).toBeVisible();
    await expect(invoiceDetailPage.billingStreetField).toHaveValue(billing.street);
    await expect(invoiceDetailPage.billingCityField).toHaveValue(billing.city);
    await expect(invoiceDetailPage.billingStateField).toHaveValue(billing.state);
  });
});
