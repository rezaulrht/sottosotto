import { describe, expect, it } from 'vitest';
import site from '../../data/site.json';
import {
  addDays,
  dayState,
  displayTime,
  firstOpenDate,
  londonNow,
  monthGrid,
  slotsFor,
  validateDetails,
  weekdayOf,
} from '@/booking/rules';
import type { BookingRules } from '@/booking/types';
import type { HoursData } from '@/lib/hours';

const hours = site.hours as unknown as HoursData;
const rules: BookingRules = {
  slotMinutes: 15,
  lastSeatingMinutesBeforeClose: 60,
  bookingWindowDays: 60,
  minNoticeMinutes: 120,
};
// Tuesday 17 November 2026, 10:00 in London.
const now = { today: '2026-11-17', minutes: 10 * 60 };

describe('booking rules (D59)', () => {
  it('reads weekdays and adds days across month and year ends', () => {
    expect(weekdayOf('2026-11-17')).toBe('tuesday');
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2027-03-28', 1)).toBe('2027-03-29');
  });

  it('builds lunch and dinner slots from the hours, 15 minutes apart, last seating an hour before close', () => {
    const slots = slotsFor('2026-11-18', hours, rules);
    const lunch = slots.filter((s) => s.session === 0).map((s) => s.time);
    const dinner = slots.filter((s) => s.session === 1).map((s) => s.time);
    expect(lunch).toEqual(['12:00', '12:15', '12:30', '12:45', '13:00']);
    expect(dinner[0]).toBe('17:00');
    expect(dinner.at(-1)).toBe('21:00');
    expect(dinner).toHaveLength(17);
  });

  it('drops today’s times inside the minimum notice', () => {
    const at1615 = { today: '2026-11-17', minutes: 16 * 60 + 15 };
    const times = slotsFor('2026-11-17', hours, rules, at1615).map((s) => s.time);
    expect(times[0]).toBe('18:15');
    expect(times).not.toContain('12:00');
  });

  it('greys out Sundays, Mondays, closures, past days and days beyond the window', () => {
    expect(dayState('2026-11-22', hours, rules, now)).toEqual({ kind: 'closed' }); // Sunday
    expect(dayState('2026-11-23', hours, rules, now)).toEqual({ kind: 'closed' }); // Monday
    expect(dayState('2026-12-25', hours, rules, now)).toEqual({
      kind: 'closure',
      label: 'Christmas Day',
    });
    expect(dayState('2026-11-16', hours, rules, now)).toEqual({ kind: 'past' });
    expect(dayState('2027-02-01', hours, rules, now)).toEqual({ kind: 'beyond' });
    expect(dayState('2026-11-18', hours, rules, now)).toEqual({ kind: 'open' });
  });

  it('marks today as having no times left late in the evening', () => {
    const late = { today: '2026-11-17', minutes: 20 * 60 };
    expect(dayState('2026-11-17', hours, rules, late)).toEqual({ kind: 'no-times' });
    expect(firstOpenDate(hours, rules, late)).toBe('2026-11-18');
  });

  it('skips the January closure when finding the first open date', () => {
    const newYear = { today: '2027-01-01', minutes: 9 * 60 };
    expect(firstOpenDate(hours, rules, newYear)).toBe('2027-01-15');
  });

  it('uses London dates whatever the visitor’s time zone (BST and GMT)', () => {
    // During BST, 23:30 UTC on Saturday 24 October 2026 is already 00:30 on Sunday in London.
    expect(londonNow(new Date('2026-10-24T23:30:00Z'))).toEqual({
      today: '2026-10-25',
      minutes: 30,
    });
    // Before the March change, 23:30 UTC is still 23:30 the same day in London.
    expect(londonNow(new Date('2027-03-27T23:30:00Z'))).toEqual({
      today: '2027-03-27',
      minutes: 23 * 60 + 30,
    });
  });

  it('lays out a Monday-first month', () => {
    const weeks = monthGrid(2026, 11); // 1 November 2026 is a Sunday
    expect(weeks[0]).toEqual([null, null, null, null, null, null, '2026-11-01']);
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });

  it('formats times for guests', () => {
    expect(displayTime('12:00')).toBe('12:00 pm');
    expect(displayTime('19:30')).toBe('7:30 pm');
  });

  it('checks the guest’s details', () => {
    expect(validateDetails({ name: '', phone: '123', email: 'x', notes: '' })).toEqual({
      name: expect.any(String),
      phone: expect.any(String),
      email: expect.any(String),
    });
    expect(
      validateDetails({
        name: 'Ada Lovelace',
        phone: '07700 900123',
        email: 'ada@example.com',
        notes: '',
      }),
    ).toEqual({});
    expect(
      validateDetails({
        name: 'Ada',
        phone: '+44 7700 900123',
        email: 'a@b.co',
        notes: 'x'.repeat(501),
      }),
    ).toEqual({
      notes: expect.any(String),
    });
  });
});
