/**
 * Minimal DOM inspector (fallback) - UTF-8 stdout
 */
const { chromium } = require('playwright');
const BASE = 'https://practicesoftwaretesting.com';

async function inspectPage(page, pathOrUrl, label) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${BASE}${pathOrUrl}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);
  return page.evaluate((pageLabel) => {
    const navLinks = Array.from(document.querySelectorAll('nav a[href], header a[data-test^="nav-"]'))
      .map((el) => ({
        text: (el.textContent || '').trim().slice(0, 80),
        href: el.getAttribute('href'),
        dataTest: el.getAttribute('data-test'),
        ariaLabel: el.getAttribute('aria-label'),
      }));
    const dataTest = Array.from(document.querySelectorAll('[data-test]')).map((el) => ({
      test: el.getAttribute('data-test'),
      tag: el.tagName,
      text: (el.innerText || el.textContent || '').trim().slice(0, 80),
    }));
    const dataTestId = Array.from(document.querySelectorAll('[data-testid]')).map((el) => ({
      testid: el.getAttribute('data-testid'),
      tag: el.tagName,
      text: (el.innerText || el.textContent || '').trim().slice(0, 80),
    }));
    const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map((el) => ({
      tag: el.tagName,
      type: el.getAttribute('type'),
      name: el.getAttribute('name'),
      id: el.getAttribute('id'),
      placeholder: el.getAttribute('placeholder'),
      formcontrolname: el.getAttribute('formcontrolname'),
      dataTest: el.getAttribute('data-test'),
      label: el.labels?.[0]?.textContent?.trim() || null,
      ariaLabel: el.getAttribute('aria-label'),
    }));
    const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]')).map((el) => ({
      tag: el.tagName,
      type: el.getAttribute('type'),
      role: el.getAttribute('role'),
      name: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 80),
      dataTest: el.getAttribute('data-test'),
      disabled: !!el.disabled,
    }));
    return {
      label: pageLabel,
      url: location.href,
      title: document.title,
      navLinks: navLinks.slice(0, 40),
      dataTest,
      dataTestId,
      inputs,
      buttons,
    };
  }, label);
}

async function findProductUrl(page, namePattern) {
  const searchPaths = ['/', '/category/hand-tools', '/products'];
  for (const path of searchPaths) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2500);
    const href = await page.evaluate((pattern) => {
      const re = new RegExp(pattern, 'i');
      const anchors = Array.from(document.querySelectorAll('a[href*="/product/"], a[href*="product/"]'));
      const a = anchors.find((el) => re.test((el.textContent || '').trim()) || re.test(el.getAttribute('href') || ''));
      return a ? a.getAttribute('href') : null;
    }, namePattern);
    if (href) return href;
  }
  return null;
}

async function login(page) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('[data-test="email"]').fill('customer@practicesoftwaretesting.com');
  await page.locator('[data-test="password"]').fill('welcome01');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null),
    page.locator('[data-test="login-submit"]').click(),
  ]);
  await page.waitForTimeout(2000);
  return page.url();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const out = { meta: { base: BASE, testIdAttributeRecommendation: 'data-test', dataTestIdFound: false }, pages: {} };

  const routes = [
    ['/auth/login', 'login'],
    ['/auth/register', 'register'],
    ['/products', 'products'],
    ['/cart', 'cart'],
    ['/checkout', 'checkout'],
  ];
  for (const [path, key] of routes) {
    out.pages[key] = await inspectPage(page, path, key);
  }

  const productNames = [
    ['Combination Pliers', 'combinationPliers'],
    ['Claw Hammer', 'clawHammer'],
    ['Long Nose Pliers', 'longNosePliers'],
  ];
  for (const [name, key] of productNames) {
    const href = await findProductUrl(page, name);
    if (href) {
      const full = href.startsWith('http') ? href : `${BASE}${href}`;
      out.pages[key] = await inspectPage(page, full, key);
      out.pages[key].resolvedFromHome = href;
    } else {
      out.pages[key] = { label: key, error: 'product link not found on home', url: null };
    }
  }

  out.loginAttempt = { urlAfter: await login(page) };
  out.pages.afterLogin = await inspectPage(page, page.url(), 'afterLogin');

  const authed = [
    ['/account/profile', 'profile'],
    ['/account/invoices', 'invoices'],
    ['/cart', 'cartAuthenticated'],
    ['/checkout', 'checkoutAuthenticated'],
  ];
  for (const [path, key] of authed) {
    out.pages[key] = await inspectPage(page, path, key);
  }

  out.meta.dataTestIdFound = Object.values(out.pages).some((p) => p.dataTestId && p.dataTestId.length > 0);
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

