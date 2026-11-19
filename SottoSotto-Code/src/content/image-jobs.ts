/**
 * Which photos the image pipeline builds (D36, M5). Pure, so it is unit-tested and shared
 * by scripts/images.ts, the content checks and the components that look photos up.
 *
 * - Dish photos: every `image` in menu.json / desserts.json, keyed by dish id.
 * - Venue photos: every `src` in venue.json, keyed `venue-<file name>`.
 * Swapping a venue placeholder for a real photo is therefore only: put the file in the
 * assets folder, set `src` (and `mock: false`, a real `alt`) in venue.json, run
 * `npm run images`.
 */

export interface ImageJob {
  key: string;
  /** File name in the assets folder. */
  source: string;
  /** Output folder under public/img/. */
  folder: 'dishes' | 'venue' | 'press';
}

export interface VenueImageRef {
  src: string | null;
}

export interface VenueImages {
  opening: { image: VenueImageRef };
  descent: { images: VenueImageRef[] };
  setting: { image: VenueImageRef };
  stairs?: { image: VenueImageRef };
  story: { image: VenueImageRef };
  wall: { texture: VenueImageRef; images: VenueImageRef[] };
  /** Venue photos used on Home (D76). */
  home?: { wine: VenueImageRef; booking: VenueImageRef };
}

/** "Stairs at night.JPG" → "venue-stairs-at-night". */
export function venueImageKey(src: string): string {
  const slug = src
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `venue-${slug}`;
}

/** Every venue image object: the Venue page in page order, then the ones Home uses. */
export function venueImageRefs(venue: VenueImages): VenueImageRef[] {
  return [
    venue.opening.image,
    ...venue.descent.images,
    venue.setting.image,
    ...(venue.stairs ? [venue.stairs.image] : []),
    venue.story.image,
    venue.wall.texture,
    ...venue.wall.images,
    ...(venue.home ? [venue.home.wine, venue.home.booking] : []),
  ];
}

/** Manifest key of a press page: "press-<id>". */
export function pressImageKey(id: string): string {
  return `press-${id}`;
}

export function imageJobs(
  dishes: Array<{ id: string; image: string | null }>,
  venue: VenueImages,
  press: Array<{ id: string; file: string }> = [],
  /** Other photos built like venue photos (parking places, D80). */
  places: VenueImageRef[] = [],
): ImageJob[] {
  const jobs: ImageJob[] = dishes
    .filter((d): d is { id: string; image: string } => d.image !== null)
    .map((d) => ({ key: d.id, source: d.image, folder: 'dishes' }));
  const seen = new Set<string>();
  for (const ref of [...venueImageRefs(venue), ...places]) {
    if (!ref.src) continue;
    const key = venueImageKey(ref.src);
    if (seen.has(key)) continue;
    seen.add(key);
    jobs.push({ key, source: ref.src, folder: 'venue' });
  }
  for (const item of press) {
    jobs.push({ key: pressImageKey(item.id), source: item.file, folder: 'press' });
  }
  return jobs;
}
