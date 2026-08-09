const { BasePage } = require('./BasePage');

class ProfilePage extends BasePage {
  constructor(page) {
    super(page);
    this.firstNameField = page.getByText(/first name/i).locator('..');
    this.profileHeading = page.getByRole('heading', { name: /profile|account/i });
  }

  async open() {
    await this.goto('/account/profile');
  }
}

module.exports = { ProfilePage };
