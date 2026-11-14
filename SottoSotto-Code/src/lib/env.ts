export type SiteEnv = 'development' | 'staging' | 'production';

/** Build environment (ARCHITECTURE §11.1). Set with SITE_ENV at build time. */
export function siteEnv(): SiteEnv {
  const value = process.env.SITE_ENV ?? 'development';
  if (value === 'development' || value === 'staging' || value === 'production') return value;
  throw new Error(`Unknown SITE_ENV "${value}". Use development, staging or production.`);
}

export const isProduction = (): boolean => siteEnv() === 'production';

/** Mock override for emergencies only (ARCHITECTURE §11.2). */
export const mockOverride = (): boolean => process.env.ALLOW_MOCK_IN_PRODUCTION === 'yes-i-know';
