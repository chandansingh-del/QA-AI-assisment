/**
 * Base API client — shared request helpers for Toolshop REST API.
 */
const { getConfig } = require('../utils/config');
const { ApiResponse } = require('./ApiResponse');

/**
 * @typedef {object} RequestOptions
 * @property {number} [expectedStatus] - Assert HTTP status when set (positive or negative tests).
 * @property {Record<string, string>} [headers]
 */

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

  /**
   * @param {string} token
   * @returns {this}
   */
  withToken(token) {
    return new this.constructor(this.request, token);
  }

  /**
   * @param {string} path
   * @param {RequestOptions & { data?: unknown; params?: Record<string, string | number> }} [options]
   * @returns {Promise<ApiResponse>}
   */
  async post(path, options = {}) {
    const { expectedStatus, headers: extraHeaders, data, params } = options;
    const response = await this.request.post(this.url(path), {
      data,
      params,
      headers: this.headers({ 'Content-Type': 'application/json', ...extraHeaders }),
    });
    return ApiResponse.wrap(response, expectedStatus);
  }

  /**
   * @param {string} path
   * @param {RequestOptions & { params?: Record<string, string | number> }} [options]
   * @returns {Promise<ApiResponse>}
   */
  async get(path, options = {}) {
    const { expectedStatus, headers: extraHeaders, params } = options;
    const response = await this.request.get(this.url(path), {
      params,
      headers: this.headers(extraHeaders),
    });
    return ApiResponse.wrap(response, expectedStatus);
  }

  /**
   * @param {string} path
   * @param {RequestOptions & { data?: unknown }} [options]
   * @returns {Promise<ApiResponse>}
   */
  async put(path, options = {}) {
    const { expectedStatus, headers: extraHeaders, data } = options;
    const response = await this.request.put(this.url(path), {
      data,
      headers: this.headers({ 'Content-Type': 'application/json', ...extraHeaders }),
    });
    return ApiResponse.wrap(response, expectedStatus);
  }

  /**
   * @param {string} path
   * @param {RequestOptions} [options]
   * @returns {Promise<ApiResponse>}
   */
  async delete(path, options = {}) {
    const { expectedStatus, headers: extraHeaders } = options;
    const response = await this.request.delete(this.url(path), {
      headers: this.headers(extraHeaders),
    });
    return ApiResponse.wrap(response, expectedStatus);
  }
}

module.exports = { BaseApi };
