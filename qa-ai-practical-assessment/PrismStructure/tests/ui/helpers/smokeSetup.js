/**
 * Shared setup helpers for UI smoke tests (no assertions).
 */
const { expect } = require('@playwright/test');
const testData = require('../../../test-data/testData');

/**
 * @param {import('../../pages/LoginPage').LoginPage} loginPage
 */
async function loginAsSeededCustomer(loginPage) {
  const credentials = testData.getSeededCustomerCredentials();
  await loginPage.open();
  await loginPage.login(credentials.email, credentials.password);
  return credentials;
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @returns {Promise<{ primary: object, secondary: object }>}
 */
async function resolveSmokeProducts(request) {
  const { getInStockSmokeProducts } = require('../../../utils/productResolver');
  const { apiBaseUrl } = testData.getUrls();
  return getInStockSmokeProducts(request, apiBaseUrl);
}

/**
 * @param {import('../../pages/ProductDetailPage').ProductDetailPage} productDetailPage
 * @param {import('@playwright/test').Page} page
 * @param {string} productId
 * @param {number} [quantity=1]
 */
async function addProductById(productDetailPage, page, productId, quantity = 1) {
  const badge = page.getByTestId('cart-quantity');
  const beforeText = (await badge.textContent().catch(() => null)) ?? '0';
  const beforeCount = Number.parseInt(beforeText, 10) || 0;

  await productDetailPage.open(productId);
  await productDetailPage.addToCartWithQuantity(quantity);

  await expect(badge).toHaveText(String(beforeCount + quantity), { timeout: 15_000 });
}

/**
 * Ensure seeded customer profile has billing fields required for invoice creation.
 * @param {import('../../pages/ProfilePage').ProfilePage} profilePage
 * @param {{
 *   street: string,
 *   city: string,
 *   state: string,
 *   country: string,
 *   postalCode: string,
 * }} billing
 */
async function ensureCustomerBillingProfile(profilePage, billing) {
  await profilePage.open();
  await profilePage.countryInput.fill(billing.country);
  await profilePage.postalCodeInput.fill(billing.postalCode);
  await profilePage.streetInput.fill(billing.street);
  await profilePage.cityInput.fill(billing.city);
  await profilePage.stateInput.fill(billing.state);
  await profilePage.updateProfileSubmit.click();

  await expect
    .poll(async () => {
      const profile = await profilePage.readProfileFields();
      return (
        profile.state === billing.state &&
        profile.postalCode === billing.postalCode &&
        profile.country === billing.country
      );
    })
    .toBe(true);
}

module.exports = {
  loginAsSeededCustomer,
  resolveSmokeProducts,
  addProductById,
  ensureCustomerBillingProfile,
};
