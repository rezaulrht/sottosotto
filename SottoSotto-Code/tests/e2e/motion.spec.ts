import { expect, test, type Page } from '@playwright/test';

/* Motion across the site (D79): arrivals, the tucking header, rises, steps, reading line. */

const header = (page: Page) => page.locator('header').first();
const scrollBy = (page: Page, dy: number) =>
  page.evaluate((d) => window.scrollTo({ top: window.scrollY + d, behavior: 'instant' }), dy);

test('reading down tucks the header away; the first scroll up brings it back', async ({ page }) => {
  await page.goto('/privacy/');
  await page.waitForLoadState('networkidle');
  await scrollBy(page, 1400);
  await expect(header(page)).toHaveAttribute('data-tucked', '');
  await expect
    .poll(() => header(page).evaluate((el) => el.getBoundingClientRect().bottom))
    .toBeLessThanOrEqual(1);
  await scrollBy(page, -200);
  await expect(header(page)).not.toHaveAttribute('data-tucked', '');
  // Near the top it always stays.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await scrollBy(page, 120);
  await expect(header(page)).not.toHaveAttribute('data-tucked', '');
});

test('going to another page: the new page settles in', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The phone menu is a dialog; the arrival is the same code path');
  await page.goto('/privacy/');
  await page.waitForLoadState('networkidle');
  // A fresh load is never animated.
  expect(await page.locator('#main').evaluate((el) => el.getAnimations().length)).toBe(0);
  await page.getByRole('banner').getByRole('link', { name: 'Find Us' }).click();
  await expect
    .poll(() => page.locator('#main').evaluate((el) => el.getAnimations().length), {
      intervals: [20, 50, 100],
    })
    .toBeGreaterThan(0);
  await expect(page).toHaveURL(/\/find-us\/$/);
});

test('groups below the fold rise in the first time they are seen', async ({ page }) => {
  await page.goto('/find-us/');
  await page.waitForLoadState('networkidle');
  const parking = page.locator('#parking ul');
  await expect(parking).toHaveAttribute('data-rise-wait', '');
  await expect(parking.locator('li').first()).toHaveCSS('opacity', '0');
  await parking.scrollIntoViewIfNeeded();
  await expect(parking).not.toHaveAttribute('data-rise-wait', '');
  await expect(parking.locator('li').last()).toHaveCSS('opacity', '1', { timeout: 4000 });
  // Read in full by assistive tech all along.
  await expect(parking.getByRole('heading', { level: 3 })).toHaveCount(3);
});

test('booking steps slide in from the side you are heading', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-17T10:00:00Z'));
  await page.goto('/book/');
  const flow = page.locator('[data-dir], main [class*="flow"]').first();
  // The first step is not animated in.
  await expect(flow).not.toHaveAttribute('data-dir', /.+/);
  await page.getByRole('button', { name: 'Wednesday 18 November' }).click();
  await expect(flow).toHaveAttribute('data-dir', 'forward');
  await expect(flow.locator('section').first()).toHaveCSS('animation-name', /step-in/);
  await flow
    .getByRole('button', { name: /change/i })
    .first()
    .click();
  await expect(flow).toHaveAttribute('data-dir', 'back');
});

test('privacy: a reading line follows the scroll', async ({ page }) => {
  await page.goto('/privacy/');
  const line = page.locator('main [aria-hidden="true"]').first();
  // Drawn (it starts at zero width, so it is not "visible" yet).
  await expect(line).toHaveCSS('display', 'block');
  const scale = () =>
    line.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
  expect(await scale()).toBeLessThan(0.05);
  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
  );
  await expect.poll(scale).toBeGreaterThan(0.95);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('nothing waits hidden, the header stays, no reading line', async ({ page }) => {
    await page.goto('/find-us/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-rise-wait]')).toHaveCount(0);
    await scrollBy(page, 1400);
    await page.waitForTimeout(300);
    await expect(header(page)).not.toHaveAttribute('data-tucked', '');
    await page.goto('/privacy/');
    await expect(page.locator('main [aria-hidden="true"]').first()).toHaveCSS('display', 'none');
  });
});
