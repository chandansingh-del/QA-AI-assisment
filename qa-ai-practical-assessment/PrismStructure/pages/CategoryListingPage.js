const { BasePage } = require('./BasePage');

class CategoryListingPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle = page.getByTestId('page-title');
    this.sortSelect = page.getByTestId('sort');
    this.filtersPanel = page.getByTestId('filters');
  }

  /**
   * @param {string} slug - e.g. 'hand-tools', 'hammer'
   */
  async openCategory(slug) {
    const path = slug.startsWith('/') ? slug : `/category/${slug}`;
    await this.goto(path);
  }

  /**
   * Product name on listing card — prefers data-test, falls back to card heading.
   * @param {string} productName
   * @returns {import('@playwright/test').Locator}
   */
  productNameOnListing(productName) {
    return this.page.getByTestId('product-name').getByText(productName, { exact: true });
  }

  /**
   * @param {string} productName
   * @returns {import('@playwright/test').Locator}
   */
  productLink(productName) {
    return this.productNameOnListing(productName);
  }

  /**
   * @param {string} productName
   * @returns {import('@playwright/test').Locator}
   */
  productCard(productName) {
    return this.page.locator('[data-test^="product-"]').filter({
      has: this.productNameOnListing(productName),
    });
  }

  /**
   * @param {string} productName
   */
  async openProduct(productName) {
    await this.productNameOnListing(productName).click();
  }

  /**
   * @param {string} productName
   * @returns {import('@playwright/test').Locator}
   */
  productNameOnCard(productName) {
    return this.productNameOnListing(productName);
  }

  /**
   * @param {string} productName
   * @returns {import('@playwright/test').Locator}
   */
  productPriceOnCard(productName) {
    return this.productCard(productName).getByTestId('product-price');
  }

  /**
   * @param {string} optionLabel - visible sort option text
   */
  async sortBy(optionLabel) {
    await this.sortSelect.selectOption({ label: optionLabel });
  }
}

module.exports = { CategoryListingPage };
