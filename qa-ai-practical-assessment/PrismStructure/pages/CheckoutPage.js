const { BasePage } = require('./BasePage');

class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);
    this.streetInput = page.getByLabel(/street/i);
    this.cityInput = page.getByLabel(/city/i);
    this.stateInput = page.getByLabel(/state/i);
    this.countryInput = page.getByLabel(/country/i);
    this.postalCodeInput = page.getByLabel(/postal|zip/i);
    this.cashOnDeliveryOption = page.getByLabel(/cash on delivery/i)
      .or(page.getByText(/cash on delivery/i));
    this.continueButton = page.getByRole('button', { name: /continue|next|confirm/i });
    this.confirmButton = page.getByRole('button', { name: /^confirm$/i });
  }

  async open() {
    await this.goto('/checkout');
  }

  /**
   * @param {{ street: string, city: string, state: string, country: string, postalCode: string }} billing
   */
  async fillBilling(billing) {
    await this.streetInput.fill(billing.street);
    await this.cityInput.fill(billing.city);
    await this.stateInput.fill(billing.state);
    await this.countryInput.fill(billing.country);
    await this.postalCodeInput.fill(billing.postalCode);
  }

  async selectCashOnDelivery() {
    await this.cashOnDeliveryOption.check().catch(async () => {
      await this.cashOnDeliveryOption.click();
    });
  }

  async continueToConfirmation() {
    await this.continueButton.click();
  }

  /** Assessment requirement: invoice requires Confirm clicked twice. */
  async confirmOrderTwice() {
    await this.confirmButton.click();
    await this.confirmButton.click();
  }

  async confirmOrderOnce() {
    await this.confirmButton.click();
  }
}

module.exports = { CheckoutPage };
