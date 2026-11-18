/**
 * Raw data files, exactly as on disk (notes and flags included).
 * Import from here only in validate/report code and build scripts; pages use ./index.
 */
import allergens from '../../data/allergens.json';
import desserts from '../../data/desserts.json';
import menu from '../../data/menu.json';
import press from '../../data/press.json';
import privacy from '../../data/privacy.json';
import seo from '../../data/seo.json';
import site from '../../data/site.json';
import venue from '../../data/venue.json';
import wine from '../../data/wine.json';
import manifest from './image-manifest.json';
import videoManifest from './video-manifest.json';

/** Keyed by file name under data/ (the manifest by its path under src/content/). */
export const rawFiles = {
  'site.json': site,
  'allergens.json': allergens,
  'menu.json': menu,
  'desserts.json': desserts,
  'wine.json': wine,
  'venue.json': venue,
  'seo.json': seo,
  'privacy.json': privacy,
  'press.json': press,
  'image-manifest.json': manifest,
  'video-manifest.json': videoManifest,
} as const satisfies Record<string, unknown>;

export type RawFiles = { [K in keyof typeof rawFiles]: unknown };
