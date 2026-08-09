/**
 * Resolve product IDs at runtime from catalog API (no hardcoded IDs).
 */
const { PRODUCT_NAMES, PRODUCT_NAME_FALLBACKS } = require('../test-data/testData');

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} apiBaseUrl
 * @param {number} [maxPages=10]
 * @returns {Promise<Array<{ id: string, name: string, in_stock: boolean, price: number }>>}
 */
async function fetchAllProducts(request, apiBaseUrl, maxPages = 10) {
  const all = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const response = await request.get(`${apiBaseUrl}/products`, {
      params: { page },
    });
    if (!response.ok()) {
      throw new Error(`GET /products?page=${page} failed: ${response.status()}`);
    }
    const body = await response.json();
    const products = body.data ?? body;
    if (!products.length) break;
    all.push(...products);
    if (products.length < (body.per_page ?? 9)) break;
  }
  return all;
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} apiBaseUrl
 * @param {string} name
 * @returns {Promise<{ id: string, name: string, in_stock: boolean, price: number }>}
 */
async function getProductByName(request, apiBaseUrl, name) {
  const searchResponse = await request.get(`${apiBaseUrl}/products/search`, {
    params: { q: name },
  });
  if (searchResponse.ok()) {
    const searchBody = await searchResponse.json();
    const searchResults = searchBody.data ?? searchBody;
    const exactSearch = searchResults.find((p) => p.name === name);
    if (exactSearch) return exactSearch;
  }

  const products = await fetchAllProducts(request, apiBaseUrl);
  const match = products.find((p) => p.name === name);
  if (match) return match;

  const fallbackName = PRODUCT_NAME_FALLBACKS[name];
  if (fallbackName) {
    return getProductByName(request, apiBaseUrl, fallbackName);
  }

  throw new Error(`Product not found: "${name}"`);
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

module.exports = { getProductByName, getInStockSmokeProducts, fetchAllProducts };
