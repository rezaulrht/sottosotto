export type SiteEnv = 'development' | 'staging' | 'demo' | 'production';

/**
 * Build environment (ARCHITECTURE §11.1). Set with SITE_ENV at build time.
 * `demo` (D83) is the client-facing preview: like staging (not indexed, unconfirmed values
 * allowed) but clean: no mock badge, no review pages, no placeholder-only sections.
 */
export function siteEnv(): SiteEnv {
  const value = process.env.SITE_ENV ?? 'development';
  if (
    value === 'development' ||
    value === 'staging' ||
    value === 'demo' ||
    value === 'production'
  ) {
    return value;
  }
  throw new Error(`Unknown SITE_ENV "${value}". Use development, staging, demo or production.`);
}

/** The client-facing demo build (D83). */
export const isDemo = (): boolean => siteEnv() === 'demo';

/**
 * The address the site is served from: SITE_URL when set (the demo on Vercel), else the real
 * domain. Canonical links, share previews, the sitemap and JSON-LD all use it.
 */
export function siteUrl(website: string): string {
  return process.env.SITE_URL || website;
}

export const isProduction = (): boolean => siteEnv() === 'production';

/** Mock override for emergencies only (ARCHITECTURE §11.2). */
export const mockOverride = (): boolean => process.env.ALLOW_MOCK_IN_PRODUCTION === 'yes-i-know';
