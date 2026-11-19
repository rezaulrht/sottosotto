import { siteUrl } from '@/lib/env';
import type { MetadataRoute } from 'next';
import { site } from '@/content';
import { ROUTES } from '@/lib/nav';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({ url: new URL(route, siteUrl(site.website)).toString() }));
}
