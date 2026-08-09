const { BaseApi } = require('./BaseApi');
const { UsersApi } = require('./UsersApi');
const { ProductsApi } = require('./ProductsApi');
const { CartApi } = require('./CartApi');
const { InvoiceApi } = require('./InvoiceApi');
const { PaymentApi } = require('./PaymentApi');

/**
 * Authentication — login and token lifecycle.
 * Payloads: testData.buildLoginPayload(), buildLoginPayloadSeededCustomer().
 */
class AuthApi extends BaseApi {
  /**
   * @param {{ email: string, password: string }} credentials
   * @param {{ expectedStatus?: number }} [options]
   */
  async login(credentials, options = {}) {
    return this.post('/users/login', {
      data: credentials,
      expectedStatus: options.expectedStatus,
    });
  }

  /**
   * @param {{ expectedStatus?: number }} [options]
   */
  async refresh(options = {}) {
    return this.get('/users/refresh', { expectedStatus: options.expectedStatus });
  }

  /**
   * Login and return token metadata. Asserts 200 by default.
   * @param {{ email: string, password: string }} credentials
   * @param {{ expectedStatus?: number }} [options]
   * @returns {Promise<{ accessToken: string, tokenType: string, expiresIn: number, response: import('./ApiResponse').ApiResponse }>}
   */
  async loginAndGetToken(credentials, options = {}) {
    const expectedStatus = options.expectedStatus ?? 200;
    const response = await this.login(credentials, { expectedStatus });
    const body = await response.json();
    return {
      accessToken: body.access_token,
      tokenType: body.token_type,
      expiresIn: body.expires_in,
      response,
    };
  }

  /**
   * Login with credentials from env and return authenticated service bundle.
   * @param {import('@playwright/test').APIRequestContext} request
   * @param {{ email: string, password: string }} credentials
   */
  static async createAuthenticatedSession(request, credentials) {
    const authApi = new AuthApi(request);
    const { accessToken } = await authApi.loginAndGetToken(credentials);
    if (!accessToken) {
      throw new Error('Login succeeded but access_token missing in response');
    }
    return {
      token: accessToken,
      credentials,
      authApi: authApi.withToken(accessToken),
      usersApi: new UsersApi(request, accessToken),
      productsApi: new ProductsApi(request, accessToken),
      cartApi: new CartApi(request, accessToken),
      invoiceApi: new InvoiceApi(request, accessToken),
      paymentApi: new PaymentApi(request, accessToken),
    };
  }
}

module.exports = { AuthApi };
