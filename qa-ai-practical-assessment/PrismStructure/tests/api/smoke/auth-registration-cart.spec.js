/**
 * TC-API-001 | SC-09, SC-11 | API AC1 — register, authenticate, profile, cart
 */
const { test, expect, testData } = require('../../../fixtures');
const {
  assertBearerToken,
  assertUserMatchesRegistration,
  assertCartIdMatches,
} = require('../helpers/smokeAssertions');

test.describe('API Smoke — Auth registration and cart', () => {
  test('register, login, bearer token, profile, and cart creation succeed @smoke', async ({
    request,
    usersApi,
    authApi,
    cartApi,
  }) => {
    const registration = testData.buildValidRegistrationUser();
    const credentials = testData.buildLoginPayload(registration.email, registration.password);

    const registerRes = await usersApi.register(registration, { expectedStatus: 201 });
    const registeredUser = await registerRes.json();
    expect(registeredUser.email, 'Registration response should echo email').toBe(registration.email);
    expect(registeredUser.id, 'Registration response should include user id').toBeTruthy();

    const loginRes = await authApi.login(credentials, { expectedStatus: 200 });
    const loginBody = await loginRes.json();
    assertBearerToken(loginBody.access_token, 'POST /users/login');
    expect(loginBody.token_type, 'Token type should be bearer').toMatch(/^bearer$/i);
    expect(loginBody.expires_in, 'Token should include expires_in').toBeGreaterThan(0);

    const authedUsers = usersApi.withToken(loginBody.access_token);
    const meRes = await authedUsers.me({ expectedStatus: 200 });
    const me = await meRes.json();
    assertUserMatchesRegistration(me, registration);
    expect(me.id, 'Authenticated profile should return stable user id').toBe(registeredUser.id);

    const authedCart = cartApi.withToken(loginBody.access_token);
    const createCartRes = await authedCart.create({ expectedStatus: 201 });
    const cartBody = await createCartRes.json();
    expect(cartBody.id, 'POST /carts should return cart id').toBeTruthy();

    const getCartRes = await authedCart.getCart(cartBody.id, { expectedStatus: 200 });
    const fetchedCart = await getCartRes.json();
    assertCartIdMatches(cartBody.id, fetchedCart);
  });
});
