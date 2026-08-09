/**
 * Supplemental Playwright DOM inspection (cart/checkout/category/errors).
 * Run: node scripts/inspect-dom-cart.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = 'https://practicesoftwaretesting.com';
const OUT_PATH = path.join(__dirname, 'inspect-dom-cart-output.json');

const CREDENTIALS = {
  email: 'customer@practicesoftwaretesting.com',
  password: 'welcome01',
};

function uniqueDataTests(snapshot) {
  if (!snapshot?.dataTest && !snapshot?.uniqueDataTests) return [];
  if (snapshot.uniqueDataTests) return snapshot.uniqueDataTests;
  return [...new Set(snapshot.dataTest.map((x) => x.test).filter(Boolean))].sort();
}

async function collectDataTestSnapshot(page) {
  return page.evaluate(() => {
    const dataTest = Array.from(document.querySelectorAll('[data-test]')).map((el) => ({
      test: el.getAttribute('data-test'),
      tag: el.tagName,
      text: (el.innerText || el.textContent || '').trim().slice(0, 120),
      type: el.getAttribute('type'),
      name: el.getAttribute('name'),
      role: el.getAttribute('role'),
      href: el.getAttribute('href'),
      id: el.getAttribute('id'),
      for: el.getAttribute('for'),
      disabled: el.disabled ?? null,
      visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
    }));
    const alerts = Array.from(
      document.querySelectorAll('[role="alert"], .alert, .invalid-feedback, .text-danger, [data-test*="error"]')
    ).map((el) => {
      const attrs = {};
      for (const a of ['data-test', 'data-testid', 'role', 'class', 'id', 'aria-live']) {
        const v = el.getAttribute(a);
        if (v) attrs[a] = v;
      }
      return {
        tag: el.tagName,
        attrs,
        text: (el.innerText || el.textContent || '').trim().slice(0, 200),
        visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
      };
    });
    return {
      url: location.href,
      title: document.title,
      dataTest,
      uniqueDataTests: [...new Set(dataTest.map((x) => x.test).filter(Boolean))].sort(),
      alerts,
    };
  });
}

async function gotoAndSnapshot(page, pathOrUrl, waitMs = 2500) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${BASE}${pathOrUrl}`;
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(waitMs);
  const snapshot = await collectDataTestSnapshot(page);
  snapshot.requestedUrl = url;
  snapshot.httpStatus = response?.status() ?? null;
  snapshot.redirected = snapshot.url !== url;
  return snapshot;
}

async function login(page) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.locator('[data-test="email"]').fill(CREDENTIALS.email);
  await page.locator('[data-test="password"]').fill(CREDENTIALS.password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes('/auth/login'), { timeout: 25000 }).catch(() => null),
    page.locator('[data-test="login-submit"]').click(),
  ]);
  await page.waitForTimeout(2000);
  return { urlAfterLogin: page.url() };
}

async function findSearchInput(page) {
  return page.evaluate(() => {
    const candidates = Array.from(
      document.querySelectorAll(
        'input[type="search"], input[placeholder*="Search" i], input[formcontrolname*="search" i], [data-test*="search" i]'
      )
    );
    return candidates.map((el) => ({
      tag: el.tagName,
      type: el.getAttribute('type'),
      placeholder: el.getAttribute('placeholder'),
      dataTest: el.getAttribute('data-test'),
      name: el.getAttribute('name'),
      id: el.getAttribute('id'),
      formcontrolname: el.getAttribute('formcontrolname'),
      visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
    }));
  });
}

async function findProductUrl(page, namePattern) {
  const paths = ['/', '/category/hand-tools', '/category/hammer', '/products'];
  const re = new RegExp(namePattern, 'i');
  for (const p of paths) {
    await page.goto(`${BASE}${p}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    const href = await page.evaluate((pattern) => {
      const rx = new RegExp(pattern, 'i');
      const anchors = Array.from(document.querySelectorAll('a[href*="/product/"]'));
      const exact = anchors.find((el) => rx.test((el.textContent || '').trim()));
      return exact?.getAttribute('href') || null;
    }, namePattern);
    if (href) return href.startsWith('http') ? href : `${BASE}${href}`;
  }
  return null;
}

async function captureErrorAfterAction(page, action) {
  await action();
  await page.waitForTimeout(2000);
  return page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll(
        '[role="alert"], .alert, .invalid-feedback, .text-danger, [data-test*="error"], [data-test*="alert"]'
      )
    );
    return nodes.map((el) => {
      const attrs = {};
      for (const a of ['data-test', 'data-testid', 'role', 'class', 'id', 'aria-live', 'aria-describedby']) {
        const v = el.getAttribute(a);
        if (v) attrs[a] = v;
      }
      return {
        tag: el.tagName,
        attrs,
        text: (el.innerText || el.textContent || '').trim().slice(0, 300),
        visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
      };
    });
  });
}

async function clickIfPresent(page, dataTest) {
  const loc = page.locator(`[data-test="${dataTest}"]`);
  if ((await loc.count()) > 0) {
    await loc.first().click({ force: true }).catch(() => null);
    await page.waitForTimeout(1500);
    return true;
  }
  return false;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const output = {
    meta: { base: BASE, generatedAt: new Date().toISOString(), notes: [] },
    login: null,
    handToolsCategory: null,
    hammerSubcategory: null,
    categoryHammerDirect: null,
    search: { home: null, handTools: null },
    combinationPliers: { productUrl: null, resolvedName: null, afterAddToCart: null },
    cart: null,
    checkout: null,
    checkoutConfirm: null,
    registerWeakPassword: null,
    invalidLogin: null,
    keyFindings: {},
  };

  // 10. Invalid login
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  output.invalidLogin = {
    url: page.url(),
    errors: await captureErrorAfterAction(page, async () => {
      await page.locator('[data-test="email"]').fill(CREDENTIALS.email);
      await page.locator('[data-test="password"]').fill('wrong-password-xyz');
      await page.locator('[data-test="login-submit"]').click();
    }),
  };

  // 1. Login
  output.login = await login(page);

  // 3. Search on home
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  output.search.home = await findSearchInput(page);

  // 2. hand-tools + hammer subcategory link
  output.handToolsCategory = await gotoAndSnapshot(page, '/category/hand-tools');
  output.search.handTools = await findSearchInput(page);

  const hammerLink = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    const fromHref = links.find((a) => /\/category\/hammer\/?$/i.test(a.getAttribute('href') || ''));
    if (fromHref) {
      return {
        text: (fromHref.textContent || '').trim(),
        href: fromHref.getAttribute('href'),
        dataTest: fromHref.getAttribute('data-test'),
      };
    }
    const fromFilter = Array.from(document.querySelectorAll('[data-test^="category-"]')).find((el) =>
      /^hammer$/i.test((el.textContent || '').trim())
    );
    if (fromFilter) {
      const a = fromFilter.closest('a') || fromFilter.querySelector('a');
      return {
        text: (fromFilter.textContent || '').trim(),
        href: a?.getAttribute('href') || '/category/hammer',
        dataTest: fromFilter.getAttribute('data-test'),
      };
    }
    return null;
  });
  if (!hammerLink) {
    output.hammerSubcategory = {
      link: { href: '/category/hammer', dataTest: null, note: 'No Hammer filter link on /category/hand-tools; direct category route used.' },
      page: null,
    };
  } else {
    output.hammerSubcategory = { link: hammerLink, page: null };
  }
  const hammerUrl = (output.hammerSubcategory.link?.href || '/category/hammer').startsWith('http')
    ? output.hammerSubcategory.link.href
    : `${BASE}${output.hammerSubcategory.link?.href || '/category/hammer'}`;
  output.hammerSubcategory.page = await gotoAndSnapshot(page, hammerUrl);

  // 8. /category/hammer direct
  output.categoryHammerDirect = await gotoAndSnapshot(page, '/category/hammer');

  // 4. Combination Pliers (fallback: closest pliers product on catalog)
  let pliersUrl = await findProductUrl(page, 'Combination Pliers');
  output.combinationPliers.resolvedName = 'Combination Pliers';
  if (!pliersUrl) {
    pliersUrl = await findProductUrl(page, '^Pliers\\b');
    output.combinationPliers.resolvedName = 'Pliers (Combination Pliers not listed on catalog)';
    output.meta.notes.push('Combination Pliers product link not found; used Pliers product for add-to-cart flow.');
  }
  output.combinationPliers.productUrl = pliersUrl;

  if (pliersUrl) {
    await page.goto(pliersUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const addBtn = page.locator('[data-test="add-to-cart"]');
    const addDataTest = (await addBtn.count()) > 0 ? await addBtn.first().getAttribute('data-test') : null;
    if ((await addBtn.count()) > 0) await addBtn.first().click();
    else await page.getByRole('button', { name: /add to cart/i }).first().click();
    await page.waitForTimeout(2500);
    output.combinationPliers.afterAddToCart = {
      url: page.url(),
      addToCartDataTest: addDataTest,
      snapshot: await collectDataTestSnapshot(page),
    };
  }

  // 5. /cart (site may redirect to home when empty or route deprecated)
  output.cart = await gotoAndSnapshot(page, '/cart', 3000);
  if (output.cart.redirected || !output.cart.url.includes('/cart')) {
    output.meta.notes.push('/cart redirected; cart line-item data-test values captured from /checkout.');
    await page.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    output.cart.checkoutCartView = await collectDataTestSnapshot(page);
  }

  // 6–7. Checkout through confirm
  await page.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await clickIfPresent(page, 'proceed-1');
  await clickIfPresent(page, 'proceed-2');

  output.checkout = await collectDataTestSnapshot(page);
  output.checkout.billingFields = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input, select, textarea')).map((el) => ({
      tag: el.tagName,
      type: el.getAttribute('type'),
      name: el.getAttribute('name'),
      id: el.getAttribute('id'),
      dataTest: el.getAttribute('data-test'),
      placeholder: el.getAttribute('placeholder'),
      formcontrolname: el.getAttribute('formcontrolname'),
      label: el.labels?.[0]?.textContent?.trim() || null,
    }))
  );
  output.checkout.paymentOptions = await page.evaluate(() => {
    const select = document.querySelector('[data-test="payment-method"]');
    const options = select
      ? Array.from(select.options).map((o) => ({ value: o.value, text: (o.textContent || '').trim() }))
      : [];
    return { paymentMethodDataTest: select?.getAttribute('data-test') || null, options };
  });
  output.checkout.continueButton = await page.evaluate(() =>
    ['proceed-1', 'proceed-2', 'proceed-3', 'finish', 'continue-shopping'].map((dt) => {
      const el = document.querySelector(`[data-test="${dt}"]`);
      return el
        ? {
            dataTest: dt,
            tag: el.tagName,
            text: (el.innerText || el.value || '').trim().slice(0, 80),
            visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
            disabled: el.disabled ?? null,
          }
        : { dataTest: dt, missing: true };
    })
  );

  try {
    const billing = {
      street: '123 Test Street',
      city: 'Testville',
      state: 'TS',
      postalCode: '12345',
      houseNumber: '1',
    };
    const fillDt = async (dt, value) => {
      const field = page.locator(`[data-test="${dt}"]`);
      if ((await field.count()) === 0) return;
      await field.first().fill(value, { force: true });
    };
    await fillDt('street', billing.street);
    await fillDt('city', billing.city);
    await fillDt('state', billing.state);
    await fillDt('postal_code', billing.postalCode);
    await fillDt('house_number', billing.houseNumber);
    const phone = page.locator('[data-test="phone"]');
    if ((await phone.count()) > 0) await phone.first().fill('5551234567', { force: true });
    const country = page.locator('[data-test="country"]');
    if ((await country.count()) > 0) {
      const us = await country.first().evaluate((el) => {
        const opt = Array.from(el.options).find((o) => /united states/i.test(o.textContent || ''));
        return opt?.value || null;
      });
      if (us) await country.first().selectOption(us, { force: true });
      else await country.first().selectOption({ index: 1 }, { force: true });
    }

    const proceed3 = page.locator('[data-test="proceed-3"]');
    if ((await proceed3.count()) > 0) {
      await proceed3.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
      for (let i = 0; i < 20; i++) {
        if (!(await proceed3.first().isDisabled())) break;
        await page.waitForTimeout(500);
      }
    }

    await clickIfPresent(page, 'proceed-3');

    const payment = page.locator('[data-test="payment-method"]');
    if ((await payment.count()) > 0) {
      await payment.first().selectOption('cash-on-delivery', { force: true });
    }

    await clickIfPresent(page, 'finish');
    await page.waitForTimeout(2500);

    if (!page.url().includes('/checkout/confirm')) {
      await page.goto(`${BASE}/checkout/confirm`, { waitUntil: 'domcontentloaded' }).catch(() => null);
      await page.waitForTimeout(2500);
    }
    if (!page.url().includes('/checkout/confirm')) {
      output.meta.notes.push('Could not reach /checkout/confirm after billing; captured /checkout snapshot for confirm controls.');
      await page.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
    }

    output.checkoutConfirm = await collectDataTestSnapshot(page);
    output.checkoutConfirm.confirmButton = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button, a.btn, input[type="submit"]'))
        .filter((el) => /confirm|finish|place order/i.test((el.innerText || el.value || '').trim()))
        .map((el) => ({
          tag: el.tagName,
          text: (el.innerText || el.value || '').trim().slice(0, 80),
          dataTest: el.getAttribute('data-test'),
          disabled: el.disabled ?? null,
        }))
    );
  } catch (billingErr) {
    output.checkoutBillingError = String(billingErr);
    await page.goto(`${BASE}/checkout/confirm`, { waitUntil: 'domcontentloaded' }).catch(() => null);
    await page.waitForTimeout(2500);
    output.checkoutConfirm = await collectDataTestSnapshot(page);
  }

  // 9. Register weak password
  await page.goto(`${BASE}/auth/register`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  output.registerWeakPassword = {
    url: page.url(),
    errors: await captureErrorAfterAction(page, async () => {
      const fillFirst = async (selector, value) => {
        const loc = page.locator(selector);
        if ((await loc.count()) > 0) await loc.first().fill(value);
      };
      await fillFirst('[data-test="first-name"]', 'Test');
      await fillFirst('[data-test="last-name"]', 'User');
      await fillFirst('[data-test="email"]', `weak-${Date.now()}@example.com`);
      await fillFirst('[data-test="password"]', '123');
      const submit = page.locator('[data-test="register-submit"], [data-test="register"], button[type="submit"]').first();
      if ((await submit.count()) > 0) await submit.click();
      else await page.getByRole('button', { name: /register|sign up/i }).click();
    }),
    formDataTests: await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-test]')).map((el) => ({
        test: el.getAttribute('data-test'),
        tag: el.tagName,
      }))
    ),
  };

  const cartDataTests = uniqueDataTests(output.cart.checkoutCartView || output.cart);
  const checkoutDataTests = uniqueDataTests(output.checkout);
  const confirmDataTests = uniqueDataTests(output.checkoutConfirm);

  output.keyFindings = {
    cartDataTests,
    checkoutDataTests,
    checkoutConfirmDataTests: confirmDataTests,
    handToolsCategoryDataTests: uniqueDataTests(output.handToolsCategory),
    hammerSubcategoryDataTests: uniqueDataTests(output.hammerSubcategory?.page),
    categoryHammerDirectDataTests: uniqueDataTests(output.categoryHammerDirect),
    searchHome: output.search.home,
    searchHandTools: output.search.handTools,
    invalidLoginErrors: output.invalidLogin.errors,
    registerWeakPasswordErrors: output.registerWeakPassword.errors,
    combinationPliersAddToCartDataTest: output.combinationPliers.afterAddToCart?.addToCartDataTest ?? null,
    checkoutContinueButtons: output.checkout.continueButton,
    checkoutConfirmButtons: output.checkoutConfirm?.confirmButton || [],
    cartRedirect: output.cart.redirected ? output.cart.url : null,
    paymentCodValue: 'cash-on-delivery',
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Wrote ${OUT_PATH}`);
  console.log(JSON.stringify(output.keyFindings, null, 2));

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
