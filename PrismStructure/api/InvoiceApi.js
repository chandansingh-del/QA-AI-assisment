const { BaseApi } = require('./BaseApi');

/**
 * Invoice creation and retrieval.
 * Payloads: testData.buildInvoicePayload(cartId), buildInvoicePayloadMissingFields(), etc.
 */
class InvoiceApi extends BaseApi {
  /**
   * Authenticated invoice creation.
   * @param {object} payload - from testData.buildInvoicePayload(cartId)
   * @param {{ expectedStatus?: number }} [options]
   */
  async create(payload, options = {}) {
    return this.post('/invoices', {
      data: payload,
      expectedStatus: options.expectedStatus,
    });
  }

  /**
   * Guest checkout invoice.
   * @param {object} payload - InvoiceRequest + guest_email, guest_first_name, guest_last_name
   * @param {{ expectedStatus?: number }} [options]
   */
  async createGuest(payload, options = {}) {
    return this.post('/invoices/guest', {
      data: payload,
      expectedStatus: options.expectedStatus,
    });
  }

  /**
   * @param {Record<string, string | number>} [params]
   * @param {{ expectedStatus?: number }} [options]
   */
  async list(params = {}, options = {}) {
    return this.get('/invoices', {
      params,
      expectedStatus: options.expectedStatus,
    });
  }

  /**
   * @param {string} invoiceId
   * @param {{ expectedStatus?: number }} [options]
   */
  async getById(invoiceId, options = {}) {
    return this.get(`/invoices/${invoiceId}`, { expectedStatus: options.expectedStatus });
  }
}

module.exports = { InvoiceApi };
