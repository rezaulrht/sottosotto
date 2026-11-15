import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import allergenData from '../../data/allergens.json' with { type: 'json' };
import desserts from '../../data/desserts.json' with { type: 'json' };
import menu from '../../data/menu.json' with { type: 'json' };
import wine from '../../data/wine.json' with { type: 'json' };

/* M4 Menu page (BUILD_PLAN M4 "done when"). */

// Counted with reduce: the JSON's mixed item shapes do not type-check through flatMap.
const sum = (lists: Array<{ length: number }>) => lists.reduce((n, l) => n + l.length, 0);
const drinkLists = (
  wine.drinks as Array<{ items?: unknown[]; groups?: Array<{ items: unknown[] }> }>
).flatMap((s) => (s.items ? [s.items] : (s.groups ?? []).map((g) => g.items)));

const COUNTS = {
  dishes: sum(menu.sections.map((s) => s.items)),
  desserts: sum(desserts.sections.map((s) => s.items)),
  wines: sum(wine.groups.map((g) => g.wines)),
  bar: sum(drinkLists),
};

test('every item in the data renders (23 dishes, 8 desserts and cheese, 28 wines, 89 bar items)', async ({
  page,
}) => {
  expect(COUNTS).toEqual({ dishes: 23, desserts: 8, wines: 28, bar: 89 });
  await page.goto('/menu/');
  await expect(page.locator('#menu [data-candle-item]')).toHaveCount(COUNTS.dishes);
  await expect(page.locator('#dessert [data-candle-item]')).toHaveCount(COUNTS.desserts);
  await expect(page.locator(`#${wine.tab.id} [data-candle-item]`)).toHaveCount(
    COUNTS.wines + COUNTS.bar,
  );
});

test.describe('tabs', () => {
  test('scroll to the section, update the hash and mark the current tab', async ({ page }) => {
    await page.goto('/menu/');
    const tabs = page.getByRole('navigation', { name: 'Menu sections' });
    await tabs.getByRole('link', { name: 'Dessert' }).click();
    await expect(page).toHaveURL(/\/menu\/#dessert$/);
    await expect(page.locator('#dessert-heading')).toBeInViewport();
    await expect(tabs.getByRole('link', { name: 'Dessert' })).toHaveAttribute(
      'aria-current',
      'location',
    );
  });

  for (const hash of ['dessert', wine.tab.id]) {
    test(`/menu/#${hash} opens in the right place`, async ({ page }) => {
      await page.goto(`/menu/#${hash}`);
      await expect(page.locator(`#${hash}-heading`)).toBeInViewport();
    });
  }
});

test.describe('allergens', () => {
  const toggle = (id: string) => `[data-item="${id}"] details`;

  test('no data shows nothing, never "none"', async ({ page }) => {
    await page.goto('/menu/');
    await expect(page.locator(toggle('formaggi-con-marmellata-di-cipolle'))).toHaveCount(0);
  });

  test('an empty client list shows the agreed wording (Q35 proposal)', async ({ page }) => {
    await page.goto('/menu/');
    for (const id of ['patate-arrosto-al-rosmarino', 'white-garden']) {
      const details = page.locator(toggle(id));
      await details.locator('summary').click();
      await expect(details).toContainText('None of our listed allergens');
    }
  });

  test('Gelato / Sorbetto shows two labelled sets', async ({ page }) => {
    await page.goto('/menu/');
    const details = page.locator(toggle('gelato-sorbetto'));
    await details.locator('summary').click();
    await expect(details.getByText('Gelato', { exact: true })).toBeVisible();
    await expect(details.getByText('Sorbetto', { exact: true })).toBeVisible();
    await expect(details).toContainText('Lactose');
  });

  test('the three estimated cocktails show nothing (Q29)', async ({ page }) => {
    await page.goto('/menu/');
    for (const id of ['bellini', 'hugo-spritz', 'aperol-spritz']) {
      await expect(page.locator(`[data-item="${id}"]`)).toHaveCount(1);
      await expect(page.locator(toggle(id))).toHaveCount(0);
    }
  });

  test('the general note and the key appear once per section', async ({ page }) => {
    await page.goto('/menu/');
    for (const id of ['menu', 'dessert', wine.tab.id]) {
      const section = page.locator(`#${id}`);
      await expect(section.getByText(allergenData.generalNote, { exact: true })).toHaveCount(1);
      await expect(section.getByText(/Allergens: Contains, can be made without/)).toHaveCount(1);
    }
  });
});

test('wine price columns line up; "bottle only" where there is no glass price', async ({
  page,
}) => {
  await page.goto(`/menu/#${wine.tab.id}`);
  const rows = page.locator(`[aria-labelledby="wine-${wine.groups[0]!.id}"] li[data-item]`);
  const edges = await rows.evaluateAll((lis) =>
    lis.map((li) => {
      const [glass, bottle] = li.querySelectorAll<HTMLElement>(':scope > span:nth-child(2) > span');
      return [glass!.getBoundingClientRect().right, bottle!.getBoundingClientRect().right];
    }),
  );
  const glassEdges = new Set(edges.map(([g]) => Math.round(g!)));
  const bottleEdges = new Set(edges.map(([, b]) => Math.round(b!)));
  expect(glassEdges.size).toBe(1);
  expect(bottleEdges.size).toBe(1);
  const wines = (wine.groups as Array<{ wines: Array<{ glass: number | null }> }>).flatMap(
    (g) => g.wines,
  );
  const bottleOnly = wines.filter((w) => w.glass === null).length;
  await expect(page.getByText('bottle only', { exact: true })).toHaveCount(bottleOnly);
});

test('keyboard scrolling lights the row in the middle of the screen', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Desktop: the pointer candle hands over to the keyboard');
  await page.goto(`/menu/#${wine.tab.id}`);
  await expect(page.locator('[data-candle-mode="pointer"]')).toHaveCount(1);
  await page.locator(`#${wine.tab.id}-heading`).click(); // focus the page without scrolling away
  await page.keyboard.press('PageDown');
  await expect(page.locator('[data-candle-input="keyboard"]')).toHaveCount(1);
  await expect(page.locator(`#${wine.tab.id} [data-candle-item][data-lit]`).first()).toBeVisible();
  // Focus on an allergen toggle lights its dish too.
  const summary = page.locator('[data-item="bruschetta-ai-gamberoni"] summary');
  await summary.focus();
  await expect(page.locator('[data-item="bruschetta-ai-gamberoni"]')).toHaveAttribute(
    'data-focus',
    '',
  );
});

test('axe: no accessibility violations on the menu (lit and dim states)', async ({ page }) => {
  await page.goto('/menu/');
  await page.waitForLoadState('load');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
});
