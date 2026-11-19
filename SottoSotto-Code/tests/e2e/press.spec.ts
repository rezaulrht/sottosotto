import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import press from '../../data/press.json' with { type: 'json' };

/* Home press: the client's newspaper film with its amber square (D70). */

const film = (page: Page) => page.locator('[data-press-film]');
const reader = (page: Page) => page.locator('dialog[aria-labelledby="press-reader-title"]');
const current = (page: Page) => film(page).locator('[data-sheet][data-current]');
const callout = (page: Page) => film(page).locator('[data-press-callout]');

/** Scrolls the film to the top of the screen, again until it stays (Home's pins and Lenis settle late). */
async function toFilm(page: Page) {
  await page.goto('/');
  const offset = () => film(page).evaluate((el) => Math.abs(el.getBoundingClientRect().top));
  // Settled means still in place a second later (a late scroll restore can move it back).
  await expect
    .poll(async () => {
      if ((await offset()) >= 5) {
        await film(page).evaluate((el) =>
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY,
            behavior: 'instant',
          }),
        );
      }
      await page.waitForTimeout(1000);
      return offset();
    })
    .toBeLessThan(5);
}

/** The ring's place on its page, as fractions of the page. */
async function ringOnPage(page: Page) {
  return current(page).evaluate((sheet) => {
    const s = sheet.getBoundingClientRect();
    const r = sheet.querySelector('[data-ring]')!.getBoundingClientRect();
    return [
      (r.left - s.left) / s.width,
      (r.top - s.top) / s.height,
      r.width / s.width,
      r.height / s.height,
    ];
  });
}

test('the film holds all 9 pages; FOUR Bath never opens', async ({ page }) => {
  await page.goto('/');
  await expect(film(page).locator('[data-sheet]')).toHaveCount(9);
  for (const item of press.items) {
    const sheet = film(page).locator(`[data-sheet="${item.id}"]`);
    expect(await sheet.evaluate((el) => el.tagName)).toBe(item.readable ? 'A' : 'DIV');
  }
});

test('it plays the film: title card, a page lands, zooms, and the square rings Sotto Sotto', async ({
  page,
}) => {
  await toFilm(page);
  await expect(film(page)).toHaveAttribute('data-phase', 'intro');
  await expect(film(page)).toContainText('Sotto Sotto in the news');
  await expect(current(page)).toHaveAttribute('data-sheet', 'bath-chronicle-2012', {
    timeout: 6000,
  });
  await expect(current(page).locator('[data-ring]')).toBeVisible({ timeout: 8000 });
  await expect(callout(page)).toContainText('New restaurant eyes Italy');
  await expect(callout(page)).toContainText('The Bath Chronicle');
});

test('it waits off screen', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3500);
  await expect(film(page)).toHaveAttribute('data-phase', 'intro');
});

test('pause stops it where it is; play carries on', async ({ page }) => {
  await toFilm(page);
  await expect(current(page)).toHaveAttribute('data-sheet', 'bath-chronicle-2012', {
    timeout: 6000,
  });
  await page.getByRole('button', { name: 'Pause the press film' }).click();
  await expect(film(page)).toHaveAttribute('data-paused', '');
  await page.waitForTimeout(9000);
  await expect(current(page)).toHaveAttribute('data-sheet', 'bath-chronicle-2012');
  await page.getByRole('button', { name: 'Play the press film' }).click();
  await expect(film(page)).not.toHaveAttribute('data-paused', '');
});

test('next, previous and the arrow keys move through the pages', async ({ page }) => {
  await toFilm(page);
  const next = page.getByRole('button', { name: 'Next page' });
  await next.click();
  await expect(current(page)).toHaveAttribute('data-sheet', 'bath-chronicle-2012');
  await next.click();
  await expect(current(page)).toHaveAttribute('data-sheet', 'western-daily-press-2012');
  await next.press('ArrowRight');
  await expect(current(page)).toHaveAttribute('data-sheet', 'bath-life-review');
  await next.press('ArrowLeft');
  await expect(current(page)).toHaveAttribute('data-sheet', 'western-daily-press-2012');
  await expect(film(page).locator('[data-press-mark][aria-current="true"]')).toHaveAttribute(
    'data-press-mark',
    'western-daily-press-2012',
  );
});

test('"Read this page" opens the reader with the square; Escape returns focus', async ({
  page,
}) => {
  await toFilm(page);
  await expect(reader(page)).toHaveAttribute('data-ready', '');
  await page.getByRole('button', { name: 'Next page' }).click();
  const read = film(page).locator('[data-press-read]');
  await read.focus();
  await page.keyboard.press('Enter');
  await expect(reader(page)).toBeVisible();
  await expect(reader(page)).toContainText('The Bath Chronicle');
  await expect(reader(page).locator('[data-ring]')).toBeVisible();
  await expect(film(page)).toHaveAttribute('data-paused', '');
  await page.keyboard.press('Escape');
  await expect(reader(page)).toBeHidden();
  await expect(read).toBeFocused();
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('still pages, already zoomed, each with its square on the Sotto Sotto part', async ({
    page,
  }) => {
    await toFilm(page);
    await expect(film(page)).not.toHaveAttribute('data-moving', '');
    await expect(page.getByRole('button', { name: /press film/ })).toHaveCount(0);
    const next = page.getByRole('button', { name: 'Next page' });
    for (const [i, item] of press.items.entries()) {
      await expect(current(page)).toHaveAttribute('data-sheet', item.id);
      await expect(current(page).locator('[data-ring]')).toBeVisible();
      await expect(callout(page)).toContainText(item.headline);
      const ring = await ringOnPage(page);
      ring.forEach((v, k) => expect(Math.abs(v - item.box[k]!)).toBeLessThan(0.01));
      await expect(film(page).locator('[data-press-read]')).toHaveCount(item.readable ? 1 : 0);
      if (i < press.items.length - 1) await next.click();
    }
  });

  test('axe: no violations on the film', async ({ page }) => {
    await toFilm(page);
    const results = await new AxeBuilder({ page })
      .include('[data-press-film]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});

test('axe: no violations on Home with the reader open', async ({ page }) => {
  await toFilm(page);
  await expect(reader(page)).toHaveAttribute('data-ready', '');
  await page.getByRole('button', { name: 'Next page' }).click();
  await film(page).locator('[data-press-read]').focus();
  await page.keyboard.press('Enter');
  await expect(reader(page)).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});

test('phone: one screen tall, no sideways scroll', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Phone only');
  await page.goto('/');
  const height = await film(page).evaluate((el) => el.getBoundingClientRect().height);
  expect(height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('the marks jump to any paper', async ({ page }) => {
  await toFilm(page);
  await film(page).locator('[data-press-mark="telegraph-2015"]').click();
  await expect(current(page)).toHaveAttribute('data-sheet', 'telegraph-2015');
  await expect(film(page).locator('[data-press-mark="telegraph-2015"]')).toHaveAttribute(
    'aria-current',
    'true',
  );
});
