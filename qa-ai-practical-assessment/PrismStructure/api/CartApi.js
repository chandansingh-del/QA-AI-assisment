const { BaseApi } = require('./BaseApi');

class CartApi extends BaseApi {
  async create() {
    return this.request.post(this.url('/carts'), {
      headers: this.headers({ 'Content-Type': 'application/json' }),
    });
  }

  async addItem(cartId, productId, quantity = 1) {
    return this.request.post(this.url(`/carts/${cartId}`), {
      data: { product_id: productId, quantity },
      headers: this.headers({ 'Content-Type': 'application/json' }),
    });
  }

  async get(cartId) {
    return this.request.get(this.url(`/carts/${cartId}`), {
      headers: this.headers(),
    });
  }

  async updateQuantity(cartId, productId, quantity) {
    return this.request.put(this.url(`/carts/${cartId}/product/quantity`), {
      data: { product_id: productId, quantity },
      headers: this.headers({ 'Content-Type': 'application/json' }),
    });
  }

  async removeItem(cartId, productId) {
    return this.request.delete(this.url(`/carts/${cartId}/product/${productId}`), {
      headers: this.headers(),
    });
  }
}

module.exports = { CartApi };
