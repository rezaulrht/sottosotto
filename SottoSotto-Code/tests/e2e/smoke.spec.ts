import { expect, test, type Page } from '@playwright/test';
import site from '../../data/site.json' with { type: 'json' };

/*
 * M1 smoke tests against the staging static export (npm run build:staging first).
 * Booking modal, consent, reduced-motion and axe checks are added with their milestones.
 */

const ROUTES = [
  { path: '/', h1: site.name },
  { path: '/menu/', h1: 'Menu' },
  { path: '/venue/', h1: 'The Venue' },
  { path: '/find-us/', h1: 'Find Us' },
  { path: '/privacy/', h1: 'Sotto Sotto Privacy Policy' },
];

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

for (const route of ROUTES) {
  test(`${route.path} renders with the shared layout`, async ({ page }) => {
    const errors = collectErrors(page);
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(route.h1);

    // Footer: hours, phone and email from site.json.
    const footer = page.locator('footer');
    await expect(footer).toContainText('Tue–Sat');
    await expect(footer).toContainText('12–2 & 5–10');
    await expect(footer.getByRole('link', { name: site.contact.phone })).toHaveAttribute(
      'href',
      `tel:${site.contact.phoneE164}`,
    );
    await expect(footer.getByRole('link', { name: site.contact.email })).toHaveAttribute(
      'href',
      `mailto:${site.contact.email}`,
    );

    // Staging: mock badge visible, page not indexable.
    await expect(page.getByText(/^Mock data · \d+ values/)).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

    // No horizontal scrolling at any viewport.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    expect(errors).toEqual([]);
  });
}

test('Book a Table is a real link to Hospres (no-JS fallback)', async ({ page }) => {
  await page.goto('/');
  // By role: the closed mobile menu (also inside the header) is not in the accessibility tree.
  const book = page.getByRole('banner').getByRole('link', { name: /^Book a Table/ });
  await expect(book).toHaveAttribute('href', site.booking.widgetUrl);
  await expect(book).toHaveAttribute('target', '_blank');
  await expect(book).toBeVisible();
});

test('hours chip shows today’s state after hydration', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.locator('main').getByText(/^(Open today · |Closed (today|now)(, we reopen .+)?$)/),
  ).toBeVisible();
});

test('header turns solid after scrolling', async ({ page }) => {
  await page.goto('/menu/');
  const header = page.locator('#site-header');
  await expect(header).not.toHaveAttribute('data-scrolled');
  await page.evaluate(() => window.scrollTo(0, 800));
  await expect(header).toHaveAttribute('data-scrolled', '');
});

test('menu sections are reachable by hash', async ({ page }) => {
  await page.goto('/menu/#dessert');
  await expect(page.locator('#dessert-heading')).toBeInViewport();
});

test('unknown pages return the 404 page', async ({ page }) => {
  const response = await page.goto('/no-such-page/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
});

test('mobile nav opens, traps focus and closes with Escape', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Phone layout only');
  await page.goto('/');
  const opener = page.getByRole('button', { name: 'Open menu' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Site menu' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Venue' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();

  await opener.click();
  await dialog.getByRole('link', { name: 'Find Us' }).click();
  await expect(page).toHaveURL(/\/find-us\/$/);
  await expect(dialog).toBeHidden();
});
