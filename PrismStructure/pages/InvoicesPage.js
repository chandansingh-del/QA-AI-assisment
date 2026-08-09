const { BasePage } = require('./BasePage');

/**
 * My Invoices list. Invoice rows lack data-test hooks — table fallback per selector strategy §12.
 */
class InvoicesPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle = page.getByTestId('page-title');
    this.paginationPrev = page.getByTestId('pagination-prev');
    this.paginationNext = page.getByTestId('pagination-next');
    this.invoiceTableRows = page.locator('table tbody tr');
    this.invoiceNumberLinks = page.getByRole('link', { name: /INV-/i });
  }

  async open() {
    await this.goto('/account/invoices');
  }

  /**
   * @returns {import('@playwright/test').Locator}
   */
  invoiceRowByNumber(invoiceNumber) {
    return this.invoiceTableRows.filter({ hasText: invoiceNumber });
  }

  /**
   * @param {string} billingStreet
   * @returns {import('@playwright/test').Locator}
   */
  invoiceRowByBillingStreet(billingStreet) {
    return this.invoiceTableRows.filter({ hasText: billingStreet });
  }

  /**
   * @param {import('@playwright/test').Locator} row
   */
  async openInvoiceDetailsFromRow(row) {
    const detailsLink = row.getByRole('link', { name: /details/i });
    await Promise.all([
      this.page.waitForURL(/\/account\/invoices\/[^/]+$/),
      detailsLink.click(),
    ]);
  }

  async openInvoiceByNumber(invoiceNumber) {
    await this.openInvoiceDetailsFromRow(this.invoiceRowByNumber(invoiceNumber));
  }

  async openInvoiceByBillingStreet(billingStreet) {
    await this.openInvoiceDetailsFromRow(this.invoiceRowByBillingStreet(billingStreet).first());
  }

  async openLatestInvoice() {
    await this.openInvoiceDetailsFromRow(this.invoiceTableRows.first());
  }

  /**
   * @returns {Promise<string|null>}
   */
  async latestInvoiceNumber() {
    const text = await this.invoiceTableRows.first().textContent();
    const match = text?.match(/INV-\d+/);
    return match ? match[0] : null;
  }

  /**
   * @returns {Promise<number>}
   */
  async countInvoiceRows() {
    return this.invoiceTableRows.count();
  }
}

module.exports = { InvoicesPage };
