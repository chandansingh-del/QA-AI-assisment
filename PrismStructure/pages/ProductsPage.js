/**
 * @deprecated Use CategoryListingPage — kept as backward-compatible alias for fixtures.
 */
const { CategoryListingPage } = require('./CategoryListingPage');

class ProductsPage extends CategoryListingPage {
  /** @deprecated Use openCategory(slug) — /products redirects to home. */
  async open() {
    await this.openCategory('hand-tools');
  }
}

module.exports = { ProductsPage };
