import type { MetadataRoute } from 'next';
import { showMockBadge } from '@/components/global/MockBadge';
import { site } from '@/content';
import { siteEnv, siteUrl } from '@/lib/env';

export const dynamic = 'force-static';

/** Staging, development and override builds disallow everything (ARCHITECTURE §10.1). */
export default function robots(): MetadataRoute.Robots {
  const indexable = siteEnv() === 'production' && !showMockBadge();
  return indexable
    ? {
        rules: { userAgent: '*', allow: '/' },
        sitemap: new URL('/sitemap.xml', siteUrl(site.website)).toString(),
      }
    : { rules: { userAgent: '*', disallow: '/' } };
}
