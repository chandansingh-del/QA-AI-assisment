/**
 * Playwright custom fixtures — inject page objects and API services.
 *
 * Usage in specs:
 *   const { test, expect } = require('../../fixtures');
 */
const { test: base, expect } = require('@playwright/test');
const pages = require('../pages');
const api = require('../api');
const testData = require('../test-data/testData');

/** @typedef {import('@playwright/test').APIRequestContext} APIRequestContext */

const test = base.extend({
  // ---- Page objects (UI) ----
  appHeader: async ({ page }, use) => {
    await use(new pages.AppHeader(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new pages.LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new pages.RegisterPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new pages.HomePage(page));
  },
  categoryListingPage: async ({ page }, use) => {
    await use(new pages.CategoryListingPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new pages.ProductsPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new pages.ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new pages.CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new pages.CheckoutPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new pages.ProfilePage(page));
  },
  invoicesPage: async ({ page }, use) => {
    await use(new pages.InvoicesPage(page));
  },
  invoiceDetailPage: async ({ page }, use) => {
    await use(new pages.InvoiceDetailPage(page));
  },

  // ---- API service classes ----
  authApi: async ({ request }, use) => {
    await use(new api.AuthApi(request));
  },
  usersApi: async ({ request }, use) => {
    await use(new api.UsersApi(request));
  },
  productsApi: async ({ request }, use) => {
    await use(new api.ProductsApi(request));
  },
  cartApi: async ({ request }, use) => {
    await use(new api.CartApi(request));
  },
  invoiceApi: async ({ request }, use) => {
    await use(new api.InvoiceApi(request));
  },
  paymentApi: async ({ request }, use) => {
    await use(new api.PaymentApi(request));
  },

  /**
   * Authenticated API session — returns token + typed API clients.
   * Independent per test; uses seeded customer from .env.
   */
  authenticatedApi: async ({ request }, use) => {
    const credentials = testData.buildLoginPayloadSeededCustomer();
    const session = await api.AuthApi.createAuthenticatedSession(request, credentials);
    await use(session);
  },

  /**
   * UI session logged in as seeded customer.
   * Navigates via login page — no storage state file required for now.
   */
  authenticatedPage: async ({ page, loginPage }, use) => {
    const credentials = testData.getSeededCustomerCredentials();
    await loginPage.open();
    await loginPage.login(credentials.email, credentials.password);
    await use({ page, credentials });
  },
});

module.exports = { test, expect, testData };
