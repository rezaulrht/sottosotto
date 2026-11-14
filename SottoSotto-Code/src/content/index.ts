/**
 * Typed, validated content. Importing this module parses every data file; an invalid
 * file throws a ContentError and fails `next build` (D35).
 * Import only from Server Components: content must not ship as a client bundle.
 */
import type { Metadata } from 'next';
import { rawFiles } from './raw';
import { flaggedValues } from './report';
import type { ManifestEntry, SeoPageKey } from './schemas';
import { validateContent } from './validate';

export const content = validateContent(rawFiles);
export const { site, allergens, menu, desserts, wine, venue, seo, privacy, manifest } = content;

/** Every flagged value in the raw data (mock, to confirm, needs verification…). */
export const flags = flaggedValues(rawFiles);

export function imageFor(key: string): ManifestEntry | undefined {
  return manifest[key];
}

/** Per-route title and description from seo.json (D43). */
export function pageMetadata(key: SeoPageKey, path: string): Metadata {
  const page = seo.pages[key];
  return {
    title: key === 'home' ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: { title: page.title, description: page.description, url: path },
  };
}
