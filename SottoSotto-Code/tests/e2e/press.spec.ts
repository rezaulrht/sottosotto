import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import press from '../../data/press.json' with { type: 'json' };

/* Home press table and reader (design 2026-11-18, D70). */

const section = (page: Page) => page.locator('[aria-labelledby="home-press"]');
const list = (page: Page) => page.locator('[data-press-list]');
const reader = (page: Page) => page.locator('dialog[aria-labelledby="press-reader-title"]');
const headline = (page: Page, text: string) =>
  list(page).locator('[data-press-headline]').filter({ hasText: text });
/** Opens the reader the way a keyboard user does (the list is screen-reader-only on phones). */
async function open(page: Page, text: string) {
  await expect(reader(page)).toHaveAttribute('data-ready', '');
  await headline(page, text).focus();
  await page.keyboard.press('Enter');
  await expect(reader(page)).toBeVisible();
}

test("shows 9 pages and 9 headlines in the client's words", async ({ page }) => {
  await page.goto('/');
  await expect(section(page).locator('[data-press-page]')).toHaveCount(9);
  const headlines = list(page).locator('[data-press-headline]');
  await expect(headlines).toHaveCount(9);
  for (const [i, item] of press.items.entries()) {
    await expect(headlines.nth(i)).toContainText(item.headline);
  }
});

test('the reader opens from a headline and closes with Escape, returning focus', async ({
  page,
}) => {
  await page.goto('/');
  await expect(reader(page)).toHaveAttribute('data-ready', '');
  const link = headline(page, 'A true Italian');
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(reader(page)).toBeVisible();
  await expect(reader(page)).toContainText('Western Daily Press');
  await expect(reader(page).locator('[data-ring]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(reader(page)).toBeHidden();
  await expect(link).toBeFocused();
});

test('the reader opens from a page on the table', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(reader(page)).toHaveAttribute('data-ready', '');
  const pageLink = section(page).locator('a[data-press-page][data-press-open="telegraph-2015"]');
  await pageLink.scrollIntoViewIfNeeded();
  await pageLink.click({ force: isMobile });
  await expect(reader(page)).toContainText('I come from a land down under');
});

test('arrow keys move through readable pages and skip FOUR Bath', async ({ page }) => {
  await page.goto('/');
  await open(page, 'I come from a land down under');
  await expect(reader(page)).toContainText('The Daily Telegraph');
  await page.keyboard.press('ArrowRight');
  await expect(reader(page)).toContainText('Award-winning restaurants');
  await expect(reader(page)).not.toContainText('Best Italian');
  await page.keyboard.press('ArrowLeft');
  await expect(reader(page)).toContainText('I come from a land down under');
});

test('FOUR Bath does not open', async ({ page }) => {
  await page.goto('/');
  const four = headline(page, 'Best Italian');
  await expect(four).toHaveCount(1);
  expect(await four.evaluate((el) => el.tagName)).toBe('P');
  await expect(
    section(page).locator('[data-press-page]:not(a)').filter({ hasText: 'Best Italian' }),
  ).toHaveCount(1);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('pages are at rest on load', async ({ page }) => {
    await page.goto('/');
    await section(page).scrollIntoViewIfNeeded();
    const states = await section(page)
      .locator('[data-press-page]')
      .evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
    expect(states.every((o) => o === '1')).toBe(true);
  });
});

test('phone: a swipe row that keeps Home short, with no page-wide sideways scroll', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Phone only');
  await page.goto('/');
  const tops = await section(page)
    .locator('[data-press-page]')
    .evaluateAll((els) => els.map((e) => (e as HTMLElement).offsetTop));
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(2);
  const height = await section(page).evaluate((el) => el.getBoundingClientRect().height);
  const screen = page.viewportSize()!.height;
  expect(height).toBeLessThan(screen * 1.6);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('pages land even when the section is reached by a jump', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.querySelector('#home-press')!.scrollIntoView());
  await expect
    .poll(() =>
      section(page)
        .locator('[data-press-page]')
        .evaluateAll((els) => els.every((e) => getComputedStyle(e).opacity === '1')),
    )
    .toBe(true);
});

test('the drop has no flash', () => {
  const effect = readFileSync('src/motion/effects/press-drop.ts', 'utf8');
  // Only motion, blur and opacity: no colour or brightness flashes.
  expect(effect).not.toMatch(/#fff|'white'|background|brightness/i);
});

test('axe: no violations on Home with the reader open', async ({ page }) => {
  await page.goto('/');
  await open(page, 'New restaurant eyes Italy');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
