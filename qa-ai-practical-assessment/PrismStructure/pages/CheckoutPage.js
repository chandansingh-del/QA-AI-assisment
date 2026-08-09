const { BasePage } = require('./BasePage');
const { expect } = require('@playwright/test');

const PAYMENT_CASH_ON_DELIVERY = 'cash-on-delivery';

class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);
    this.streetInput = page.getByTestId('street');
    this.cityInput = page.getByTestId('city');
    this.stateInput = page.getByTestId('state');
    this.countrySelect = page.getByTestId('country');
    this.houseNumberInput = page.getByTestId('house_number');
    this.postalCodeInput = page.getByTestId('postal_code');
    this.postcodeLookupHint = page.getByTestId('postcode-lookup-hint');
    this.paymentMethodSelect = page.getByTestId('payment-method');
    this.proceedStep2 = page.getByTestId('proceed-2');
    this.proceedStep3 = page.getByTestId('proceed-3');
    this.confirmButton = page.getByTestId('finish');
  }

  async open() {
    await this.goto('/checkout');
  }

  /**
   * @returns {Promise<{ street: string, city: string, state: string, postalCode: string }>}
   */
  async readBillingFields() {
    return {
      street: await this.streetInput.inputValue(),
      city: await this.cityInput.inputValue(),
      state: await this.stateInput.inputValue(),
      postalCode: await this.postalCodeInput.inputValue(),
    };
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @param {string} value
   */
  async syncInputValue(locator, value) {
    await locator.evaluate((el) => {
      el.removeAttribute('disabled');
      el.removeAttribute('readonly');
    });
    await locator.fill(value, { force: true });
    await locator.dispatchEvent('input');
    await locator.dispatchEvent('change');
    await locator.blur();
  }

  /**
   * @param {{
   *   street: string,
   *   city: string,
   *   state: string,
   *   country: string,
   *   postalCode: string,
   *   houseNumber?: string,
   * }} billing
   * @returns {Promise<{ street: string, city: string, state: string, postalCode: string }>}
   */
  async fillBilling(billing) {
    await this.postalCodeInput.waitFor({ state: 'visible' });
    await this.countrySelect.waitFor({ state: 'visible' });
    await expect(this.streetInput).not.toHaveValue('');

    await expect
      .poll(async () => this.countrySelect.locator('option').count())
      .toBeGreaterThan(1);
    await expect
      .poll(async () => {
        await this.countrySelect.selectOption({ value: billing.country });
        return this.countrySelect.inputValue();
      })
      .toBe(billing.country);

    await this.syncInputValue(this.postalCodeInput, billing.postalCode);

    if (billing.houseNumber !== undefined) {
      await this.syncInputValue(this.houseNumberInput, billing.houseNumber);
      await expect.poll(async () => this.streetInput.inputValue()).not.toBe('');
      await this.syncInputValue(this.stateInput, billing.state);
    } else {
      await this.syncInputValue(this.streetInput, billing.street);
      await this.syncInputValue(this.cityInput, billing.city);
      await this.syncInputValue(this.stateInput, billing.state);
    }

    const resolved = await this.readBillingFields();
    await expect(this.stateInput).toHaveValue(billing.state);
    await expect(this.postalCodeInput).toHaveValue(billing.postalCode);
    await expect(this.proceedStep3).toBeEnabled({ timeout: 15_000 });
    await this.proceedStep3.click();

    return this.readBillingFields();
  }

  /**
   * @param {string} [methodValue='cash-on-delivery']
   */
  async selectPaymentMethod(methodValue = PAYMENT_CASH_ON_DELIVERY) {
    await this.paymentMethodSelect.selectOption(methodValue);
  }

  async selectCashOnDelivery() {
    await this.selectPaymentMethod(PAYMENT_CASH_ON_DELIVERY);
  }

  async proceedFromBilling() {
    await this.proceedStep3.click();
  }

  /** Assessment requirement: invoice requires Confirm clicked twice. */
  async confirmOrderTwice() {
    await expect(this.confirmButton).toBeEnabled();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes('/payment/check') && response.request().method() === 'POST'
      ),
      this.confirmButton.click(),
    ]);
    await this.page.getByText(/payment was successful/i).waitFor({ state: 'visible', timeout: 15_000 });

    await expect(this.confirmButton).toBeEnabled({ timeout: 15_000 });
    const invoiceResponse = await Promise.all([
      this.page.waitForResponse(
        (response) => /\/invoices$/.test(response.url()) && response.request().method() === 'POST',
        { timeout: 20_000 }
      ),
      this.confirmButton.click(),
    ]).then(([response]) => response);

    if (!invoiceResponse.ok()) {
      const body = await invoiceResponse.text().catch(() => '');
      throw new Error(`Invoice creation failed (${invoiceResponse.status()}): ${body}`);
    }
  }

  async confirmOrderOnce() {
    await this.confirmButton.click();
  }

  /**
   * Wizard: cart (proceed-1) → sign-in (proceed-2) → billing (proceed-3) → payment.
   * @param {import('./CartPage').CartPage} cartPage
   * @param {{
   *   street: string,
   *   city: string,
   *   state: string,
   *   country: string,
   *   postalCode: string,
   *   houseNumber?: string,
   * }} billing
   * @returns {Promise<{ street: string, city: string, state: string, postalCode: string }>}
   */
  async completeBillingAndPayment(cartPage, billing) {
    await cartPage.proceedFromCartReview();
    await cartPage.proceedStep2.click();
    await expect(this.streetInput).toHaveValue(/./, { timeout: 15_000 });
    const resolvedBilling = await this.fillBilling(billing);
    await this.selectCashOnDelivery();
    return resolvedBilling;
  }
}

module.exports = { CheckoutPage };
