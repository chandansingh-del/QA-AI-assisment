/**
 * Base API client — shared request helpers for Toolshop REST API.
 */
const { getConfig } = require('../utils/config');

class BaseApi {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   * @param {string} [token] - Optional bearer token
   */
  constructor(request, token = undefined) {
    this.request = request;
    this.apiBaseUrl = getConfig().apiBaseUrl;
    this.token = token;
  }

  /** @returns {Record<string, string>} */
  headers(extra = {}) {
    const base = { Accept: 'application/json', ...extra };
    if (this.token) {
      base.Authorization = `Bearer ${this.token}`;
    }
    return base;
  }

  url(path) {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiBaseUrl}${normalized}`;
  }

  withToken(token) {
    return new this.constructor(this.request, token);
  }
}

module.exports = { BaseApi };
