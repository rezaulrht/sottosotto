import { readFileSync } from 'node:fs';
import routes from '../../src/content/routes.json' with { type: 'json' };
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
  await expect(
    page.locator('[data-find-stage]').getByRole('link', { name: '© OpenStreetMap contributors' }),
  ).toBeVisible();
  // The pin is the confirmed geo from site.json (D81), no longer flagged.
  expect(report().flags.map((f) => `${f.file}:${f.path}`)).not.toContain('site.json:geo');
});

test('parking rows: real names and addresses, measured walks, a credited photo each', async ({
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
  // Walking times are measured now (D80), so none is flagged mock.
  const flags = report().flags.map((f) => `${f.path}:${f.reasons.join(',')}`);
  for (const i of site.parking.keys()) {
    expect(flags).not.toContain(`parking[${i}].walkingMinutes:mock`);
  }
  for (const [i, p] of site.parking.entries()) {
    if (!p.image) continue;
    const card = cards.nth(i);
    await expect(card.getByRole('img', { name: p.image.alt })).toBeAttached();
    await expect(card).toContainText(`Photo: ${p.image.credit!.author}`);
  }
});

test('getting here: the three walks drawn on the map, each way lights its route', async ({
  page,
}) => {
  await page.goto('/find-us/');
  const section = page.locator('section[aria-labelledby="find-getting-here"]');
  await expect(section.getByRole('heading', { name: 'Getting here' })).toBeVisible();
  const map = section.getByRole('img', { name: /Map of the walks to North Parade/ });
  await expect(map).toBeVisible();
  await expect(map.locator('path')).toHaveCount(3);
  const ways = section.getByRole('button');
  await expect(ways).toHaveCount(3);
  await expect(ways).toContainText(['By train', 'By bus', 'On foot']);
  for (const r of routes.routes) await expect(section).toContainText(`${r.minutes} min walk`);
  await expect(section).not.toContainText('Placeholder');
  // Pressing a way lights its route and dims the others.
  await ways.first().click();
  await expect(ways.first()).toHaveAttribute('aria-pressed', 'true');
  await expect(section.locator('[data-active="train"]')).toHaveCount(1);
  const opacity = (mode: string) =>
    section.locator(`svg g[data-mode="${mode}"]`).evaluate((el) => getComputedStyle(el).opacity);
  await expect.poll(() => opacity('bus')).toBe('0.25');
  await expect.poll(() => opacity('train')).toBe('1');
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

const stage = (page: import('@playwright/test').Page) => page.locator('[data-find-stage]');

test('one stage: the drone clip opens it and, scrolled through, lands on the map and the address', async ({
  page,
}) => {
  await page.goto('/find-us/');
  await expect(stage(page)).toHaveAttribute('data-scrolly', '');
  await expect(stage(page).locator('video')).toHaveCount(1);
  await expect(stage(page).getByRole('button', { name: 'Pause background motion' })).toBeVisible();
  const card = stage(page).locator('address');
  const cardOpacity = () =>
    card.evaluate((el) => Number(getComputedStyle(el.parentElement!).opacity));
  // Before landing the card is see-through, but still in the page for assistive tech, and
  // tabbing to its link shows it.
  expect(await cardOpacity()).toBeLessThan(0.05);
  await stage(page)
    .getByRole('link', { name: /Get directions/ })
    .focus();
  await expect.poll(cardOpacity).toBeGreaterThan(0.95);
  await stage(page)
    .getByRole('link', { name: /Get directions/ })
    .blur();
  await stage(page).evaluate((el: HTMLElement) =>
    window.scrollTo({
      top: el.offsetTop + el.offsetHeight - window.innerHeight,
      behavior: 'instant',
    }),
  );
  await expect(stage(page)).toHaveAttribute('data-landed', '');
  await expect(card).toBeVisible();
  await expect(card).toContainText(site.address.line1);
  const opacity = (sel: string) =>
    stage(page)
      .locator(sel)
      .first()
      .evaluate((el) => Number(getComputedStyle(el).opacity));
  await expect.poll(() => opacity('[class*="map"]')).toBeGreaterThan(0.95);
  await expect.poll(() => opacity('[class*="clip"]')).toBeLessThan(0.05);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('Find Us shows the map and the address at once and never requests the video', async ({
    page,
  }) => {
    const videos: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('/video/findus-') && /\.(mp4|webm)$/.test(r.url())) videos.push(r.url());
    });
    await page.goto('/find-us/');
    await page.waitForLoadState('networkidle');
    await expect(stage(page)).not.toHaveAttribute('data-scrolly', '');
    await expect(stage(page).locator('address')).toBeVisible();
    await expect(
      page.getByRole('img', { name: /Map of the streets around North Parade/ }),
    ).toBeVisible();
    const height = await stage(page).evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeLessThanOrEqual(Math.max(page.viewportSize()!.height, 544) + 1);
    expect(videos).toEqual([]);
  });
});
