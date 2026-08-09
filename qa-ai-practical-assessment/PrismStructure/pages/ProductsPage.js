const { BasePage } = require('./BasePage');

class ProductsPage extends BasePage {
  constructor(page) {
    super(page);
    this.searchInput = page.getByPlaceholder(/search/i);
    this.productCards = page.locator('[data-test], .card, .product');
  }

  async open() {
    await this.goto('/products');
  }

  /** @param {string} term */
  async search(term) {
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
  }

  /** @param {string} productName */
  productLink(productName) {
    return this.page.getByRole('link', { name: productName });
  }

  async openProduct(productName) {
    await this.productLink(productName).click();
  }
}

module.exports = { ProductsPage };
