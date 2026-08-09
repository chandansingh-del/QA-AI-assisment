const { BasePage } = require('./BasePage');

class InvoicesPage extends BasePage {
  constructor(page) {
    super(page);
    this.invoiceRows = page.locator('table tbody tr, .invoice-row, [data-test="invoice-row"]');
    this.invoiceNumbers = page.getByText(/INV-/i);
  }

  async open() {
    await this.goto('/account/invoices');
  }

  async openLatestInvoice() {
    await this.invoiceRows.first().click();
  }
}

module.exports = { InvoicesPage };
