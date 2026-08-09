/**
 * TC-UI-REG-004 | SC-08 | Maps to TC-MAN-006
 */
const { test, expect } = require('../../../fixtures');
const { registerAndLoginFreshUser } = require('../helpers/regressionSetup');

test.describe('Regression — Empty cart checkout', () => {
  test('checkout cannot proceed when cart has no line items @regression', async ({
    page,
    registerPage,
    loginPage,
    appHeader,
    cartPage,
  }) => {
    await registerAndLoginFreshUser(page, registerPage, loginPage);
    await expect(appHeader.accountMenu).toBeVisible();

    await cartPage.open();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByTestId('product-title')).not.toBeVisible();
    await expect(page.getByTestId('finish')).not.toBeVisible();

    const proceedStep1Count = await cartPage.proceedStep1.count();
    if (proceedStep1Count > 0) {
      await expect(cartPage.proceedStep1).toBeDisabled();
    }
  });
});
