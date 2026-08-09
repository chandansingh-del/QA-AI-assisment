const { BasePage } = require('./BasePage');

class CartPage extends BasePage {
  constructor(page) {
    super(page);
    this.checkoutButton = page.getByRole('link', { name: /proceed to checkout|checkout/i })
      .or(page.getByRole('button', { name: /proceed to checkout|checkout/i }));
    this.cartLines = page.locator('table tbody tr, .cart-item, [data-test="cart-line"]');
    this.emptyMessage = page.getByText(/cart is empty|no items/i);
  }

  async open() {
    await this.goto('/cart');
  }

  /**
   * Update quantity for a line containing productName.
   * @param {string} productName
   * @param {number} quantity
   */
  async updateQuantity(productName, quantity) {
    const row = this.page.locator('tr, .cart-item').filter({ hasText: productName });
    const qtyInput = row.getByRole('spinbutton').or(row.locator('input[type="number"]'));
    await qtyInput.fill(String(quantity));
    await qtyInput.press('Tab');
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}

module.exports = { CartPage };
