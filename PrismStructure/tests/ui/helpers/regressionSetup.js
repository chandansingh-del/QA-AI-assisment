/**
 * Shared setup helpers for UI regression tests.
 */
const { expect } = require('@playwright/test');
const testData = require('../../../test-data/testData');

/**
 * Register a unique user and log in (empty cart, isolated session).
 * @param {import('@playwright/test').Page} page
 * @param {import('../../pages/RegisterPage').RegisterPage} registerPage
 * @param {import('../../pages/LoginPage').LoginPage} loginPage
 * @param {Record<string, string>} [overrides]
 */
async function registerAndLoginFreshUser(page, registerPage, loginPage, overrides = {}) {
  const user = testData.buildValidRegistrationUserUi(overrides);
  await registerPage.open();
  await registerPage.register(user);
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
  await loginPage.login(user.email, user.password);
  await expect(page).toHaveURL(/\/account/);
  return user;
}

module.exports = {
  registerAndLoginFreshUser,
};
