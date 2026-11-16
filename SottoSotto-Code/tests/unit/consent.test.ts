import { describe, expect, it } from 'vitest';
import {
  CONSENT_KEY,
  CONSENT_VERSION,
  cookieDomains,
  deleteGaCookies,
  gaCookieNames,
  readConsent,
  writeConsent,
} from '@/consent/consent';
import site from '../../data/site.json';

function memoryStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    data,
  };
}

describe('consent store (D40, ARCHITECTURE §9.2)', () => {
  it('has no choice until one is written', () => {
    expect(readConsent(memoryStore())).toBeNull();
    expect(readConsent(null)).toBeNull();
  });

  it('writes and reads back the choice with version and ISO date', () => {
    const store = memoryStore();
    writeConsent(store, true, new Date('2026-11-16T10:00:00Z'));
    expect(JSON.parse(store.data.get(CONSENT_KEY)!)).toEqual({
      analytics: true,
      version: CONSENT_VERSION,
      date: '2026-11-16',
    });
    expect(readConsent(store)?.analytics).toBe(true);
  });

  it('asks again when the stored version is old, or the value is broken', () => {
    const old = JSON.stringify({
      analytics: true,
      version: CONSENT_VERSION - 1,
      date: '2025-01-01',
    });
    expect(readConsent(memoryStore({ [CONSENT_KEY]: old }))).toBeNull();
    expect(readConsent(memoryStore({ [CONSENT_KEY]: '{not json' }))).toBeNull();
  });

  it('survives storage that throws (private mode)', () => {
    const throwing = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readConsent(throwing)).toBeNull();
    expect(writeConsent(throwing, false).analytics).toBe(false);
  });
});

describe('GA cookie removal on withdrawal', () => {
  it('finds only GA cookies', () => {
    expect(gaCookieNames('_ga=GA1.1.1; theme=dark; _ga_2TMCMCTHRD=GS1; _gid=x')).toEqual([
      '_ga',
      '_ga_2TMCMCTHRD',
      '_gid',
    ]);
  });

  it('tries the host and every parent domain except the TLD', () => {
    expect(cookieDomains('www.sottosotto.co.uk')).toEqual([
      'www.sottosotto.co.uk',
      'sottosotto.co.uk',
      'co.uk',
    ]);
    expect(cookieDomains('localhost')).toEqual([]);
  });

  it('writes an expired cookie for each GA name and domain', () => {
    const writes: string[] = [];
    const doc = {
      get cookie() {
        return '_ga=1; keep=1';
      },
      set cookie(v: string) {
        writes.push(v);
      },
    };
    deleteGaCookies(doc, 'sottosotto.co.uk');
    expect(writes.every((w) => w.startsWith('_ga=;') && w.includes('1970'))).toBe(true);
    expect(writes).toHaveLength(3);
  });
});

describe('analytics config', () => {
  it('uses the GA4 property from site.json and requires consent (D16)', () => {
    expect(site.analytics.ga4MeasurementId).toBe('G-2TMCMCTHRD');
    expect(site.analytics.requiresConsent).toBe(true);
  });

  it('banner copy is flagged until the client approves it', () => {
    expect(site.copy.cookieBanner.toConfirm).toBe(true);
  });
});
