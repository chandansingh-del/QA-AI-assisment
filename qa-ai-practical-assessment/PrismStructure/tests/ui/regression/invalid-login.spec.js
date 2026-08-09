/**
 * TC-UI-REG-001 | SC-04 | Maps to TC-MAN-003
 */
const { test, expect, testData } = require('../../../fixtures');

test.describe('Regression — Invalid login', () => {
  test('wrong password is rejected and account routes stay protected @regression', async ({
    page,
    loginPage,
    profilePage,
  }) => {
    const invalid = testData.buildInvalidLoginPayload('wrongPassword');

    await loginPage.open();
    await loginPage.login(invalid.email, invalid.password, { waitForSuccess: false });

    await expect(loginPage.loginError).toBeVisible();
    await expect(loginPage.loginError).toContainText(/invalid email or password/i);
    await expect(page).not.toHaveURL(/\/account/);

    await profilePage.open();
    await expect(loginPage.loginForm).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
