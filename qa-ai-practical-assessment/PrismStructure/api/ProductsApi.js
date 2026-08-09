const { BaseApi } = require('./BaseApi');

class ProductsApi extends BaseApi {
  async list(params = {}) {
    return this.request.get(this.url('/products'), {
      params,
      headers: this.headers(),
    });
  }

  async search(query, params = {}) {
    return this.request.get(this.url('/products/search'), {
      params: { q: query, ...params },
      headers: this.headers(),
    });
  }

  async getById(productId) {
    return this.request.get(this.url(`/products/${productId}`), {
      headers: this.headers(),
    });
  }
}

module.exports = { ProductsApi };
