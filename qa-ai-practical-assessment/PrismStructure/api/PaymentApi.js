const { BaseApi } = require('./BaseApi');

/**
 * Payment validation (pre-invoice step in checkout flow).
 * Payloads: testData.buildPaymentCheckCod().
 */
class PaymentApi extends BaseApi {
  /**
   * @param {object} payload - from testData.buildPaymentCheckCod()
   * @param {{ expectedStatus?: number }} [options]
   */
  async check(payload, options = {}) {
    return this.post('/payment/check', {
      data: payload,
      expectedStatus: options.expectedStatus,
    });
  }
}

module.exports = { PaymentApi };
