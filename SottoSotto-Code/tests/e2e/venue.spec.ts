import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import venue from '../../data/venue.json' with { type: 'json' };

/* M5 Venue page (BUILD_PLAN M5 "done when"). */

const descent = (page: Page) => page.locator('[aria-labelledby="venue-descent"]');
const rooms = (page: Page) => page.locator('[aria-labelledby="venue-rooms"][data-effect]');
const track = (page: Page) => page.locator('[data-track]');

test('the North Parade sentence is exactly as in venue.json and flagged for verification', async ({
  page,
}) => {
  await page.goto('/venue/');
  await expect(page.locator('[data-needs-verification]')).toHaveText(venue.setting.fact.text);
  const report = JSON.parse(readFileSync('content-report.json', 'utf8')) as {
    flags: Array<{ file: string; path: string; reasons: string[] }>;
  };
  expect(report.flags).toContainEqual({
    file: 'venue.json',
    path: 'setting.fact',
    reasons: ['needsVerification'],
  });
});

test('the street photo is credited; the other photos are marked placeholders', async ({ page }) => {
  await page.goto('/venue/');
  // The street photo is a real, openly licensed photo (D63); the rest are placeholders.
  const total =
    1 + venue.descent.images.length + 1 + venue.rooms.images.length + venue.details.images.length;
  await expect(page.locator('main [data-placeholder]')).toHaveCount(total);
  await expect(page.getByRole('img', { name: 'Placeholder: room 1' })).toBeAttached();
  const street = page.getByRole('img', { name: venue.setting.image.alt });
  await expect(street).toBeAttached();
  await expect(
    page.getByText(/Photo: Benjamin Smith, CC BY-SA 4.0, via Wikimedia Commons/),
  ).toBeAttached();
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop only');

  test('pins the descent and slides the rooms sideways', async ({ page }) => {
    await page.goto('/venue/');
    await expect(page.locator('[data-motion-mode="desktop"]')).toHaveCount(1);
    await expect(descent(page)).toHaveAttribute('data-pinned', '');
    await expect(rooms(page)).toHaveAttribute('data-pinned', '');

    // Scroll into the rooms section: the row moves left while the section is held.
    const top = await rooms(page).evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo({ top: y + 600, behavior: 'instant' }), top);
    await expect
      .poll(() =>
        track(page).evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41),
      )
      .toBeLessThan(-100);
  });
});

test('phone: no pinning; the rooms are a swipe gallery with snapping', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Phone only');
  await page.goto('/venue/');
  await expect(page.locator('[data-motion-mode="mobile"]')).toHaveCount(1);
  await expect(page.locator('main [data-pinned]')).toHaveCount(0);
  await expect(track(page)).toHaveCSS('scroll-snap-type', 'x mandatory');
  const scrollable = await track(page).evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(scrollable).toBe(true);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('everything is static: no pins, native horizontal scroll', async ({ page }) => {
    await page.goto('/venue/');
    await expect(page.locator('[data-motion-mode="reduced"]')).toHaveCount(1);
    await expect(page.locator('main [data-pinned]')).toHaveCount(0);
    await expect(track(page)).toHaveCSS('overflow-x', 'auto');
    await expect(track(page)).toHaveCSS('transform', 'none');
  });
});
