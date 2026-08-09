const { expectStatus } = require('../utils/apiAssertions');

/**
 * Thin wrapper around Playwright APIResponse with optional status assertion.
 * Services return this so tests can inspect status, headers, and body consistently.
 */
class ApiResponse {
  /**
   * @param {import('@playwright/test').APIResponse} response
   * @param {number} [expectedStatus]
   */
  constructor(response, expectedStatus = undefined) {
    this.raw = response;
    this.status = response.status();
    this.ok = response.ok();
    this.url = response.url();
    this._expectedStatus = expectedStatus;
    /** @type {unknown} */
    this._parsedBody = undefined;
    this._bodyParsed = false;
  }

  /**
   * @param {import('@playwright/test').APIResponse} response
   * @param {number} [expectedStatus]
   * @returns {Promise<ApiResponse>}
   */
  static async wrap(response, expectedStatus = undefined) {
    const wrapped = new ApiResponse(response, expectedStatus);
    if (expectedStatus !== undefined) {
      await wrapped.assertStatus(expectedStatus);
    }
    return wrapped;
  }

  /**
   * @param {number} expectedStatus
   */
  async assertStatus(expectedStatus) {
    await expectStatus(this.raw, expectedStatus);
    return this;
  }

  headers() {
    return this.raw.headers();
  }

  /**
   * @returns {Promise<unknown>}
   */
  async json() {
    if (!this._bodyParsed) {
      this._parsedBody = await this.raw.json();
      this._bodyParsed = true;
    }
    return this._parsedBody;
  }

  /**
   * @returns {Promise<string>}
   */
  async text() {
    return this.raw.text();
  }

  /**
   * Parsed JSON when content-type is JSON; otherwise raw text.
   * @returns {Promise<unknown>}
   */
  async body() {
    const contentType = this.headers()['content-type'] ?? '';
    if (contentType.includes('application/json')) {
      return this.json();
    }
    return this.text();
  }

  /**
   * @template T
   * @param {number} expectedStatus
   * @returns {Promise<T>}
   */
  async expectJson(expectedStatus) {
    await this.assertStatus(expectedStatus);
    return /** @type {Promise<T>} */ (this.json());
  }
}

module.exports = { ApiResponse };
