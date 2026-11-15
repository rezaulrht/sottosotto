/**
 * Mock booking provider (D59). No backend exists yet: availability is generated from the
 * opening hours and booking rules, with a stable, made-up share of times shown as full, and
 * `submit` books nothing. Flagged in site.json (`booking.availability.mock`), so a
 * production build stays blocked until a real provider replaces this one.
 */
import type { HoursData } from '@/lib/hours';
import { londonNow, slotsFor } from './rules';
import type { BookingProvider, BookingRules } from './types';

const DELAY_MS = 350;
const wait = () => new Promise((r) => setTimeout(r, DELAY_MS));

/** Stable 0–1 value per string, so the same date and time always look the same. */
function score(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

export function mockProvider(hours: HoursData, rules: BookingRules): BookingProvider {
  return {
    async availability(date, partySize) {
      await wait();
      const now = londonNow(new Date());
      // Bigger tables are harder to find: more times shown as full.
      const busy = 0.18 + partySize * 0.05;
      return slotsFor(date, hours, rules, now).map((slot) => ({
        ...slot,
        available: score(`${date} ${slot.time}`) >= busy,
      }));
    },
    async submit(request) {
      await wait();
      const ref = Math.floor(score(`${request.date}${request.time}${request.email}`) * 9000) + 1000;
      return { reference: `PREVIEW-${ref}`, preview: true };
    },
  };
}
