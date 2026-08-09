const { BasePage } = require('./BasePage');

class ProfilePage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle = page.getByTestId('page-title');
    this.firstNameInput = page.getByTestId('first-name');
    this.lastNameInput = page.getByTestId('last-name');
    this.emailInput = page.getByTestId('email');
    this.phoneInput = page.getByTestId('phone');
    this.streetInput = page.getByTestId('street');
    this.postalCodeInput = page.getByTestId('postal_code');
    this.cityInput = page.getByTestId('city');
    this.stateInput = page.getByTestId('state');
    this.countryInput = page.getByTestId('country');
    this.updateProfileSubmit = page.getByTestId('update-profile-submit');
  }

  async open() {
    await this.goto('/account/profile');
  }

  /**
   * Read current profile field values for test assertions.
   * @returns {Promise<Record<string, string>>}
   */
  async readProfileFields() {
    return {
      firstName: await this.firstNameInput.inputValue(),
      lastName: await this.lastNameInput.inputValue(),
      email: await this.emailInput.inputValue(),
      phone: await this.phoneInput.inputValue(),
      street: await this.streetInput.inputValue(),
      postalCode: await this.postalCodeInput.inputValue(),
      city: await this.cityInput.inputValue(),
      state: await this.stateInput.inputValue(),
      country: await this.countryInput.inputValue(),
    };
  }
}

module.exports = { ProfilePage };
