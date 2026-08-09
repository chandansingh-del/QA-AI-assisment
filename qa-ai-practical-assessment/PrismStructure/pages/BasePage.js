/**
 * Base page — shared navigation helpers for Toolshop UI.
 * Requires playwright.config.js: testIdAttribute: 'data-test'
 */
class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /**
   * @param {string} [path='/']
   */
  async goto(path = '/') {
    await this.page.goto(path);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * @param {string} testId
   * @returns {import('@playwright/test').Locator}
   */
  byTestId(testId) {
    return this.page.getByTestId(testId);
  }
}

module.exports = { BasePage };
