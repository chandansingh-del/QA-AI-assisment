/**
 * TC-UI-SMOKE-001 | SC-01 | Maps to TC-MAN-001
 * Registration → login → profile verification
 */
const { test, expect, testData } = require('../../../fixtures');

test.describe('Smoke — Registration and profile', () => {
  test('new user can register, login, and view profile @smoke', async ({
    page,
    registerPage,
    loginPage,
    profilePage,
  }) => {
    const user = testData.buildValidRegistrationUserUi({});

    await registerPage.open();
    await registerPage.register(user);
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });

    await loginPage.login(user.email, user.password);
    await expect(page).toHaveURL(/\/account/);

    await profilePage.open();
    await expect(profilePage.pageTitle).toBeVisible();
    await expect(profilePage.firstNameInput).toHaveValue(user.firstName, { timeout: 15_000 });

    const profile = await profilePage.readProfileFields();
    expect(profile.firstName).toBe(user.firstName);
    expect(profile.lastName).toBe(user.lastName);
    expect(profile.email).toBe(user.email);
    expect(profile.phone).toBe(user.phone);
    expect(profile.street).toBe(user.street);
    expect(profile.city).toBe(user.city);
    expect(profile.postalCode).toBe(user.postalCode);
  });
});
