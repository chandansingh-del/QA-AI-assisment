const { BasePage } = require('./BasePage');

/**
 * Invoice detail view — selectors not fully instrumented in SUT; uses semantic table structure.
 */
class InvoiceDetailPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle = page.getByTestId('page-title');
    this.invoiceNumberField = page.getByRole('textbox', { name: 'Invoice Number' });
    this.billingStreetField = page.getByRole('textbox', { name: 'Street' });
    this.billingCityField = page.getByRole('textbox', { name: 'City' });
    this.billingStateField = page.getByRole('textbox', { name: 'State' });
    this.lineRows = page.locator('table tbody tr');
  }

  /**
   * @param {string} invoicePath - e.g. `/account/invoices/{id}` from list navigation
   */
  async open(invoicePath) {
    const path = invoicePath.startsWith('/') ? invoicePath : `/account/invoices/${invoicePath}`;
    await this.goto(path);
  }

  /**
   * @param {string} productName
   * @returns {import('@playwright/test').Locator}
   */
  lineRow(productName) {
    return this.lineRows.filter({ hasText: productName });
  }
}

module.exports = { InvoiceDetailPage };
