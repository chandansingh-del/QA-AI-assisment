const { BaseApi } = require('./BaseApi');

/**
 * Cart lifecycle — create, add, update, verify, remove.
 * Payloads: testData.buildAddToCartPayload(), buildUpdateQuantityPayload().
 */
class CartApi extends BaseApi {
  /**
   * @param {{ expectedStatus?: number }} [options]
   */
  async create(options = {}) {
    return this.post('/carts', { expectedStatus: options.expectedStatus ?? 201 });
  }

  /**
   * @param {string} cartId
   * @param {string} productId
   * @param {number} [quantity=1]
   * @param {{ expectedStatus?: number }} [options]
   */
  async addItem(cartId, productId, quantity = 1, options = {}) {
    return this.post(`/carts/${cartId}`, {
      data: { product_id: productId, quantity },
      expectedStatus: options.expectedStatus ?? 200,
    });
  }

  /**
   * @param {string} cartId
   * @param {{ expectedStatus?: number }} [options]
   */
  async getCart(cartId, options = {}) {
    return super.get(`/carts/${cartId}`, { expectedStatus: options.expectedStatus });
  }

  /** @deprecated Use getCart — kept for backward compatibility */
  async get(cartId, options = {}) {
    return this.getCart(cartId, options);
  }

  /**
   * @param {string} cartId
   * @param {string} productId
   * @param {number} quantity
   * @param {{ expectedStatus?: number }} [options]
   */
  async updateQuantity(cartId, productId, quantity, options = {}) {
    return this.put(`/carts/${cartId}/product/quantity`, {
      data: { product_id: productId, quantity },
      expectedStatus: options.expectedStatus,
    });
  }

  /**
   * @param {string} cartId
   * @param {string} productId
   * @param {{ expectedStatus?: number }} [options]
   */
  async removeItem(cartId, productId, options = {}) {
    return this.delete(`/carts/${cartId}/product/${productId}`, {
      expectedStatus: options.expectedStatus,
    });
  }

  /**
   * @param {string} cartId
   * @param {{ expectedStatus?: number }} [options]
   */
  async deleteCart(cartId, options = {}) {
    return this.delete(`/carts/${cartId}`, { expectedStatus: options.expectedStatus });
  }

  /**
   * Create cart and return parsed id. Asserts 201 by default.
   */
  async createCart() {
    const response = await this.create({ expectedStatus: 201 });
    const body = await response.json();
    if (!body.id) {
      throw new Error('POST /carts succeeded but response.id is missing');
    }
    return { cartId: body.id, response };
  }

  /**
   * Add item using test-data payload shape.
   * @param {string} cartId
   * @param {{ product_id: string, quantity: number }} payload
   * @param {{ expectedStatus?: number }} [options]
   */
  async addItemPayload(cartId, payload, options = {}) {
    return this.addItem(cartId, payload.product_id, payload.quantity, options);
  }
}

module.exports = { CartApi };
