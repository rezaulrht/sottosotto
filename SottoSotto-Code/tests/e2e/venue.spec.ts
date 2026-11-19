import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import venue from '../../data/venue.json' with { type: 'json' };

/* M5 Venue page (BUILD_PLAN M5 "done when"). */

const stairs = (page: Page) => page.locator('[data-venue-stairs]');
const wall = (page: Page) => page.locator('[data-venue-wall]');

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

test("the street photo is credited; the venue photos are the client's own, not flagged", async ({
  page,
}) => {
  await page.goto('/venue/');
  // No placeholders left: the venue photos are the client's own (D76).
  await expect(page.locator('main [data-placeholder]')).toHaveCount(0);
  await expect(page.getByRole('img', { name: venue.wall.images[0]!.alt })).toBeAttached();
  const { flags } = JSON.parse(readFileSync('content-report.json', 'utf8')) as {
    flags: Array<{ file: string; path: string; reasons: string[] }>;
  };
  const photos = flags.filter((f) => f.file === 'venue.json' && /image/.test(f.path));
  expect(photos).toEqual([]);
  const street = page.getByRole('img', { name: venue.setting.image.alt });
  await expect(street).toBeAttached();
  await expect(
    page.getByText(/Photo: Benjamin Smith, CC BY-SA 4.0, via Wikimedia Commons/),
  ).toBeAttached();
});

test('the rooms are set into the stone wall: every photo in an arch, round or plaque niche', async ({
  page,
}) => {
  await page.goto('/venue/');
  await expect(wall(page).locator('figure')).toHaveCount(venue.wall.images.length);
  for (const img of venue.wall.images) {
    await expect(wall(page).getByRole('img', { name: img.alt }).first()).toBeAttached();
  }
  // Arches have a round top: the frame's top corners are fully rounded.
  const radius = await wall(page)
    .locator('figure')
    .first()
    .locator('div')
    .first()
    .evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
  expect(parseFloat(radius)).toBeGreaterThan(50);
  // Our story sits in a niche beside its heading.
  await expect(page.getByRole('img', { name: venue.story.image.alt })).toBeAttached();
  await expect(page.getByRole('heading', { name: venue.story.heading })).toBeVisible();
});

test('the stairs: held while scrolling, the street closes overhead and the line arrives', async ({
  page,
}) => {
  await page.goto('/venue/');
  const box = await stairs(page).boundingBox();
  const vh = page.viewportSize()!.height;
  expect(box!.height).toBeGreaterThan(vh * 2.5);
  const lines = page.locator('[data-venue-stairs] p span');
  await expect(lines).toHaveText(['Leave the street,', 'take the stairs,', 'and step inside.']);
  const top = await stairs(page).evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  // Near the start: the street fills the stage and the last line has not arrived.
  await page.evaluate((y) => window.scrollTo({ top: y + 10, behavior: 'instant' }), top);
  await expect
    .poll(() => lines.last().evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeLessThan(0.2);
  // At the end: the street is a strip of light overhead and the whole line is there.
  await page.evaluate(
    (y) => window.scrollTo({ top: y + window.innerHeight * 1.8 - 5, behavior: 'instant' }),
    top,
  );
  await expect
    .poll(() => lines.last().evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeGreaterThan(0.95);
  const clip = await page
    .locator('[data-venue-stairs] [aria-hidden] picture')
    .last()
    .evaluate((el) => getComputedStyle(el.parentElement!).clipPath);
  expect(clip).toContain('inset');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('everything is static: no pins, the stairs are one short screen, niches lit', async ({
    page,
  }) => {
    await page.goto('/venue/');
    await expect(page.locator('[data-motion-mode="reduced"]')).toHaveCount(1);
    await expect(page.locator('main [data-pinned]')).toHaveCount(0);
    const box = await stairs(page).boundingBox();
    expect(box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    await expect(page.locator('[data-venue-stairs] p span').last()).toHaveCSS('opacity', '1');
    await expect(wall(page).locator('picture').first()).toHaveCSS('opacity', '1');
  });
});
