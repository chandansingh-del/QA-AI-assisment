/**
 * Resolve product IDs at runtime from catalog API (no hardcoded IDs).
 */
const { PRODUCT_NAMES } = require('../test-data/testData');

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} apiBaseUrl
 * @param {string} name
 * @returns {Promise<{ id: string, name: string, in_stock: boolean, price: number }>}
 */
async function getProductByName(request, apiBaseUrl, name) {
  const response = await request.get(`${apiBaseUrl}/products`, {
    params: { page: 1 },
  });
  if (!response.ok()) {
    throw new Error(`GET /products failed: ${response.status()}`);
  }
  const body = await response.json();
  const products = body.data ?? body;
  const match = products.find((p) => p.name === name);
  if (!match) {
    throw new Error(`Product not found: "${name}"`);
  }
  return match;
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} apiBaseUrl
 */
async function getInStockSmokeProducts(request, apiBaseUrl) {
  const primary = await getProductByName(request, apiBaseUrl, PRODUCT_NAMES.inStockPrimary);
  const secondary = await getProductByName(request, apiBaseUrl, PRODUCT_NAMES.inStockSecondary);
  if (!primary.in_stock || !secondary.in_stock) {
    throw new Error(
      `Smoke products must be in stock. Primary=${primary.in_stock} Secondary=${secondary.in_stock}`
    );
  }
  return { primary, secondary };
}

module.exports = { getProductByName, getInStockSmokeProducts };
