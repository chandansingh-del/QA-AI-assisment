const { BasePage } = require('./BasePage');

class ProductDetailPage extends BasePage {
  constructor(page) {
    super(page);
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i });
    this.productTitle = page.locator('h1, h2, .product-name').first();
    this.stockStatus = page.getByText(/in stock|out of stock/i);
  }

  async addToCart() {
    await this.addToCartButton.click();
  }
}

module.exports = { ProductDetailPage };
