import { expect, test, type Page } from '@playwright/test';
import site from '../../data/site.json' with { type: 'json' };

/*
 * Guest booking flow (D59). The clock is fixed to Tuesday 17 November 2026, 10:00 London,
 * so the calendar is the same on every run. The mock provider books nothing.
 */

const NOW = new Date('2026-11-17T10:00:00Z');

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(NOW);
});

const dialog = (page: Page) => page.getByRole('dialog', { name: 'Book a Table' });

async function openFromHeader(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page
      .getByRole('dialog', { name: 'Site menu' })
      .getByRole('link', { name: 'Book a Table' })
      .click();
  } else {
    await page.getByRole('banner').getByRole('link', { name: 'Book a Table' }).click();
  }
  await expect(dialog(page)).toBeVisible();
}

test('Book a Table opens the booking dialog with the preview notice', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await openFromHeader(page, isMobile);
  await expect(page).toHaveURL(/\/$/); // stayed on the page
  await expect(dialog(page).getByRole('note')).toContainText('nothing you enter here is sent');
  await expect(page.getByRole('dialog', { name: 'Site menu' })).toBeHidden();
  const box = (await dialog(page).boundingBox())!;
  const width = page.viewportSize()!.width;
  if (isMobile) expect(Math.round(box.width)).toBe(width);
  else expect(Math.abs(box.x - (width - box.x - box.width))).toBeLessThanOrEqual(2); // centred
});

test('closed days are greyed out and named', async ({ page }) => {
  await page.goto('/book/');
  const cal = page.locator('main');
  await expect(cal.getByRole('button', { name: 'Sunday 22 November, closed' })).toBeDisabled();
  await expect(cal.getByRole('button', { name: 'Monday 23 November, closed' })).toBeDisabled();
  await expect(cal.getByRole('button', { name: 'Monday 16 November, unavailable' })).toBeDisabled();
  await expect(cal.getByRole('button', { name: 'Wednesday 18 November' })).toBeEnabled();
  await expect(cal.getByText('We are closed on Mondays and Sundays.')).toBeVisible();
  await cal.getByRole('button', { name: 'Next month' }).click();
  await expect(
    cal.getByRole('button', { name: 'Friday 25 December, closed (Christmas Day)' }),
  ).toBeDisabled();
});

test('a booking goes from date to confirmation, with errors on missing details', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await openFromHeader(page, isMobile);
  const d = dialog(page);

  await d.getByRole('button', { name: 'Wednesday 18 November' }).click();
  await expect(d.getByRole('heading', { name: 'How many guests?' })).toBeFocused();
  await expect(d.getByText(`For more than ${site.booking.maxPartySize} guests`)).toBeVisible();
  await d.getByRole('button', { name: '2 guests' }).click();

  await expect(d.getByRole('heading', { name: 'Choose a time' })).toBeFocused();
  const firstFree = d.locator('button:not([disabled])', { hasText: /\d:\d\d [ap]m/ }).first();
  await expect(firstFree).toBeVisible();
  const chosen = (await firstFree.textContent())!.trim();
  await firstFree.click();

  await expect(d.getByRole('heading', { name: 'Your details' })).toBeFocused();
  await d.getByRole('button', { name: 'Confirm booking' }).click();
  await expect(d.getByText('Enter your name.')).toBeVisible();
  await expect(d.getByLabel('Name')).toBeFocused();
  await expect(d.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');

  await d.getByLabel('Name').fill('Ada Lovelace');
  await d.getByLabel('Phone').fill('07700 900123');
  await d.getByLabel('Email').fill('ada@example.com');
  await d.getByRole('button', { name: 'Confirm booking' }).click();

  await expect(d.getByRole('heading', { name: 'Preview complete' })).toBeVisible();
  await expect(d).toContainText(/Wednesday,? 18 November 2026/);
  await expect(d).toContainText(chosen);
  await expect(d).toContainText(/PREVIEW-\d{4}/);
  await expect(d).toContainText('No table has been booked');
});

test('Escape closes the dialog and returns focus to the button', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The mobile menu closes first, so focus returns to its button');
  await page.goto('/');
  const book = page.getByRole('banner').getByRole('link', { name: 'Book a Table' });
  await book.click();
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  await expect(book).toBeFocused();
});

test('the booking page shows the flow in place', async ({ page }) => {
  await page.goto('/book/');
  await expect(page.getByRole('heading', { level: 1, name: 'Book a Table' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Choose a date' })).toBeVisible();
  await expect(dialog(page)).toBeHidden();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  // Playwright does not render <noscript>, so this checks the flow's own fallback line.
  test('the booking page gives the phone number', async ({ page }) => {
    await page.goto('/book/');
    await expect(page.getByText(/If they do not appear, call us on/)).toBeVisible();
    await expect(page.getByRole('link', { name: site.contact.phone }).first()).toHaveAttribute(
      'href',
      `tel:${site.contact.phoneE164}`,
    );
  });
});
