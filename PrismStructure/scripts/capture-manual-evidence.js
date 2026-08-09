#!/usr/bin/env node
/**
 * Capture manual execution evidence for TC-MAN-007 (OOS) and TC-MAN-008 (logout/session).
 * Not a Playwright test spec — keeps manual case count within assessment limits.
 *
 * Run from PrismStructure/: node scripts/capture-manual-evidence.js
 */
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { chromium } = require('playwright');
const { request, devices } = require('@playwright/test');
const testData = require('../test-data/testData');
const { getProductByName } = require('../utils/productResolver');

const OUT_DIR = path.resolve(__dirname, '../execution-evidence/manual');
const DATE = new Date().toISOString().slice(0, 10);

/** @param {import('playwright').Page} page */
function testId(page, id) {
  return page.locator(`[data-test="${id}"]`);
}

async function saveScreenshot(page, name) {
  const file = path.join(OUT_DIR, `${DATE}_${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`Saved ${path.relative(process.cwd(), file)}`);
  return file;
}

/** @param {import('playwright').Page} page */
async function loginAsSeededCustomer(page) {
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await testId(page, 'login-form').waitFor({ state: 'visible', timeout: 60_000 });
  const { email, password } = testData.getSeededCustomerCredentials();
  await testId(page, 'email').fill(email);
  await testId(page, 'password').fill(password);
  await Promise.all([
    page.waitForURL(/\/account/),
    testId(page, 'login-submit').click(),
  ]);
}

/** @param {import('playwright').Page} page */
async function captureOosEvidence(page, apiRequest, apiBaseUrl) {
  console.log('\nTC-MAN-007 — Out-of-stock add-to-cart blocked');

  const product = await getProductByName(apiRequest, apiBaseUrl, testData.PRODUCT_NAMES.outOfStock);
  if (product.in_stock) {
    throw new Error(`Expected "${product.name}" to be out of stock before capture`);
  }

  await loginAsSeededCustomer(page);
  await page.goto(`/product/${product.id}`, { waitUntil: 'domcontentloaded' });

  await testId(page, 'out-of-stock').waitFor({ state: 'visible' });
  const addDisabled = await testId(page, 'add-to-cart').isDisabled();
  if (!addDisabled) {
    throw new Error('Add to cart should be disabled for out-of-stock product');
  }

  await saveScreenshot(page, 'TC-MAN-007_oos-product-detail');

  await page.goto('/cart', { waitUntil: 'domcontentloaded' });
  const hasOosLine = await testId(page, 'product-title')
    .filter({ hasText: testData.PRODUCT_NAMES.outOfStock })
    .isVisible()
    .catch(() => false);
  if (hasOosLine) {
    throw new Error('Out-of-stock product must not appear as checkout-ready cart line');
  }

  const cartEmpty = !(await testId(page, 'product-title').isVisible().catch(() => false));
  await saveScreenshot(page, 'TC-MAN-007_cart-after-oos-attempt');
  console.log(`PASS  TC-MAN-007 (cart empty: ${cartEmpty})`);
}

/** @param {import('playwright').Page} page */
async function captureLogoutEvidence(page) {
  console.log('\nTC-MAN-008 — Logout clears session');

  await loginAsSeededCustomer(page);
  await page.goto('/account/profile', { waitUntil: 'domcontentloaded' });
  await testId(page, 'first-name').waitFor({ state: 'visible' });
  await saveScreenshot(page, 'TC-MAN-008_profile-before-logout');

  await testId(page, 'nav-menu').click();
  await testId(page, 'nav-sign-out').click();
  await testId(page, 'login-form').waitFor({ state: 'visible' });

  await page.goto('/account/profile', { waitUntil: 'domcontentloaded' });
  await testId(page, 'login-form').waitFor({ state: 'visible' });
  await saveScreenshot(page, 'TC-MAN-008_profile-after-logout');

  await page.goto('/account/invoices', { waitUntil: 'domcontentloaded' });
  await testId(page, 'login-form').waitFor({ state: 'visible' });
  await saveScreenshot(page, 'TC-MAN-008_invoices-after-logout');

  console.log('PASS  TC-MAN-008');
}

async function main() {
  const { baseUrl, apiBaseUrl } = testData.getUrls();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['Desktop Chrome'],
    baseURL: baseUrl,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);

  const apiRequest = await request.newContext({
    baseURL: apiBaseUrl,
    extraHTTPHeaders: { Accept: 'application/json' },
  });

  try {
    await captureOosEvidence(page, apiRequest, apiBaseUrl);
    await captureLogoutEvidence(page);
    console.log(`\nManual evidence saved under ${path.relative(process.cwd(), OUT_DIR)}/`);
  } finally {
    await apiRequest.dispose();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
