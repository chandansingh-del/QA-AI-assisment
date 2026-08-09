const { BaseApi } = require('./BaseApi');

class PaymentApi extends BaseApi {
  /**
   * @param {object} payload - from testData.buildPaymentCheckCod()
   */
  async check(payload) {
    return this.request.post(this.url('/payment/check'), {
      data: payload,
      headers: this.headers({ 'Content-Type': 'application/json' }),
    });
  }
}

module.exports = { PaymentApi };
