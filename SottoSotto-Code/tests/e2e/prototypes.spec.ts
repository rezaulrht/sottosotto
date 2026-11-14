import { expect, test, type Page } from '@playwright/test';
import site from '../../data/site.json' with { type: 'json' };

/*
 * M2 prototypes against the staging export: hero video rules (ARCHITECTURE §6.2),
 * candle states (§7.5), allergen toggle and the Hospres sheet (§8.1).
 */

const hero = (page: Page) => page.locator('[data-video-state]');
const BONE_100 = 'rgb(237, 232, 223)';

test.describe('home hero', () => {
  test('poster is in the HTML as a high-priority image; the loop plays after load', async ({
    page,
  }) => {
    await page.goto('/');
    const poster = page.locator('[data-hero] picture img');
    await expect(poster).toHaveAttribute('fetchpriority', 'high');
    await expect(poster).toHaveAttribute('loading', 'eager');
    await expect(hero(page)).toHaveAttribute('data-video-state', 'playing', { timeout: 15_000 });
    const playing = await page
      .locator('[data-hero] video')
      .evaluate((v: HTMLVideoElement) => !v.paused && v.muted && v.currentSrc.endsWith('.webm'));
    expect(playing).toBe(true);
  });

  test('pause stops the video and the badge, and is remembered for the session', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(hero(page)).toHaveAttribute('data-video-state', 'playing', { timeout: 15_000 });
    const toggle = page.getByRole('button', { name: 'Pause background motion' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-hero]')).toHaveAttribute('data-motion-paused', '');
    await expect(hero(page)).toHaveAttribute('data-video-state', 'paused');

    await page.reload();
    await expect(page.getByRole('button', { name: 'Pause background motion' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('[data-hero] video source')).toHaveCount(0);
  });

  test('Save-Data keeps the poster but offers the pause button for the badge', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', {
        value: {
          saveData: true,
          effectiveType: '4g',
          addEventListener() {},
          removeEventListener() {},
        },
      });
    });
    await page.goto('/');
    await page.waitForLoadState('load');
    await expect(hero(page)).toHaveAttribute('data-poster-reason', 'save-data');
    await expect(page.locator('[data-hero] video source')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Pause background motion' })).toBeVisible();
  });

  test('the badge is a real booking link', async ({ page }) => {
    await page.goto('/');
    const badge = page.locator('[data-hero]').getByRole('link', { name: /^Book a Table \(opens/ });
    await expect(badge.last()).toHaveAttribute('href', site.booking.widgetUrl);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('hero shows the poster only, with no pause button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await expect(hero(page)).toHaveAttribute('data-poster-reason', 'reduced-motion');
    await expect(page.locator('[data-hero] video source')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Pause background motion' })).toHaveCount(0);
  });

  test('candle: every dish lit, no flame', async ({ page }) => {
    await page.goto('/lab/candle/');
    await expect(page.locator('[data-candle-ready]')).toHaveCount(0);
    const names = page.locator('[data-candle-item] h4');
    await expect(names.first()).toHaveCSS('color', BONE_100);
    await expect(names.last()).toHaveCSS('color', BONE_100);
  });
});

test.describe('menu candle', () => {
  test('desktop: the dish under the pointer lights up', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Fine pointer only');
    await page.goto('/lab/candle/');
    await expect(page.locator('[data-candle-mode="pointer"]')).toHaveCount(1);
    const first = page.locator('[data-candle-item]').first();
    const second = page.locator('[data-candle-item]').nth(1);
    await expect(first.locator('h4')).not.toHaveCSS('color', BONE_100);

    await first.locator('picture').hover();
    await expect(first).toHaveAttribute('data-lit', '');
    await expect(first.locator('h4')).toHaveCSS('color', BONE_100);

    await second.locator('picture').hover();
    await expect(second).toHaveAttribute('data-lit', '');
    await expect(first).not.toHaveAttribute('data-lit');
  });

  test('phone: the dish in the middle of the screen lights up', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Touch only');
    await page.goto('/lab/candle/');
    await expect(page.locator('[data-candle-mode="centre"]')).toHaveCount(1);
    const third = page.locator('[data-candle-item]').nth(2);
    await third.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(third).toHaveAttribute('data-lit', '');
  });

  test('keyboard focus and an open allergen toggle light the dish', async ({ page }) => {
    await page.goto('/lab/candle/');
    const card = page.locator('[data-candle-item]').nth(3);
    const summary = card.locator('summary');
    await summary.focus();
    await expect(card.locator('h4')).toHaveCSS('color', BONE_100);

    await page.keyboard.press('Enter');
    await expect(card.locator('details')).toHaveAttribute('open', '');
    await expect(card.getByText('Contains', { exact: true })).toBeVisible();
    await page.locator('h1').click();
    await expect(card.locator('h4')).toHaveCSS('color', BONE_100);
  });

  test('allergen labels follow the client data', async ({ page }) => {
    await page.goto('/lab/candle/');
    const card = page.locator('#bruschetta-ai-gamberoni');
    await card.locator('summary').click();
    const panel = card.locator('details');
    await expect(panel).toContainText('Gluten');
    await expect(panel).not.toContainText('allergen-free');
  });
});

test('Hospres spike opens the widget in a sheet', async ({ page }) => {
  await page.goto('/lab/hospres/');
  await page
    .locator('main')
    .getByRole('link', { name: /^Book a Table/ })
    .click();
  const sheet = page.getByRole('dialog', { name: 'Book a Table' });
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('iframe')).toHaveAttribute('src', site.booking.widgetUrl);
  await expect(page.getByTestId('spike-status')).not.toHaveText('idle');
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
});

test.describe('menu page candle', () => {
  test('dishes, desserts and wine rows light under the pointer', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Fine pointer only');
    await page.goto('/menu/');
    await expect(page.locator('[data-candle-mode="pointer"]')).toHaveCount(1);
    const tiramisu = page.locator('#tiramisu');
    await tiramisu.scrollIntoViewIfNeeded();
    await tiramisu.locator('h4').hover();
    await expect(tiramisu).toHaveAttribute('data-lit', '');

    const wineRow = page.locator(`#${'wine'} li[data-candle-item]`).first();
    await wineRow.scrollIntoViewIfNeeded();
    await wineRow.hover();
    await expect(wineRow).toHaveAttribute('data-lit', '');
    await expect(wineRow).toHaveCSS('color', BONE_100);
    await expect(tiramisu).not.toHaveAttribute('data-lit');
  });

  test('every dish and side has its allergen toggle; no drink shows one yet', async ({ page }) => {
    await page.goto('/menu/');
    await expect(page.locator('#menu details, #dessert details')).not.toHaveCount(0);
    await expect(page.locator('#wine details')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText('allergen-free');
  });

  test('phone: the item in the middle of the screen lights up', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Touch only');
    await page.goto('/menu/');
    const item = page.locator('#dessert [data-candle-item]').nth(1);
    await item.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(item).toHaveAttribute('data-lit', '');
  });
});
