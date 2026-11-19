import { afterEach, describe, expect, it, vi } from 'vitest';
import { showMockBadge } from '@/components/global/MockBadge';
import { isDemo, siteEnv, siteUrl } from '@/lib/env';

/* Build environments, including the client demo on Vercel (D83). */

afterEach(() => vi.unstubAllEnvs());

describe('build environments', () => {
  it('accepts the demo environment and rejects unknown ones', () => {
    vi.stubEnv('SITE_ENV', 'demo');
    expect(siteEnv()).toBe('demo');
    expect(isDemo()).toBe(true);
    vi.stubEnv('SITE_ENV', 'preview');
    expect(() => siteEnv()).toThrow(/development, staging, demo or production/);
  });

  it('shows the mock badge in development and staging, never in the demo', () => {
    for (const [env, shown] of [
      ['development', true],
      ['staging', true],
      ['demo', false],
      ['production', false],
    ] as const) {
      vi.stubEnv('SITE_ENV', env);
      expect(showMockBadge(), env).toBe(shown);
    }
  });

  it('serves from SITE_URL when set (the demo), else the real domain', () => {
    vi.stubEnv('SITE_URL', '');
    expect(siteUrl('https://www.sottosotto.co.uk')).toBe('https://www.sottosotto.co.uk');
    vi.stubEnv('SITE_URL', 'https://sottosotto.vercel.app');
    expect(siteUrl('https://www.sottosotto.co.uk')).toBe('https://sottosotto.vercel.app');
  });
});
