/**
 * Deterministic test data builders for Toolshop UI and API tests.
 *
 * - Credentials: load from environment variables only (never commit .env).
 * - Unique users: generated emails with timestamp + random suffix to avoid collisions.
 * - Product IDs / cart IDs: resolve at runtime via API; stable product *names* used for lookup.
 *
 * Usage (in tests/fixtures — not implemented yet):
 *   const td = require('../test-data/testData');
 *   const user = td.buildValidRegistrationUser();
 */

const path = require('path');
const crypto = require('crypto');

// Load .env from PrismStructure root when available (after npm install)
try {
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
} catch {
  // dotenv not installed yet — rely on process.env set by Playwright or shell
}

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

const ENV = {
  BASE_URL: 'BASE_URL',
  API_BASE_URL: 'API_BASE_URL',
  CUSTOMER_EMAIL: 'CUSTOMER_EMAIL',
  CUSTOMER_PASSWORD: 'CUSTOMER_PASSWORD',
  CUSTOMER2_EMAIL: 'CUSTOMER2_EMAIL',
  CUSTOMER2_PASSWORD: 'CUSTOMER2_PASSWORD',
  ADMIN_EMAIL: 'ADMIN_EMAIL',
  ADMIN_PASSWORD: 'ADMIN_PASSWORD',
  /** Password used when registering new unique users (not a seeded account secret). */
  REGISTRATION_PASSWORD: 'REGISTRATION_PASSWORD',
  /** Optional prefix for generated emails; defaults to qa.auto */
  TEST_EMAIL_PREFIX: 'TEST_EMAIL_PREFIX',
};

const DEFAULTS = {
  baseUrl: 'https://practicesoftwaretesting.com',
  apiBaseUrl: 'https://api.practicesoftwaretesting.com',
  emailPrefix: 'qa.auto',
  emailDomain: 'example.com',
};

function env(name, fallback = undefined) {
  const value = process.env[name];
  if (value !== undefined && value !== '') return value;
  if (fallback !== undefined) return fallback;
  return undefined;
}

function requireEnv(name) {
  const value = env(name);
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        'Copy PrismStructure/.env.example to PrismStructure/.env and set values locally.'
    );
  }
  return value;
}

function getUrls() {
  return {
    baseUrl: env(ENV.BASE_URL, DEFAULTS.baseUrl),
    apiBaseUrl: env(ENV.API_BASE_URL, DEFAULTS.apiBaseUrl),
  };
}

// ---------------------------------------------------------------------------
// 1–2. Valid registration + unique user generation
// ---------------------------------------------------------------------------

/**
 * Deterministic suffix: ISO-like timestamp + 4 hex chars for parallel-safe uniqueness.
 * @param {string} [tag] - Short label (e.g. 'reg', 'api', 'ui')
 * @returns {string}
 */
function uniqueSuffix(tag = 'user') {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const rand = crypto.randomBytes(2).toString('hex');
  const safeTag = tag.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 12);
  return `${safeTag}.${ts}.${rand}`;
}

/**
 * Generate a collision-resistant email on example.com (RFC 2606 — not a real mailbox).
 * @param {string} [tag]
 * @returns {string}
 */
function uniqueEmail(tag = 'user') {
  const prefix = env(ENV.TEST_EMAIL_PREFIX, DEFAULTS.emailPrefix);
  return `${prefix}.${uniqueSuffix(tag)}@${DEFAULTS.emailDomain}`;
}

/**
 * Valid password for new registrations. Loaded from env to avoid hardcoding secrets.
 * Set REGISTRATION_PASSWORD in .env (must meet SUT rules: 8+ chars, upper, lower, number, symbol).
 */
function getRegistrationPassword() {
  return requireEnv(ENV.REGISTRATION_PASSWORD);
}

/** Stable valid address block — deterministic across runs. */
const VALID_ADDRESS = Object.freeze({
  street: '10 Test Street',
  house_number: '12',
  city: 'Amsterdam',
  state: 'North Holland',
  country: 'NL',
  postal_code: '1011AA',
});

