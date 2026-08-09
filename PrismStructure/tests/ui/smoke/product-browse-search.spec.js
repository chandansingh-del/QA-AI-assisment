/**
 * TC-UI-SMOKE-002 | SC-02 (browse/search) | Maps to TC-MAN-002 (steps 2–4)
 */
const { test, expect, testData } = require('../../../fixtures');
const { loginAsSeededCustomer } = require('../helpers/smokeSetup');

test.describe('Smoke — Product browse and search', () => {
  test('logged-in user can browse hammer category and search for products @smoke', async ({
    page,
    loginPage,
    categoryListingPage,
    homePage,
    appHeader,
  }) => {
    await loginAsSeededCustomer(loginPage);

    await categoryListingPage.openCategory('hand-tools');
    await expect(categoryListingPage.pageTitle).toContainText(/hand tools/i);

    await categoryListingPage.openCategory('hammer');
    await expect(categoryListingPage.pageTitle).toContainText(/hammer/i);
    await expect(
      categoryListingPage.productNameOnListing(testData.PRODUCT_NAMES.inStockSecondary)
    ).toBeVisible();

    await appHeader.goToHome();
    await homePage.search(testData.PRODUCT_SEARCH.hammer);
    await expect(
      page.getByRole('heading', { name: /hammer/i }).first()
    ).toBeVisible();
  });
});
