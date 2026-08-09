#!/usr/bin/env node
/**
 * Basic API connectivity check — verifies core endpoints respond without creating test specs.
 * Run: node scripts/api-connectivity-check.js
 */
const { request } = require('@playwright/test');
const api = require('../api');
const testData = require('../test-data/testData');

async function check(label, fn) {
  try {
    await fn();
    console.log(`PASS  ${label}`);
    return true;
  } catch (error) {
    console.error(`FAIL  ${label}`);
    console.error(`      ${error.message}`);
    return false;
  }
}

async function main() {
  const { apiBaseUrl } = testData.getUrls();
  console.log(`Toolshop API connectivity check → ${apiBaseUrl}\n`);

  const ctx = await request.newContext({
    baseURL: apiBaseUrl,
    extraHTTPHeaders: { Accept: 'application/json' },
  });

  const productsApi = new api.ProductsApi(ctx);
  const cartApi = new api.CartApi(ctx);
  const authApi = new api.AuthApi(ctx);

  const results = [];

  results.push(
    await check('GET /products returns 200 with catalog data', async () => {
      const res = await productsApi.list({}, { expectedStatus: 200 });
      const body = await res.json();
      const items = body.data ?? body;
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Product catalog empty or unexpected shape');
      }
    })
  );

  results.push(
    await check('GET /products/search?q=Hammer returns 200', async () => {
      const res = await productsApi.search(testData.PRODUCT_SEARCH.hammer, {}, { expectedStatus: 200 });
      const body = await res.json();
      const items = body.data ?? body;
      if (!Array.isArray(items)) {
        throw new Error('Search response missing data array');
      }
    })
  );

  results.push(
    await check('POST /carts returns 201 with cart id', async () => {
      const { cartId } = await cartApi.createCart();
      if (!cartId) throw new Error('cart id missing');
    })
  );

  results.push(
    await check('POST /users/login (seeded customer) returns access_token', async () => {
      const credentials = testData.buildLoginPayloadSeededCustomer();
      const { accessToken } = await authApi.loginAndGetToken(credentials);
      if (!accessToken) throw new Error('access_token missing');

      const authedUsers = new api.UsersApi(ctx, accessToken);
      const meRes = await authedUsers.me({ expectedStatus: 200 });
      const me = await meRes.json();
      if (!me.email) throw new Error('GET /users/me missing email');
    })
  );

  results.push(
    await check('POST /payment/check (COD) returns 200', async () => {
      const paymentApi = new api.PaymentApi(ctx);
      const res = await paymentApi.check(testData.buildPaymentCheckCod(), { expectedStatus: 200 });
      const body = await res.json();
      if (!body.message) throw new Error('payment check response missing message');
    })
  );

  await ctx.dispose();

  const passed = results.filter(Boolean).length;
  const failed = results.length - passed;
  console.log(`\nSummary: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
