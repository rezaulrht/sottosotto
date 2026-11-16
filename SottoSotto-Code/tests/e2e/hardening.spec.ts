import { expect, test, type Page } from '@playwright/test';
import { CSP_DIRECTIVES } from '../../config/headers';
import site from '../../data/site.json' with { type: 'json' };

/* M8 hardening: legacy links, SEO tags, JSON-LD and the enforced CSP (BUILD_PLAN M8). */

const ROUTES = ['/', '/menu/', '/venue/', '/find-us/', '/book/', '/privacy/'];

test.describe('old ?p= links land on the right pages', () => {
  for (const [p, path] of [
    ['menu', '/menu/'],
    ['venue', '/venue/'],
    ['contactus', '/find-us/'],
    ['privacy', '/privacy/'],
  ] as const) {
    test(`/?p=${p} → ${path}`, async ({ page }) => {
      await page.goto(`/?p=${p}`);
      await expect(page).toHaveURL(new RegExp(`${path.replace(/\//g, '\\/')}$`));
    });
  }

  test('/?p=index and unknown values stay on Home with a clean URL', async ({ page }) => {
    for (const p of ['index', 'nope']) {
      await page.goto(`/?p=${p}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(site.name);
      expect(new URL(page.url()).search).toBe('');
    }
  });
});

test('every route has its own title, description, canonical and an OG image', async ({ page }) => {
  const titles = new Set<string>();
  for (const route of ROUTES) {
    await page.goto(route);
    const title = await page.title();
    titles.add(title);
    const meta = (sel: string) => page.locator(sel).getAttribute('content');
    expect(await meta('meta[name="description"]')).toBeTruthy();
    expect(await meta('meta[property="og:title"]')).toBeTruthy();
    expect(await meta('meta[property="og:image"]')).toBe(`${site.website}/og/default.jpg`);
    expect(await meta('meta[property="og:image:width"]')).toBe('1200');
    expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${site.website}${route}`,
    );
  }
  expect(titles.size).toBe(ROUTES.length);
  const img = await page.request.get('/og/default.jpg');
  expect(img.headers()['content-type']).toBe('image/jpeg');
});

test('Home carries a Restaurant JSON-LD block without mock values', async ({ page }) => {
  await page.goto('/');
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(blocks).toHaveLength(1);
  const ld = JSON.parse(blocks[0]!) as Record<string, unknown>;
  expect(ld).toMatchObject({ '@type': 'Restaurant', name: site.name, servesCuisine: 'Italian' });
  // site.json address, geo, contact and social are flagged today, so they are left out.
  expect(blocks[0]).not.toContain(site.address.postcode);
  expect(blocks[0]).not.toContain(site.contact.phoneE164);
  expect(blocks[0]).not.toContain(String(site.geo.lat));
});

test('sitemap lists every route on the real domain', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const route of ROUTES) expect(xml).toContain(`<loc>${site.website}${route}</loc>`);
});

/**
 * Serves every page with the production CSP enforced (the test server sends no headers)
 * and records violations. `upgrade-insecure-requests` is dropped: it would rewrite the
 * local http:// requests.
 */
async function enforceCsp(page: Page): Promise<string[]> {
  const csp = Object.entries(CSP_DIRECTIVES)
    .filter(([name]) => name !== 'upgrade-insecure-requests')
    .map(([name, values]) => [name, ...values].join(' '))
    .join('; ');
  const violations: string[] = [];
  page.on('console', (msg) => {
    if (/Content Security Policy/i.test(msg.text())) violations.push(msg.text());
  });
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error(`Content Security Policy violation: ${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'localhost') {
      // GA4 after consent: answer locally with an empty script / pixel.
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    }
    if (route.request().resourceType() !== 'document') return route.continue();
    const response = await route.fetch();
    const headers = { ...response.headers(), 'content-security-policy': csp };
    return route.fulfill({ response, headers });
  });
  return violations;
}

test('no CSP violations on any route, including GA4 after consent', async ({ page, context }) => {
  await context.clearCookies();
  const violations = await enforceCsp(page);
  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: 'load' });
  }
  // Accept analytics: gtag.js is requested from googletagmanager.com under the same CSP.
  await page.evaluate(() => localStorage.removeItem('consent.v1'));
  await page.goto('/');
  await page.getByRole('button', { name: site.copy.cookieBanner.accept }).click();
  await page.waitForFunction(() => document.getElementById('ga4-gtag') !== null);
  // Open the booking dialog too (its own client code).
  await page.getByRole('banner').getByRole('link', { name: 'Book a Table' }).click();
  await expect(page.getByRole('dialog', { name: 'Book a Table' })).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('button').first()).toBeVisible();
  expect(violations).toEqual([]);
});
