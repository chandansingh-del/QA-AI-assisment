const { BasePage } = require('./BasePage');

/**
 * Cart line items render on /checkout (not /cart when empty).
 */
class CartPage extends BasePage {
  constructor(page) {
    super(page);
    this.cartTotal = page.getByTestId('cart-total');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.proceedStep1 = page.getByTestId('proceed-1');
    this.proceedStep2 = page.getByTestId('proceed-2');
    this.proceedStep3 = page.getByTestId('proceed-3');
  }

  async open() {
    await this.goto('/checkout');
  }

  /**
   * @param {string} productName
   * @returns {import('@playwright/test').Locator}
   */
  lineRow(productName) {
    return this.page.getByRole('row').filter({ hasText: productName });
  }

  /**
   * @param {string} productName
   * @returns {import('@playwright/test').Locator}
   */
  lineTitle(productName) {
    return this.page.getByTestId('product-title').getByText(productName, { exact: true });
  }

  /**
   * @param {string} productName
   * @returns {import('@playwright/test').Locator}
   */
  lineQuantityInput(productName) {
    return this.lineRow(productName).getByRole('spinbutton');
  }

  /**
   * @param {string} productName
   * @returns {import('@playwright/test').Locator}
   */
  linePrice(productName) {
    return this.lineRow(productName).getByTestId('line-price');
  }

  /**
   * @param {string} productName
   * @param {number} quantity
   */
  async updateLineQuantity(productName, quantity) {
    const qtyInput = this.lineRow(productName).getByRole('spinbutton');
    await qtyInput.fill(String(quantity));
    await qtyInput.press('Tab');
  }

  async proceedFromCartReview() {
    await this.proceedStep1.click();
  }
}

module.exports = { CartPage };
