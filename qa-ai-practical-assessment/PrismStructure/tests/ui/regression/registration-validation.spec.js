/**
 * TC-UI-REG-002 | SC-05 | Maps to TC-MAN-004
 */
const { test, expect, testData } = require('../../../fixtures');

test.describe('Regression — Registration validation', () => {
  test('weak password and duplicate email submissions are blocked @regression', async ({
    page,
    registerPage,
  }) => {
    const weakUser = testData.buildValidRegistrationUserUi({
      password: testData.buildInvalidPassword('commonWeak'),
    });

    await registerPage.open();
    await registerPage.register(weakUser);
    await expect(registerPage.fieldError('password')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/register/);

    const credentials = testData.getSeededCustomerCredentials();
    const duplicateUser = testData.buildValidRegistrationUserUi({
      email: credentials.email,
      firstName: 'Dup',
      lastName: 'User',
      dob: '1990-01-01',
    });

    await registerPage.open();
    await registerPage.register(duplicateUser);
    await expect(registerPage.duplicateEmailMessage).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/register/);
  });
});
