/**
 * Central configuration — thin wrapper over test-data env helpers.
 */
const testData = require('../test-data/testData');

function getConfig() {
  const { baseUrl, apiBaseUrl } = testData.getUrls();
  return {
    baseUrl,
    apiBaseUrl,
    defaultTimeout: Number(process.env.PW_TIMEOUT_MS) || 30_000,
  };
}

module.exports = { getConfig };
