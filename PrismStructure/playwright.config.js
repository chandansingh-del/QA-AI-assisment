// @ts-check
const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const UI_BASE_URL = process.env.BASE_URL || 'https://practicesoftwaretesting.com';
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.practicesoftwaretesting.com';

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: Number(process.env.PW_TIMEOUT_MS) || 60_000,
  expect: {
    timeout: Number(process.env.PW_EXPECT_TIMEOUT_MS) || 10_000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: Number(process.env.PW_ACTION_TIMEOUT_MS) || 15_000,
  },
  projects: [
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_BASE_URL,
        testIdAttribute: 'data-test',
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: {
          Accept: 'application/json',
        },
      },
    },
  ],
});
