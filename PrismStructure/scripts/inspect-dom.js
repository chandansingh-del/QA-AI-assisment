/**
 * One-off DOM inspector â€” dumps stable selector candidates for UI strategy doc.
 * Run: node scripts/inspect-dom.js
 */
const { chromium } = require('playwright');

const BASE = 'https://practicesoftwaretesting.com';

function summarize(el) {
  if (!el) return null;
  const attrs = {};
  for (const a of ['id', 'name', 'type', 'placeholder', 'data-test', 'data-testid', 'aria-label', 'role', 'href', 'for']) {
    const v = el.getAttribute(a);
    if (v) attrs[a] = v;
  }
  const tag = el.tagName.toLowerCase();
  const text = (el.innerText || '').trim().slice(0, 80);
  const label = el.labels?.[0]?.textContent?.trim();
  return { tag, attrs, text, label };
}

async function collectPage(page, url, selectors) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  return page.evaluate((sels) => {
    const out = { url: location.href, dataTest: [], dataTestId: [], elements: {} };
    document.querySelectorAll('[data-test]').forEach((el) => {
      out.dataTest.push({ test: el.getAttribute('data-test'), tag: el.tagName, text: (el.innerText || '').slice(0, 60) });
    });
    document.querySelectorAll('[data-testid]').forEach((el) => {
      out.dataTestId.push({ testid: el.getAttribute('data-testid'), tag: el.tagName });
    });
    for (const [key, sel] of Object.entries(sels)) {
      const nodes = document.querySelectorAll(sel);
      out.elements[key] = Array.from(nodes).slice(0, 5).map((el) => {
        const attrs = {};
        for (const a of ['id', 'name', 'type', 'placeholder', 'data-test', 'data-testid', 'aria-label', 'role', 'href', 'for', 'formcontrolname', 'ng-reflect-name']) {
          const v = el.getAttribute(a);
          if (v) attrs[a] = v;
        }
        return {
          tag: el.tagName,
          attrs,
          text: (el.innerText || el.textContent || '').trim().slice(0, 100),
          label: el.labels?.[0]?.textContent?.trim() || null,
          disabled: el.disabled ?? null,
          visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
        };
      });
    }
    return out;
  }, selectors);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {};

  results.login = await collectPage(page, `${BASE}/auth/login`, {
    email: 'input[type="email"], input[name*="email" i], input[formcontrolname="email"]',
    password: 'input[type="password"]',
    submit: 'button[type="submit"], button',
    alerts: '[role="alert"], .alert, .invalid-feedback',
    links: 'a[href]',
  });

  results.register = await collectPage(page, `${BASE}/auth/register`, {
    inputs: 'input, select, textarea',
    submit: 'button[type="submit"], button.btn-primary',
    alerts: '[role="alert"], .alert, .invalid-feedback, .text-danger',
  });

  results.products = await collectPage(page, `${BASE}/products`, {
    search: 'input[type="search"], input[placeholder*="Search" i], input[formcontrolname*="search" i]',
    categories: 'nav a, .category a, [data-test*="category"]',
    productLinks: 'a[href*="/product/"]',
    cards: '.card, [data-test*="product"]',
  });

  // Try category browse
  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const categoryInfo = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]')).filter((a) =>
      /category|hand-tools|hammer/i.test(a.getAttribute('href') || a.textContent || '')
    );
    return links.slice(0, 20).map((a) => ({
      text: a.textContent?.trim(),
      href: a.getAttribute('href'),
      dataTest: a.getAttribute('data-test'),
    }));
  });
  results.categoryLinks = categoryInfo;

  // Product detail - Combination Pliers
  results.productDetail = await collectPage(page, `${BASE}/product/01K4K5M8Z8Y7X6W5V4U3T2S1R0`, {
    addToCart: 'button',
    stock: '[data-test*="stock"], .badge, .stock',
    qty: 'input[type="number"], input[formcontrolname*="quantity" i]',
  });

  // Find Combination Pliers URL from products page
  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const pliersHref = await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find((el) => /combination pliers/i.test(el.textContent || ''));
    return a?.getAttribute('href') || null;
  });
  if (pliersHref) {
    const url = pliersHref.startsWith('http') ? pliersHref : `${BASE}${pliersHref}`;
    results.combinationPliers = await collectPage(page, url, {
      title: 'h1, h2, [data-test*="name"]',
      price: '[data-test*="price"], .price',
      stock: '.badge, [data-test*="stock"], span',
      addToCart: 'button',
      qty: 'input[type="number"]',
    });
    results.combinationPliers.productUrl = url;
  }

  const hammerHref = await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find((el) => /^claw hammer$/i.test((el.textContent || '').trim()));
    return a?.getAttribute('href') || null;
  });
  if (hammerHref) {
    const url = hammerHref.startsWith('http') ? hammerHref : `${BASE}${hammerHref}`;
    results.clawHammer = await collectPage(page, url, {
      addToCart: 'button',
      stock: '.badge',
      qty: 'input[type="number"]',
    });
  }

  const longNoseHref = await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find((el) => /long nose pliers/i.test(el.textContent || ''));
    return a?.getAttribute('href') || null;
  });
  if (longNoseHref) {
    const url = longNoseHref.startsWith('http') ? longNoseHref : `${BASE}${longNoseHref}`;
    results.longNosePliers = await collectPage(page, url, {
      addToCart: 'button',
      stock: '.badge, span',
      alerts: '[role="alert"]',
    });
    results.longNosePliers.productUrl = url;
  }

  // Login for authenticated pages
  await page.goto(`${BASE}/auth/login`);
  await page.waitForTimeout(1500);
  await page.locator('[data-test="email"]').fill('customer@practicesoftwaretesting.com');
  await page.locator('[data-test="password"]').fill('welcome01');
  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes('/auth/login'), { timeout: 20000 }).catch(() => null),
    page.locator('[data-test="login-submit"]').click(),
  ]);
  await page.waitForTimeout(3000);

  results.afterLoginNav = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href], button')).filter((el) =>
      /account|profile|logout|cart|invoice/i.test(el.textContent || el.getAttribute('href') || '')
    ).slice(0, 30).map((el) => ({
      tag: el.tagName,
      text: (el.textContent || '').trim().slice(0, 60),
      href: el.getAttribute('href'),
      dataTest: el.getAttribute('data-test'),
      ariaLabel: el.getAttribute('aria-label'),
    }));
  });

  results.profile = await collectPage(page, `${BASE}/account/profile`, {
    fields: 'input, select, textarea',
    headings: 'h1, h2, h3',
    display: 'p, span, dd, dt',
  });

  results.cart = await collectPage(page, `${BASE}/cart`, {
    lineItems: 'table tr, .cart-item, [data-test*="cart"]',
    qtyInputs: 'input[type="number"]',
    buttons: 'button, a.btn',
    total: '[data-test*="total"], .total',
  });

  results.checkout = await collectPage(page, `${BASE}/checkout`, {
    billingInputs: 'input, select',
    payment: 'input[type="radio"], label',
    buttons: 'button',
  });

  results.invoices = await collectPage(page, `${BASE}/account/invoices`, {
    rows: 'table tr, a[href*="invoice"], [data-test*="invoice"]',
    links: 'a[href]',
  });

  // Empty cart checkout
  await page.goto(`${BASE}/cart`);
  await page.waitForTimeout(1500);
  // clear cart if items
  const clearBtns = page.getByRole('button', { name: /remove|delete|clear/i });
  const count = await clearBtns.count();
  for (let i = 0; i < count; i++) {
    await clearBtns.first().click();
    await page.waitForTimeout(500);
  }
  results.emptyCart = await collectPage(page, `${BASE}/cart`, {
    emptyMessage: '.alert, p, h2, h3',
    proceedBtn: 'a[href*="checkout"], button',
  });
  await page.goto(`${BASE}/checkout`);
  await page.waitForTimeout(2000);
  results.emptyCheckout = {
    url: page.url(),
    dom: await collectPage(page, page.url(), {
      alerts: '[role="alert"], .alert',
      buttons: 'button, a',
    }),
  };

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
