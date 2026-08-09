const { BasePage } = require('./BasePage');

class ProductDetailPage extends BasePage {
  constructor(page) {
    super(page);
    this.productName = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.quantityInput = page.getByTestId('quantity');
    this.decreaseQuantityButton = page.getByTestId('decrease-quantity');
    this.increaseQuantityButton = page.getByTestId('increase-quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.outOfStockBadge = page.getByTestId('out-of-stock');
  }

  /**
   * @param {string} productPath - `/product/{id}` or bare product id
   */
  async open(productPath) {
    const path = productPath.startsWith('/')
      ? productPath
      : `/product/${productPath}`;
    await this.goto(path);
  }

  /**
   * @param {number} quantity
   */
  async setQuantity(quantity) {
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  /**
   * @param {number} [quantity=1]
   */
  async addToCartWithQuantity(quantity = 1) {
    if (quantity !== 1) {
      await this.setQuantity(quantity);
    }
    await this.addToCart();
  }
}

module.exports = { ProductDetailPage };
