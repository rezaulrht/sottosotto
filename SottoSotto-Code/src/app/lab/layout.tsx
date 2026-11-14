import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { siteEnv } from '@/lib/env';

/**
 * M2 review pages (BUILD_PLAN M2). Development and staging only: production renders the
 * 404 page here, and the routes are never indexed or listed in the sitemap.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: ReactNode }) {
  if (siteEnv() === 'production') notFound();
  return children;
}
