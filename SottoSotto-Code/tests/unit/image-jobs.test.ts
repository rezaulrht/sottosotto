import { describe, expect, it } from 'vitest';
import desserts from '../../data/desserts.json';
import menu from '../../data/menu.json';
import venue from '../../data/venue.json';
import { imageJobs, venueImageKey, venueImageRefs } from '@/content/image-jobs';
import { rawFiles, type RawFiles } from '@/content/raw';
import { ContentError, validateContent } from '@/content/validate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mutable = Record<string, any>;

const dishes = [...menu.sections, ...desserts.sections].flatMap(
  (s) => s.items as Array<{ id: string; image: string | null }>,
);
/** A real asset (a dish photo) standing in for the client's first venue photo. */
const SAMPLE = 'Moody Charcuterie Board with Grilled Bites.png';

describe('image jobs (M5)', () => {
  it('names venue photos by file name', () => {
    expect(venueImageKey('Stairs at Night.JPG')).toBe('venue-stairs-at-night');
    expect(venueImageKey('  room_2 (wide).webp')).toBe('venue-room-2-wide');
  });

  it('lists every venue image in page order', () => {
    expect(venueImageRefs(venue)).toHaveLength(1 + 4 + 1 + 1 + 1 + 1 + 12 + 2);
  });

  it('builds every dish photo and only the venue photos that have a src', () => {
    const jobs = imageJobs(dishes, venue);
    expect(jobs.filter((j) => j.folder === 'dishes')).toHaveLength(27);
    // The street photo (D63), the client's photos (D76) and the two Home uses them (D76).
    const withSrc = [
      venue.opening.image,
      ...venue.descent.images,
      venue.setting.image,
      venue.stairs.image,
      venue.story.image,
      venue.wall.texture,
      ...venue.wall.images,
      venue.home.wine,
      venue.home.booking,
    ]
      .map((i) => i.src)
      .filter((s): s is string => s !== null);
    expect(withSrc).toHaveLength(23);
    expect(
      jobs
        .filter((j) => j.folder === 'venue')
        .map((j) => j.source)
        .sort(),
    ).toEqual([...new Set(withSrc)].sort());
  });

  it('adds a venue job, once, as soon as a src is set', () => {
    const withPhoto = structuredClone(venue) as Mutable;
    withPhoto.opening.image.src = SAMPLE;
    withPhoto.wall.images[0].src = SAMPLE; // the same photo twice is processed once
    const sampleJobs = imageJobs(dishes, withPhoto as typeof venue).filter(
      (j) => j.folder === 'venue' && j.source === SAMPLE,
    );
    expect(sampleJobs).toEqual([{ key: venueImageKey(SAMPLE), source: SAMPLE, folder: 'venue' }]);
  });
});

describe('swapping a placeholder for a real photo is data + npm run images', () => {
  function withSample(processed: boolean): RawFiles {
    const raw = structuredClone(rawFiles) as unknown as Mutable;
    raw['venue.json'].opening.image = {
      mock: false,
      src: SAMPLE,
      alt: 'The entrance on North Parade',
      caption: null,
    };
    if (processed) {
      // What `npm run images` writes for it: an entry under the venue key.
      const dish = raw['image-manifest.json']['cicchetti-della-casa'];
      raw['image-manifest.json'][venueImageKey(SAMPLE)] = { ...dish, source: SAMPLE };
    }
    return raw as RawFiles;
  }

  it('fails with a readable message until the photo has been processed', () => {
    try {
      validateContent(withSample(false));
      throw new Error('expected a ContentError');
    } catch (error) {
      expect(error).toBeInstanceOf(ContentError);
      const messages = (error as ContentError).issues.map((i) => `${i.file} → ${i.message}`);
      expect(messages).toEqual([expect.stringContaining('venue.json → No processed photo')]);
      expect(messages[0]).toContain('npm run images');
    }
  });

  it('validates once the image manifest has it', () => {
    const content = validateContent(withSample(true));
    expect(content.manifest[venueImageKey(SAMPLE)]?.source).toBe(SAMPLE);
    expect(content.venue.opening.image.src).toBe(SAMPLE);
  });
});
