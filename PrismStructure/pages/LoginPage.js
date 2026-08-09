const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.loginForm = page.getByTestId('login-form');
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.loginSubmit = page.getByTestId('login-submit');
    this.loginError = page.getByTestId('login-error');
    this.registerLink = page.getByTestId('register-link');
  }

  async open() {
    await this.goto('/auth/login');
  }

  /**
   * @param {string} email
   * @param {string} password
   * @param {{ waitForSuccess?: boolean }} [options]
   */
  async login(email, password, options = {}) {
    const { waitForSuccess = true } = options;
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    const submit = this.loginSubmit.click();
    if (waitForSuccess) {
      await Promise.all([this.page.waitForURL(/\/account/), submit]);
    } else {
      await submit;
    }
  }
}

module.exports = { LoginPage };
