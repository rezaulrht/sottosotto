import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import site from '../../data/site.json' with { type: 'json' };

/* M6 Find Us (BUILD_PLAN M6 "done when"). */

const report = () =>
  JSON.parse(readFileSync('content-report.json', 'utf8')) as {
    flags: Array<{ file: string; path: string; reasons: string[] }>;
  };

test('the map makes no third-party request; Get directions opens Google Maps at the pin', async ({
  page,
  baseURL,
}) => {
  const origins = new Set<string>();
  page.on('request', (r) => origins.add(new URL(r.url()).origin));
  await page.goto('/find-us/');
  const map = page.getByRole('img', { name: /Map of the streets around North Parade/ });
  await map.scrollIntoViewIfNeeded();
  await expect(map.locator('img')).toHaveJSProperty('complete', true);
  await page.waitForLoadState('networkidle');
  expect(
    [...origins].filter((o) => o !== new URL(baseURL!).origin && !o.startsWith('data:')),
  ).toEqual([]);

  await expect(page.getByRole('link', { name: /Get directions/ })).toHaveAttribute(
    'href',
    `https://www.google.com/maps/dir/?api=1&destination=${site.geo.lat},${site.geo.lng}`,
  );
  await expect(page.getByRole('link', { name: '© OpenStreetMap contributors' })).toBeVisible();
  // The pin is the (mock) geo from site.json, counted by the mock badge.
  expect(report().flags).toContainEqual({ file: 'site.json', path: 'geo', reasons: ['mock'] });
});

test('parking cards: real names and addresses; Cricket Club without one; walking times are mock', async ({
  page,
}) => {
  await page.goto('/find-us/');
  const cards = page.locator('#parking li');
  await expect(cards).toHaveCount(site.parking.length);
  for (const [i, p] of site.parking.entries()) {
    const card = cards.nth(i);
    await expect(card.getByRole('heading', { name: p.name })).toBeVisible();
    if (p.address) await expect(card).toContainText(p.address);
    await expect(card).toContainText(`${p.walkingMinutes.value} min walk`);
  }
  const cricket = cards.filter({ hasText: 'Bath Cricket Club' });
  await expect(cricket.locator('p')).not.toContainText([/Bath BA/]);
  const flags = report().flags.map((f) => `${f.path}:${f.reasons.join(',')}`);
  for (const i of site.parking.keys()) expect(flags).toContain(`parking[${i}].walkingMinutes:mock`);
});

test('"Send your CV" opens a mail to careers@ (to confirm)', async ({ page }) => {
  await page.goto('/find-us/');
  await expect(page.getByRole('link', { name: 'Send your CV' })).toHaveAttribute(
    'href',
    `mailto:${site.contact.careersEmail}`,
  );
  expect(report().flags).toContainEqual({
    file: 'site.json',
    path: 'contact',
    reasons: ['toConfirm'],
  });
});

test('the drone clip opens the page, above the map, with a pause button', async ({ page }) => {
  await page.goto('/find-us/');
  const hero = page.locator('[aria-labelledby="find-title"]');
  await expect(hero.locator('video')).toHaveCount(1);
  const poster = hero.locator('picture img').first();
  await expect(poster).toBeVisible();
  const map = page.getByRole('img', { name: /Map of the streets around North Parade/ });
  const [p, m] = await Promise.all([poster.boundingBox(), map.boundingBox()]);
  expect(p!.y).toBeLessThan(m!.y);
  await expect(hero.getByRole('button', { name: 'Pause background motion' })).toBeVisible();
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('Find Us shows the poster only and never requests the video', async ({ page }) => {
    const videos: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('/video/findus-') && /\.(mp4|webm)$/.test(r.url())) videos.push(r.url());
    });
    await page.goto('/find-us/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[aria-labelledby="find-title"] picture img').first()).toBeVisible();
    expect(videos).toEqual([]);
  });
});
