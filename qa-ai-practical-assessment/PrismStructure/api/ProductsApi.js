const { BaseApi } = require('./BaseApi');

/**
 * Product catalog retrieval (public endpoints).
 */
class ProductsApi extends BaseApi {
  /**
   * @param {Record<string, string | number>} [params]
   * @param {{ expectedStatus?: number }} [options]
   */
  async list(params = {}, options = {}) {
    return this.get('/products', {
      params,
      expectedStatus: options.expectedStatus,
    });
  }

  /**
   * @param {string} query
   * @param {Record<string, string | number>} [params]
   * @param {{ expectedStatus?: number }} [options]
   */
  async search(query, params = {}, options = {}) {
    return this.get('/products/search', {
      params: { q: query, ...params },
      expectedStatus: options.expectedStatus,
    });
  }

  /**
   * @param {string} productId
   * @param {{ expectedStatus?: number }} [options]
   */
  async getById(productId, options = {}) {
    return this.get(`/products/${productId}`, { expectedStatus: options.expectedStatus });
  }

  /**
   * Return first page of products as parsed JSON. Asserts 200 by default.
   * @param {Record<string, string | number>} [params]
   */
  async listProducts(params = {}) {
    const response = await this.list(params, { expectedStatus: 200 });
    return response.json();
  }

  /**
   * Find first in-stock product from catalog (runtime ID resolution).
   * @param {string} [name] - Optional exact name filter
   */
  async findInStockProduct(name = undefined) {
    const body = await this.listProducts();
    const products = body.data ?? body;
    const inStock = products.filter((p) => p.in_stock);
    if (name) {
      const match = inStock.find((p) => p.name === name);
      if (!match) {
        throw new Error(`In-stock product not found by name: "${name}"`);
      }
      return match;
    }
    if (!inStock.length) {
      throw new Error('No in-stock products found in catalog');
    }
    return inStock[0];
  }
}

module.exports = { ProductsApi };