/**
 * Build a complete valid registration payload (API UserRequest shape).
 * Email is unique per call unless overridden.
 * @param {object} [overrides]
 * @returns {object}
 */
function buildValidRegistrationUser(overrides = {}) {
  const email = overrides.email ?? uniqueEmail('reg');
  return {
    first_name: 'Manual',
    last_name: 'Tester',
    email,
    password: overrides.password ?? getRegistrationPassword(),
    phone: '5551234567',
    dob: '1990-06-15',
    address: { ...VALID_ADDRESS },
    ...overrides,
    // Ensure nested address merge if partial override
    ...(overrides.address ? { address: { ...VALID_ADDRESS, ...overrides.address } } : {}),
  };
}

/**
 * UI-friendly flat registration fields (form labels may differ; map in page objects later).
 */
function buildValidRegistrationUserUi(overrides = {}) {
  const api = buildValidRegistrationUser(overrides);
  return {
    firstName: api.first_name,
    lastName: api.last_name,
    email: api.email,
    password: api.password,
    phone: api.phone,
    dob: api.dob,
    street: api.address.street,
    houseNumber: api.address.house_number,
    city: api.address.city,
    state: api.address.state,
    country: api.address.country,
    postalCode: api.address.postal_code,
  };
}

// ---------------------------------------------------------------------------
// 3–5. Invalid registration / login variants
// ---------------------------------------------------------------------------

/** Deterministic invalid email samples (not unique — negative tests). */
const INVALID_EMAILS = Object.freeze({
  missingAt: 'not-an-email',
  missingDomain: 'user@',
  doubleAt: 'user@@example.com',
  spaces: 'user name@example.com',
  empty: '',
});

/**
 * @param {keyof INVALID_EMAILS} [variant='missingAt']
 */
function buildInvalidEmail(variant = 'missingAt') {
  return INVALID_EMAILS[variant] ?? INVALID_EMAILS.missingAt;
}

/** Deterministic invalid password samples per OpenAPI rules. */
const INVALID_PASSWORDS = Object.freeze({
  tooShort: 'Ab1!',
  noUppercase: 'validpass1!',
  noLowercase: 'VALIDPASS1!',
  noNumber: 'ValidPass!',
  noSymbol: 'ValidPass1',
  empty: '',
  commonWeak: 'weakpass',
});

/**
 * @param {keyof INVALID_PASSWORDS} [variant='commonWeak']
 */
function buildInvalidPassword(variant = 'commonWeak') {
  return INVALID_PASSWORDS[variant] ?? INVALID_PASSWORDS.commonWeak;
}

/**
 * Registration body with one or more required fields removed.
 * @param {'email'|'password'|'first_name'|'last_name'|string[]} missing
 */
function buildRegistrationMissingFields(missing = 'email') {
  const user = buildValidRegistrationUser();
  const keys = Array.isArray(missing) ? missing : [missing];
  for (const key of keys) {
    delete user[key];
  }
  return user;
}

/**
 * Duplicate-email registration: uses seeded customer email from env (intentional conflict).
 */
