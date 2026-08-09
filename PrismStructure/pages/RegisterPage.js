const { BasePage } = require('./BasePage');

/** Maps logical field keys to {field}-error data-test suffixes. */
const FIELD_ERROR_IDS = Object.freeze({
  firstName: 'first-name-error',
  lastName: 'last-name-error',
  dob: 'dob-error',
  country: 'country-error',
  postalCode: 'postal_code-error',
  houseNumber: 'house_number-error',
  street: 'street-error',
  city: 'city-error',
  state: 'state-error',
  phone: 'phone-error',
  email: 'email-error',
  password: 'password-error',
});

class RegisterPage extends BasePage {
  constructor(page) {
    super(page);
    this.registerForm = page.getByTestId('register-form');
    this.firstNameInput = page.getByTestId('first-name');
    this.lastNameInput = page.getByTestId('last-name');
    this.dobInput = page.getByTestId('dob');
    this.countrySelect = page.getByTestId('country');
    this.postalCodeInput = page.getByTestId('postal_code');
    this.houseNumberInput = page.getByTestId('house_number');
    this.streetInput = page.getByTestId('street');
    this.cityInput = page.getByTestId('city');
    this.stateInput = page.getByTestId('state');
    this.phoneInput = page.getByTestId('phone');
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.registerSubmit = page.getByTestId('register-submit');
    this.postcodeLookupHint = page.getByTestId('postcode-lookup-hint');
    /** SUT shows plain text (no email-error data-test) when email is already registered. */
    this.duplicateEmailMessage = page.getByText(/customer with this email address already exists/i);
  }

  async open() {
    await this.goto('/auth/register');
  }

  /**
   * @param {string} fieldKey
   * @returns {import('@playwright/test').Locator}
   */
  fieldError(fieldKey) {
    const testId = FIELD_ERROR_IDS[fieldKey];
    if (!testId) {
      throw new Error(`Unknown register field error key: ${fieldKey}`);
    }
    return this.page.getByTestId(testId);
  }

  /**
   * Fill registration form from a caller-supplied user object (no embedded test data).
   * Only provided keys are filled.
   *
   * @param {Record<string, string>} user
   */
  async fillRegistration(user) {
    if (user.firstName !== undefined) await this.firstNameInput.fill(user.firstName);
    if (user.lastName !== undefined) await this.lastNameInput.fill(user.lastName);
    if (user.dob !== undefined) await this.dobInput.fill(user.dob);
    if (user.country !== undefined) await this.countrySelect.selectOption(user.country);
    if (user.postalCode !== undefined) await this.postalCodeInput.fill(user.postalCode);
    if (user.houseNumber !== undefined) await this.houseNumberInput.fill(user.houseNumber);
    if (user.street !== undefined) await this.streetInput.fill(user.street);
    if (user.city !== undefined) await this.cityInput.fill(user.city);
    if (user.state !== undefined) await this.stateInput.fill(user.state);
    if (user.phone !== undefined) await this.phoneInput.fill(user.phone);
    if (user.email !== undefined) await this.emailInput.fill(user.email);
    if (user.password !== undefined) await this.passwordInput.fill(user.password);
  }

  async submit() {
    await this.registerSubmit.click();
  }

  /**
   * @param {Record<string, string>} user
   */
  async register(user) {
    await this.fillRegistration(user);
    await this.submit();
  }
}

module.exports = { RegisterPage };
