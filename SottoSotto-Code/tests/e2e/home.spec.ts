import { expect, test, type Page } from '@playwright/test';
import site from '../../data/site.json' with { type: 'json' };

/*
 * M3 Home page (BUILD_PLAN M3): every section in the three motion modes, no pinning on
 * phones, no hidden content without JS, resize and back/forward without breakage.
 */

const SECTIONS = [
  'Our Food Is Our Culture',
  'Venue',
  'Sotto Sotto in the news',
  'Menu',
  'Wine list',
  'Reserve your table',
];

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

const mode = (page: Page) => page.locator('[data-motion-mode]');

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('all content is visible and Book links go to the booking page', async ({ page }) => {
    await page.goto('/');
    for (const name of SECTIONS) {
      await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
    }
    await expect(page.getByText(site.copy.philosophyFull[2]!)).toBeVisible();
    await expect(page.locator('[data-step]')).toHaveCount(4);
    await expect(page.locator('[data-pinned]')).toHaveCount(0);
    for (const link of await page.locator('main a[data-booking]').all()) {
      await expect(link).toHaveAttribute('href', site.booking.page);
    }
    const opacity = await page
      .locator('[data-step]')
      .last()
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('static: no pinning, no split text', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await expect(mode(page)).toHaveAttribute('data-motion-mode', 'reduced');
    await expect(page.locator('[data-pinned]')).toHaveCount(0);
    await expect(page.locator('#home-philosophy')).toHaveText('Our Food Is Our Culture');
    await expect(page.locator('#home-philosophy > *')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test('phone: no pinning, sections still reveal', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Phone only');
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(mode(page)).toHaveAttribute('data-motion-mode', 'mobile');
  await expect(page.locator('[data-pinned]')).toHaveCount(0);
  await page.locator('[data-step]').last().scrollIntoViewIfNeeded();
  await expect(page.locator('[data-step]').last()).toHaveCSS('opacity', '1', { timeout: 5000 });
  expect(errors).toEqual([]);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop only');

  test('pins the stair descent, with Lenis smooth scrolling', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await expect(mode(page)).toHaveAttribute('data-motion-mode', 'desktop');
    await expect(page.locator('[data-pinned]')).toHaveCount(1);
    await expect(page.locator('html')).toHaveClass(/\blenis\b/);
    expect(errors).toEqual([]);
  });

  test('resizing switches mode without errors and restores the pin', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await expect(page.locator('[data-pinned]')).toHaveCount(1);
    await page.setViewportSize({ width: 800, height: 900 });
    await expect(mode(page)).toHaveAttribute('data-motion-mode', 'mobile');
    await expect(page.locator('[data-pinned]')).toHaveCount(0);
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(mode(page)).toHaveAttribute('data-motion-mode', 'desktop');
    await expect(page.locator('[data-pinned]')).toHaveCount(1);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test('keyboard scrolling works', async ({ page }) => {
    await page.goto('/');
    // Wait until the pin has added its scroll distance, so End targets the final height.
    await page.waitForLoadState('load');
    await expect(page.locator('[data-pinned]')).toHaveCount(1);
    await page.waitForTimeout(300);
    await page.locator('body').click({ position: { x: 5, y: 300 } });
    await page.keyboard.press('PageDown');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
    // Let Lenis settle first: a key pressed mid-animation can be overtaken by it.
    let last = -1;
    await expect
      .poll(async () => {
        const y = await page.evaluate(() => Math.round(window.scrollY));
        const settled = y === last;
        last = y;
        return settled;
      })
      .toBe(true);
    await page.keyboard.press('End');
    await expect
      .poll(() =>
        page.evaluate(
          () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2,
        ),
      )
      .toBe(true);
  });

  test('back and forward keep the page working', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await page.locator('#site-header').getByRole('link', { name: 'Menu' }).click();
    await expect(page).toHaveURL(/\/menu\/$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(mode(page)).toHaveAttribute('data-motion-mode', 'desktop');
    await expect(page.locator('[data-pinned]')).toHaveCount(1);
    await page.goForward();
    await expect(page.getByRole('heading', { level: 1, name: 'Menu' })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test('the wine list is a rack of labels: pulling one out shows that wine', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section[aria-labelledby="home-wine"]');
  await expect(section.getByRole('heading', { level: 2, name: 'Wine list' })).toBeAttached();
  await expect(section.getByRole('img', { name: /Wine barrels/ })).toBeAttached();
  const tabs = section.getByRole('tab');
  await expect(tabs).toHaveCount(28);
  const card = section.getByRole('tabpanel');
  // The first wine is pulled out to start with, and its card reads in full.
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
  await expect(card).toContainText('Pinot Grigio Blush');
  await expect(card).toContainText('Very soft with aromas of freshly crushed cranberries');
  await expect(section).not.toContainText('£');
  // One tab stop; arrow keys move along the rack.
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.nth(1)).toBeFocused();
  await page.keyboard.press('End');
  await expect(tabs.last()).toBeFocused();
  // Tapping or clicking a label pulls it out.
  await section.getByRole('tab', { name: 'Syrah, Red' }).click();
  await expect(card).toContainText('Molino a Vento · Sicily · 2024/25');
  await expect(section.getByRole('link', { name: 'See the full wine list' })).toHaveAttribute(
    'href',
    '/menu/#wine',
  );
});

test('the booking band runs straight into the footer', async ({ page }) => {
  await page.goto('/');
  const band = page.locator('section[aria-labelledby="home-book"]');
  await expect(band.getByRole('img', { name: /candles lit/ })).toBeAttached();
  await expect(band.getByRole('link', { name: /book a table/i })).toBeVisible();
  const gap = await band.evaluate((el) => {
    const footer = document.querySelector('footer')!;
    return footer.getBoundingClientRect().top - el.getBoundingClientRect().bottom;
  });
  expect(Math.abs(gap)).toBeLessThan(1);
});

test('the menu section is a strip of courses, each opening its part of the Menu page', async ({
  page,
}) => {
  await page.goto('/');
  const menu = page.locator('[aria-labelledby="home-menu"]');
  await expect(menu.getByRole('link', { name: /^See the full menu/ })).toHaveAttribute(
    'href',
    '/menu/',
  );
  const courses = menu.locator('li a');
  await expect(courses).toHaveCount(4);
  const hrefs = await courses.evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  expect(hrefs).toEqual([
    '/menu/#group-starters',
    '/menu/#group-pasta-risotto',
    '/menu/#group-specialities',
    '/menu/#dessert',
  ]);
  for (const [i, name] of [
    'To start',
    'Pasta & risotto',
    'Specialities',
    'Desserts & Cheese',
  ].entries())
    await expect(courses.nth(i)).toContainText(name);
  // Each course has its photo and a taste of its dishes (names only, from the data).
  await expect(menu.locator('li img')).toHaveCount(4);
  await expect(courses.first()).toContainText('Bruschetta ai gamberoni');
  await expect(courses.first()).toContainText('6 dishes');
  // A taste, not a copy: no prices.
  await expect(menu).not.toContainText('£');
  await expect(page.locator('#home-find')).toHaveCount(0);
});

test('phone: the courses swipe sideways without widening the page', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Phone only');
  await page.goto('/');
  const tops = await page
    .locator('[aria-labelledby="home-menu"] li')
    .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('phone: the venue heading comes before its photos, which swipe sideways', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Phone only');
  await page.goto('/');
  const venue = page.locator('[aria-labelledby="home-venue"]');
  // Layout boxes (offsetTop/Left), not the fade-in transform.
  const box = (el: HTMLElement) => ({ top: el.offsetTop, left: el.offsetLeft });
  const heading = await venue.getByRole('heading', { name: 'Venue' }).evaluate(box);
  const [first, second] = await venue
    .locator('[data-step]')
    .evaluateAll((els) =>
      els
        .slice(0, 2)
        .map((e) => ({ top: (e as HTMLElement).offsetTop, left: (e as HTMLElement).offsetLeft })),
    );
  expect(heading.top).toBeLessThan(first!.top);
  expect(second!.top).toBe(first!.top);
  expect(second!.left).toBeGreaterThan(first!.left);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
