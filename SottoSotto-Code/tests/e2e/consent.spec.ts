import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import site from '../../data/site.json' with { type: 'json' };

/* M7 consent (BUILD_PLAN M7 "done when"; D16, D40, ARCHITECTURE §9.2). */

// Start with no stored choice (other specs pre-set one so the banner stays out of their way).
test.use({ storageState: { cookies: [], origins: [] } });

const copy = site.copy.cookieBanner;
const isGoogle = (url: string | URL) =>
  /google(tagmanager|-analytics)?\.com|analytics\.google/.test(String(url));

/** Records every Google request; answers gtag.js with an empty script so nothing leaves the machine. */
async function watchGoogle(page: Page): Promise<string[]> {
  const seen: string[] = [];
  page.on('request', (r) => {
    if (isGoogle(r.url())) seen.push(r.url());
  });
  await page.route(isGoogle, (route) =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
  );
  return seen;
}

const banner = (page: Page) => page.getByRole('region', { name: copy.heading });

test('no request to Google before Accept; Accept loads GA4 with ads denied', async ({ page }) => {
  const google = await watchGoogle(page);
  await page.goto('/');
  await expect(banner(page)).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(google).toEqual([]);

  await banner(page).getByRole('button', { name: copy.accept }).click();
  await expect(banner(page)).toBeHidden();
  await expect.poll(() => google.length).toBeGreaterThan(0);
  expect(google[0]).toContain(`googletagmanager.com/gtag/js?id=${site.analytics.ga4MeasurementId}`);

  const consentDefault = await page.evaluate(() =>
    (window.dataLayer ?? [])
      .map((a) => Array.from(a as ArrayLike<unknown>))
      .find((a) => a[0] === 'consent' && a[1] === 'default'),
  );
  expect(consentDefault?.[2]).toEqual({
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  // The choice is remembered: the next page loads GA4 again without asking.
  await page.goto('/menu/');
  await expect.poll(() => google.length).toBeGreaterThan(1);
  await expect(banner(page)).toBeHidden();
});

test('Reject keeps Google away across pages and is remembered', async ({ page }) => {
  const google = await watchGoogle(page);
  await page.goto('/');
  await banner(page).getByRole('button', { name: copy.reject }).click();
  await expect(banner(page)).toBeHidden();
  await page.goto('/venue/');
  await page.waitForLoadState('networkidle');
  await expect(banner(page)).toBeHidden();
  expect(google).toEqual([]);
});

test('Cookie settings reopens the banner; withdrawing removes _ga cookies', async ({
  page,
  context,
  baseURL,
}) => {
  await watchGoogle(page);
  await page.goto('/');
  await banner(page).getByRole('button', { name: copy.accept }).click();
  await context.addCookies([
    { name: '_ga', value: 'GA1.1.123.456', url: baseURL! },
    { name: '_ga_2TMCMCTHRD', value: 'GS1.1.1', url: baseURL! },
    { name: 'other', value: 'kept', url: baseURL! },
  ]);

  const settings = page.locator('footer').getByRole('button', { name: copy.settings });
  await settings.scrollIntoViewIfNeeded();
  await settings.click();
  await expect(banner(page)).toBeVisible();
  await expect(banner(page)).toBeFocused();
  await banner(page).getByRole('button', { name: copy.reject }).click();
  await expect(settings).toBeFocused();

  const names = (await context.cookies()).map((c) => c.name);
  expect(names).toContain('other');
  expect(names.filter((n) => n.startsWith('_ga'))).toEqual([]);
});

test('the banner passes axe, buttons have equal weight, Privacy link works', async ({
  page,
}, testInfo) => {
  await watchGoogle(page);
  await page.goto('/');
  await expect(banner(page)).toBeVisible();
  const results = await new AxeBuilder({ page }).include('[data-cookie-banner]').analyze();
  expect(results.violations).toEqual([]);

  const [a, r] = await Promise.all(
    [copy.accept, copy.reject].map((name) =>
      banner(page).getByRole('button', { name }).boundingBox(),
    ),
  );
  expect(Math.round(a!.width)).toBe(Math.round(r!.width));
  expect(Math.round(a!.height)).toBe(Math.round(r!.height));

  // Never covers the header's Book a Table button.
  if (testInfo.project.name === 'desktop') {
    const book = await page
      .locator('header')
      .getByRole('link', { name: /Book a Table/i })
      .first()
      .boundingBox();
    const box = await banner(page).boundingBox();
    expect(box!.y).toBeGreaterThan(book!.y + book!.height);
  }

  await banner(page).getByRole('link', { name: copy.privacyLink }).click();
  await expect(page).toHaveURL(/\/privacy\/$/);
});
