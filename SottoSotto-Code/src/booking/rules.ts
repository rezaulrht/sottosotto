/**
 * Booking rules (D59). Pure functions over site.json `hours` and `booking.rules`, all in
 * Europe/London calendar dates (YYYY-MM-DD), so they are unit-tested without a clock.
 */
import {
  closureFor,
  localMoment,
  toMinutes,
  WEEKDAYS,
  type HoursData,
  type Weekday,
} from '@/lib/hours';
import type { BookingRules, IsoDate, Slot } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

export interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number;
}

export const toIso = (d: CalendarDate): IsoDate => `${d.year}-${pad(d.month)}-${pad(d.day)}`;

export function fromIso(iso: IsoDate): CalendarDate {
  const [year, month, day] = iso.split('-').map(Number) as [number, number, number];
  return { year, month, day };
}

/** Noon UTC falls on the same calendar date in London all year round. */
const utcNoon = (d: CalendarDate) => new Date(Date.UTC(d.year, d.month - 1, d.day, 12));

export function addDays(iso: IsoDate, days: number): IsoDate {
  const d = utcNoon(fromIso(iso));
  d.setUTCDate(d.getUTCDate() + days);
  return toIso({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() });
}

export function weekdayOf(iso: IsoDate): Weekday {
  return WEEKDAYS[(utcNoon(fromIso(iso)).getUTCDay() + 6) % 7]!;
}

/** Today's London date and the minutes since London midnight. */
export function londonNow(now: Date): { today: IsoDate; minutes: number } {
  const m = localMoment(now);
  return { today: toIso(m), minutes: m.minutes };
}

/** Every bookable time on a date, before availability: session by session, `slotMinutes` apart. */
export function slotsFor(
  iso: IsoDate,
  hours: HoursData,
  rules: BookingRules,
  now?: { today: IsoDate; minutes: number },
): Slot[] {
  const md = iso.slice(5);
  if (closureFor(md, hours.closures)) return [];
  const earliest =
    now && iso === now.today ? now.minutes + rules.minNoticeMinutes : Number.NEGATIVE_INFINITY;
  const slots: Slot[] = [];
  hours.weekly[weekdayOf(iso)].forEach((session, index) => {
    const last = toMinutes(session.close) - rules.lastSeatingMinutesBeforeClose;
    for (let t = toMinutes(session.open); t <= last; t += rules.slotMinutes) {
      if (t >= earliest)
        slots.push({ time: `${pad(Math.floor(t / 60))}:${pad(t % 60)}`, session: index });
    }
  });
  return slots;
}

export type DayState =
  | { kind: 'open' }
  | { kind: 'past' }
  | { kind: 'beyond' }
  | { kind: 'closed' }
  | { kind: 'closure'; label: string }
  | { kind: 'no-times' };

/** Whether a date can be booked, and why not. */
export function dayState(
  iso: IsoDate,
  hours: HoursData,
  rules: BookingRules,
  now: { today: IsoDate; minutes: number },
): DayState {
  if (iso < now.today) return { kind: 'past' };
  if (iso > addDays(now.today, rules.bookingWindowDays)) return { kind: 'beyond' };
  const closure = closureFor(iso.slice(5), hours.closures);
  if (closure) return { kind: 'closure', label: closure.label };
  if (!hours.weekly[weekdayOf(iso)].length) return { kind: 'closed' };
  if (!slotsFor(iso, hours, rules, now).length) return { kind: 'no-times' };
  return { kind: 'open' };
}

/** The first bookable date from today, within the booking window (null if none). */
export function firstOpenDate(
  hours: HoursData,
  rules: BookingRules,
  now: { today: IsoDate; minutes: number },
): IsoDate | null {
  for (let i = 0; i <= rules.bookingWindowDays; i++) {
    const iso = addDays(now.today, i);
    if (dayState(iso, hours, rules, now).kind === 'open') return iso;
  }
  return null;
}

/** Weeks of a month for a Monday-first calendar; null pads the first and last week. */
export function monthGrid(year: number, month: number): Array<Array<IsoDate | null>> {
  const first = toIso({ year, month, day: 1 });
  const lead = WEEKDAYS.indexOf(weekdayOf(first));
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<IsoDate | null> = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: days }, (_, i) => toIso({ year, month, day: i + 1 })),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks: Array<Array<IsoDate | null>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** "Tuesday 18 November" (en-GB), from a London calendar date. */
export function longDate(iso: IsoDate, withYear = false): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(utcNoon(fromIso(iso)));
}

/** "7:30 pm" from "19:30". */
export function displayTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'am' : 'pm'}`;
}

/** Light checks on the guest's details. Returns field → message for each problem. */
export function validateDetails(d: {
  name: string;
  phone: string;
  email: string;
  notes: string;
}): Partial<Record<'name' | 'phone' | 'email' | 'notes', string>> {
  const errors: Partial<Record<'name' | 'phone' | 'email' | 'notes', string>> = {};
  if (d.name.trim().length < 2) errors.name = 'Enter your name.';
  const digits = d.phone.replace(/[\s()-]/g, '');
  if (!/^(\+?\d{10,15})$/.test(digits))
    errors.phone = 'Enter a phone number we can call, e.g. 07700 900123.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim()))
    errors.email = 'Enter an email address, e.g. name@example.com.';
  if (d.notes.length > 500) errors.notes = 'Keep notes under 500 characters.';
  return errors;
}
