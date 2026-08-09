const { BaseApi } = require('./BaseApi');

class InvoiceApi extends BaseApi {
  /**
   * @param {object} payload - from testData.buildInvoicePayload(cartId)
   */
  async create(payload) {
    return this.request.post(this.url('/invoices'), {
      data: payload,
      headers: this.headers({ 'Content-Type': 'application/json' }),
    });
  }

  async list() {
    return this.request.get(this.url('/invoices'), {
      headers: this.headers(),
    });
  }

  async getById(invoiceId) {
    return this.request.get(this.url(`/invoices/${invoiceId}`), {
      headers: this.headers(),
    });
  }
}

module.exports = { InvoiceApi };
