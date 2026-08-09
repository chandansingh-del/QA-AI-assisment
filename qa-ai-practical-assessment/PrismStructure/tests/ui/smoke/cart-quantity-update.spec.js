/**
 * TC-UI-SMOKE-003 | SC-03 | Maps to TC-MAN-002 (steps 5–8)
 */
const { test, expect, testData } = require('../../../fixtures');
const { loginAsSeededCustomer, resolveSmokeProducts, addProductById } = require('../helpers/smokeSetup');

test.describe('Smoke — Cart and quantity', () => {
  test('logged-in user can manage multi-item cart and update quantity @smoke', async ({
    page,
    request,
    loginPage,
    productDetailPage,
    cartPage,
  }) => {
    const { primary, secondary } = await resolveSmokeProducts(request);
    const updatedQty = testData.QUANTITY_EDGE.multiItemSecondary;

    await loginAsSeededCustomer(loginPage);
    await addProductById(productDetailPage, page, primary.id, 1);
    await addProductById(productDetailPage, page, secondary.id, 1);

    await cartPage.open();
    await expect(cartPage.lineTitle(primary.name)).toBeVisible();
    await expect(cartPage.lineTitle(secondary.name)).toBeVisible();

    const linePriceBefore = await cartPage.linePrice(secondary.name).textContent();
    const totalBefore = await cartPage.cartTotal.textContent();

    await cartPage.updateLineQuantity(secondary.name, updatedQty);
    await expect(cartPage.lineQuantityInput(secondary.name)).toHaveValue(String(updatedQty));

    await expect(cartPage.linePrice(secondary.name)).not.toHaveText(linePriceBefore || '');
    await expect(cartPage.cartTotal).not.toHaveText(totalBefore || '');
  });
});
