const { BasePage } = require('./BasePage');

class RegisterPage extends BasePage {
  constructor(page) {
    super(page);
    this.firstNameInput = page.getByLabel(/first name/i);
    this.lastNameInput = page.getByLabel(/last name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/^password/i);
    this.registerButton = page.getByRole('button', { name: /register|sign up/i });
  }

  async open() {
    await this.goto('/auth/register');
  }

  /**
   * @param {{ firstName: string, lastName: string, email: string, password: string }} user
   */
  async register(user) {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.registerButton.click();
  }
}

module.exports = { RegisterPage };
