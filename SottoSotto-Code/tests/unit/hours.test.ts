import { describe, expect, it } from 'vitest';
import site from '../../data/site.json';
import {
  closureFor,
  hoursStatus,
  localMoment,
  shortTime,
  statusText,
  weeklySummary,
  type HoursData,
} from '@/lib/hours';

const hours = site.hours as unknown as HoursData;
const at = (iso: string) => statusText(hoursStatus(new Date(iso), hours));

describe('hours chip (frozen clock, Europe/London)', () => {
  it('Tuesday lunchtime: open today', () => {
    expect(at('2026-11-17T12:30:00Z')).toBe('Open today · 12–2 & 5–10');
  });

  it('Monday: closed, reopens Tuesday', () => {
    expect(at('2026-11-16T10:00:00Z')).toBe('Closed today, we reopen Tuesday');
  });

  it('Saturday 23:00: closed now, reopens Tuesday (Sunday and Monday skipped)', () => {
    expect(at('2026-11-14T23:00:00Z')).toBe('Closed now, we reopen Tuesday');
  });

  it('between sessions on an opening day still counts as open today', () => {
    expect(at('2026-11-17T15:00:00Z')).toBe('Open today · 12–2 & 5–10');
  });

  it('inside the 1–14 January closure: reopens Friday 15 January', () => {
    const status = hoursStatus(new Date('2027-01-05T12:30:00Z'), hours);
    expect(status.kind).toBe('closed-today');
    expect(status.kind !== 'open-today' && status.closure?.label).toBe('January break');
    expect(statusText(status)).toBe('Closed today, we reopen Friday 15 January');
  });

  it('Christmas Day (a Friday in 2026): closed, reopens Saturday', () => {
    expect(at('2026-12-25T12:30:00Z')).toBe('Closed today, we reopen Saturday');
  });

  it('closure ranges can wrap over New Year', () => {
    const wrap = [{ label: 'Winter', from: '12-28', to: '01-03' }];
    expect(closureFor('12-30', wrap)?.label).toBe('Winter');
    expect(closureFor('01-02', wrap)?.label).toBe('Winter');
    expect(closureFor('01-04', wrap)).toBeUndefined();
  });

  describe('clocks go back, 25 Oct 2026 (BST → GMT)', () => {
    it('Sat 24 Oct 21:30 BST (20:30 UTC) is open', () => {
      expect(at('2026-10-24T20:30:00Z')).toBe('Open today · 12–2 & 5–10');
    });
    it('Sat 24 Oct 22:30 BST (21:30 UTC) is closed now, though 21:30 UTC alone would look open', () => {
      expect(at('2026-10-24T21:30:00Z')).toBe('Closed now, we reopen Tuesday');
    });
    it('23:30 UTC on Saturday is already Sunday 00:30 in London', () => {
      const m = localMoment(new Date('2026-10-24T23:30:00Z'));
      expect(m).toMatchObject({ weekday: 'sunday', day: 25, month: 10, minutes: 30 });
      expect(at('2026-10-24T23:30:00Z')).toBe('Closed today, we reopen Tuesday');
    });
    it('after the change, London is on GMT (UTC+0)', () => {
      expect(localMoment(new Date('2026-10-27T12:30:00Z')).minutes).toBe(12 * 60 + 30);
    });
  });

  describe('clocks go forward, 28 Mar 2027 (GMT → BST)', () => {
    it('Sat 27 Mar 21:30 UTC is 21:30 GMT: open', () => {
      expect(at('2027-03-27T21:30:00Z')).toBe('Open today · 12–2 & 5–10');
    });
    it('Tue 30 Mar 21:30 UTC is 22:30 BST: closed now', () => {
      expect(at('2027-03-30T21:30:00Z')).toBe('Closed now, we reopen Wednesday');
    });
    it('Tue 30 Mar 11:30 UTC is 12:30 BST: open', () => {
      expect(at('2027-03-30T11:30:00Z')).toBe('Open today · 12–2 & 5–10');
    });
  });
});

describe('formatting', () => {
  it('weekly summary groups days and wraps Sunday–Monday', () => {
    expect(weeklySummary(hours.weekly)).toEqual([
      { days: 'Tue–Sat', sessions: '12–2 & 5–10' },
      { days: 'Sun–Mon', sessions: null },
    ]);
  });

  it('short times are 12-hour without am/pm', () => {
    expect(shortTime('12:00')).toBe('12');
    expect(shortTime('14:00')).toBe('2');
    expect(shortTime('14:30')).toBe('2:30');
    expect(shortTime('00:00')).toBe('12');
  });
});