function buildDuplicateEmailRegistration(overrides = {}) {
  return buildValidRegistrationUser({
    email: requireEnv(ENV.CUSTOMER_EMAIL),
    first_name: 'Dup',
    last_name: 'User',
    dob: '1990-01-01',
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// 6. Product data (names stable; IDs resolved at runtime)
// ---------------------------------------------------------------------------

/** Known catalog labels from manual exploration — use for search/detail, not as IDs. */
const PRODUCT_NAMES = Object.freeze({
  inStockPrimary: 'Combination Pliers',
  inStockSecondary: 'Claw Hammer',
  outOfStock: 'Long Nose Pliers',
});

const PRODUCT_SEARCH = Object.freeze({
  hammer: 'Hammer',
  pliers: 'Pliers',
});

const CATEGORY_PATH = Object.freeze({
  handToolsHammer: { parent: 'Hand Tools', child: 'Hammer' },
});

/**
 * Criteria to pick in-stock products from GET /products response.
 * @returns {{ inStock: true, names: string[] }}
 */
function getInStockProductCriteria() {
  return {
    inStock: true,
    names: [PRODUCT_NAMES.inStockPrimary, PRODUCT_NAMES.inStockSecondary],
  };
}

function getOutOfStockProductCriteria() {
  return {
    inStock: false,
    name: PRODUCT_NAMES.outOfStock,
  };
}

/**
 * Resolve product id from API list by exact name (call from test helper later).
 * @param {Array<{id: string, name: string, in_stock: boolean}>} products
 * @param {string} name
 */
function findProductIdByName(products, name) {
  const match = products.find((p) => p.name === name);
  if (!match) {
    throw new Error(`Product not found by name: "${name}". Refresh catalog from GET /products.`);
  }
  return match.id;
}

// ---------------------------------------------------------------------------
// 7–8. Cart data and quantity edge cases
// ---------------------------------------------------------------------------

/**
 * Default multi-item cart intent for AC2 (IDs filled at runtime).
 * @param {{ productAId?: string, productBId?: string }} ids
 */
function buildCartItems(ids = {}) {
  return [
    { product_id: ids.productAId, product_name: PRODUCT_NAMES.inStockPrimary, quantity: 1 },
    { product_id: ids.productBId, product_name: PRODUCT_NAMES.inStockSecondary, quantity: 1 },
  ].filter((line) => line.product_id);
}

/** Add-to-cart API body */
function buildAddToCartPayload(productId, quantity = 1) {
  return { product_id: productId, quantity };
}

/** Quantity update API body */
function buildUpdateQuantityPayload(productId, quantity) {
  return { product_id: productId, quantity };
}

const QUANTITY_EDGE = Object.freeze({
  minimum: 1,
  multiItemSecondary: 2,
  zero: 0,
  negative: -1,
});

function getQuantityEdgeCases() {
  return { ...QUANTITY_EDGE };
}

// ---------------------------------------------------------------------------
// 9–10. Checkout and invoice payload data
// ---------------------------------------------------------------------------

/** Assessment example billing — deterministic COD checkout. */
const BILLING_ADDRESS = Object.freeze({
  billing_street: 'Zoey Shore',
  billing_city: 'Hesselbury',
  billing_state: 'Florida',
  billing_country: 'TG',
  billing_postal_code: '1234AA',
});

const PAYMENT_METHODS = Object.freeze({
  cashOnDelivery: 'cash-on-delivery',
  bankTransfer: 'bank-transfer',
  creditCard: 'credit-card',
  buyNowPayLater: 'buy-now-pay-later',
  giftCard: 'gift-card',
});

/**
 * UI checkout billing (flat fields for forms).
 */
function buildCheckoutBillingUi() {
  return {
    street: BILLING_ADDRESS.billing_street,
    city: BILLING_ADDRESS.billing_city,
    state: BILLING_ADDRESS.billing_state,
    country: BILLING_ADDRESS.billing_country,
    postalCode: BILLING_ADDRESS.billing_postal_code,
    paymentMethod: 'Cash on Delivery',
  };
}

/**
 * API invoice payload (authenticated). cart_id required at runtime.
 * @param {string} cartId
 * @param {object} [overrides]
 */
function buildInvoicePayload(cartId, overrides = {}) {
  if (!cartId) {
    throw new Error('buildInvoicePayload requires a runtime cart_id from POST /carts');
  }
  return {
    ...BILLING_ADDRESS,
    payment_method: PAYMENT_METHODS.cashOnDelivery,
    payment_details: {},
    cart_id: cartId,
    ...overrides,
  };
}

/**
 * Payment check payload for COD (verified on live API).
 */
function buildPaymentCheckCod() {
  return {
    payment_method: PAYMENT_METHODS.cashOnDelivery,
    payment_details: {},
  };
}

/**
 * Postcode lookup query params (verified TG / 1234AA).
 */
function buildPostcodeLookupParams(overrides = {}) {
  return {
    country: BILLING_ADDRESS.billing_country,
    postcode: BILLING_ADDRESS.billing_postal_code,
    house_number: '220',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 11. API authentication data
// ---------------------------------------------------------------------------

function getSeededCustomerCredentials() {
  return {
    email: requireEnv(ENV.CUSTOMER_EMAIL),
    password: requireEnv(ENV.CUSTOMER_PASSWORD),
  };
}

function getSeededCustomer2Credentials() {
  return {
    email: requireEnv(ENV.CUSTOMER2_EMAIL),
    password: requireEnv(ENV.CUSTOMER2_PASSWORD),
  };
}

function getSeededAdminCredentials() {
  return {
    email: requireEnv(ENV.ADMIN_EMAIL),
    password: requireEnv(ENV.ADMIN_PASSWORD),
  };
}

function buildLoginPayload(email, password) {
  return { email, password };
}

function buildLoginPayloadSeededCustomer() {
  const { email, password } = getSeededCustomerCredentials();
  return buildLoginPayload(email, password);
}

function buildAuthHeader(accessToken) {
  if (!accessToken) throw new Error('buildAuthHeader requires a valid access_token');
  return { Authorization: `Bearer ${accessToken}` };
}

// ---------------------------------------------------------------------------
// 12. Negative API payloads
// ---------------------------------------------------------------------------

function buildInvalidLoginPayload(variant = 'wrongPassword') {
  const { email } = getSeededCustomerCredentials();
  const variants = {
    wrongPassword: { email, password: 'WrongPass99!' },
    wrongEmail: { email: 'nonexistent@example.com', password: 'AnyPass1!' },
    emptyEmail: { email: '', password: 'AnyPass1!' },
    emptyPassword: { email, password: '' },
    missingFields: {},
  };
  return variants[variant] ?? variants.wrongPassword;
}

function buildInvoicePayloadMissingFields(cartId, missing = 'billing_street') {
  const payload = buildInvoicePayload(cartId);
  const keys = Array.isArray(missing) ? missing : [missing];
  for (const key of keys) {
    delete payload[key];
  }
  return payload;
}

function buildInvoicePayloadInvalidCartId() {
  return buildInvoicePayload('000000000000000000000000');
}

function buildInvoicePayloadWithoutAuth() {
  return {
    ...BILLING_ADDRESS,
    payment_method: PAYMENT_METHODS.cashOnDelivery,
    payment_details: {},
    cart_id: 'placeholder-cart-id',
  };
}

function buildWeakPasswordRegistration() {
  return buildValidRegistrationUser({
    email: uniqueEmail('weak'),
    password: INVALID_PASSWORDS.commonWeak,
  });
}

module.exports = {
  ENV,
  DEFAULTS,
  env,
  requireEnv,
  getUrls,
  uniqueSuffix,
  uniqueEmail,
  getRegistrationPassword,
  VALID_ADDRESS,
  buildValidRegistrationUser,
  buildValidRegistrationUserUi,
  INVALID_EMAILS,
  buildInvalidEmail,
  INVALID_PASSWORDS,
  buildInvalidPassword,
  buildRegistrationMissingFields,
  buildDuplicateEmailRegistration,
  PRODUCT_NAMES,
  PRODUCT_SEARCH,
  CATEGORY_PATH,
  getInStockProductCriteria,
  getOutOfStockProductCriteria,
  findProductIdByName,
  buildCartItems,
  buildAddToCartPayload,
  buildUpdateQuantityPayload,
  QUANTITY_EDGE,
  getQuantityEdgeCases,
  BILLING_ADDRESS,
  PAYMENT_METHODS,
  buildCheckoutBillingUi,
  buildInvoicePayload,
  buildPaymentCheckCod,
  buildPostcodeLookupParams,
  getSeededCustomerCredentials,
  getSeededCustomer2Credentials,
  getSeededAdminCredentials,
  buildLoginPayload,
  buildLoginPayloadSeededCustomer,
  buildAuthHeader,
  buildInvalidLoginPayload,
  buildInvoicePayloadMissingFields,
  buildInvoicePayloadInvalidCartId,
  buildInvoicePayloadWithoutAuth,
  buildWeakPasswordRegistration,
};
