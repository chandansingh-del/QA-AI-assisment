const { BasePage } = require('./BasePage');

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.searchReset = page.getByTestId('search-reset');
  }

  async open() {
    await this.goto('/');
  }

  /**
   * @param {string} term
   */
  async search(term) {
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
  }

  async clearSearch() {
    await this.searchReset.click();
  }
}

module.exports = { HomePage };
