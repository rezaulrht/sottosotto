import { describe, expect, it } from 'vitest';
import { press } from '@/content';
import { imageJobs } from '@/content/image-jobs';
import { flagsInFile } from '@/content/report';
import raw from '../../data/press.json';
import venue from '../../data/venue.json';

/* Press pages from the client (design 2026-11-18, D70). */

const ids = press.items.map((p) => p.id);
const byId = (id: string) => press.items.find((p) => p.id === id)!;

describe('press.json', () => {
  it("has the 9 pages in the spec's order", () => {
    expect(ids).toEqual([
      'bath-chronicle-2012',
      'western-daily-press-2012',
      'bath-life-review',
      'telegraph-2015',
      'four-bath-2012',
      'inbath-awards',
      'bath-life-food-of-love',
      'beautiful-bath',
      'bath-dining-guide',
    ]);
  });

  it('flags every page toConfirm; awards are FOUR Bath and InBath only', () => {
    expect(press.items.every((p) => p.toConfirm)).toBe(true);
    expect(press.items.filter((p) => p.award).map((p) => p.id)).toEqual([
      'four-bath-2012',
      'inbath-awards',
    ]);
  });

  it('FOUR Bath is not readable; the rest are', () => {
    expect(press.items.filter((p) => !p.readable).map((p) => p.id)).toEqual(['four-bath-2012']);
  });

  it('spots are inside the page (0..1)', () => {
    for (const p of press.items) {
      for (const v of p.spot) {
        expect(v).toBeGreaterThan(0);
        expect(v).toBeLessThan(1);
      }
    }
  });

  it('dates are printed text or null', () => {
    expect(byId('bath-chronicle-2012').date).toBe('Thursday 26 January 2012');
    expect(byId('western-daily-press-2012').date).toBe('Saturday 10 March 2012');
    expect(byId('telegraph-2015').date).toBe('Saturday 28 March 2015');
    expect(byId('four-bath-2012').date).toBe('November/December 2012');
    expect(byId('bath-life-food-of-love').date).toBe('25 January – 8 February 2013');
    expect(byId('inbath-awards').date).toBe('May/June');
    for (const id of ['bath-life-review', 'beautiful-bath', 'bath-dining-guide']) {
      expect(byId(id).date).toBeNull();
    }
  });

  it('the content report flags all 9', () => {
    const flags = flagsInFile('press.json', raw);
    expect(flags).toHaveLength(9);
    expect(flags.every((f) => f.reasons.includes('toConfirm'))).toBe(true);
  });

  it('image jobs include one press job per page', () => {
    const jobs = imageJobs([], venue, press.items).filter((j) => j.folder === 'press');
    expect(jobs.map((j) => j.key)).toEqual(ids.map((id) => `press-${id}`));
  });
});
