/**
 * Typed, validated content. Importing this module parses every data file; an invalid
 * file throws a ContentError and fails `next build` (D35).
 * Import only from Server Components: content must not ship as a client bundle.
 */
import type { Metadata } from 'next';
import { rawFiles } from './raw';
import { pressImageKey, venueImageKey } from './image-jobs';
import { flaggedValues } from './report';
import type { ManifestEntry, SeoPageKey, VideoEntry } from './schemas';
import { validateContent } from './validate';

export const content = validateContent(rawFiles);
export const {
  site,
  allergens,
  menu,
  desserts,
  wine,
  venue,
  seo,
  privacy,
  press,
  manifest,
  videos,
} = content;

/** Every flagged value in the raw data (mock, to confirm, needs verification…). */
export const flags = flaggedValues(rawFiles);

export function imageFor(key: string): ManifestEntry | undefined {
  return manifest[key];
}

/** A press page's manifest entry. */
export function pressImage(id: string): ManifestEntry | undefined {
  return manifest[pressImageKey(id)];
}

/** A venue photo's manifest entry, or undefined while it is a placeholder (`src: null`). */
export function venuePhoto(image: { src: string | null }): ManifestEntry | undefined {
  return image.src ? manifest[venueImageKey(image.src)] : undefined;
}

/** A background video by its key in site.json `media` (e.g. "hero"). */
export function videoFor(key: string | null): VideoEntry | undefined {
  return key === null ? undefined : videos[key];
}

/** Shared Open Graph image, made by `npm run og` (1200 × 630). */
const OG_IMAGE = {
  url: '/og/default.jpg',
  width: 1200,
  height: 630,
  alt: 'Cicchetti della casa at Sotto Sotto',
};

/** Per-route title and description from seo.json (D43). */
export function pageMetadata(key: SeoPageKey, path: string): Metadata {
  const page = seo.pages[key];
  return {
    title: key === 'home' ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: path },
    // Pages replace the layout's openGraph object, so the shared fields are repeated here.
    openGraph: {
      title: page.title,
      description: page.description,
      url: path,
      siteName: site.name,
      locale: 'en_GB',
      type: 'website',
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', images: [OG_IMAGE.url] },
  };
}

/** Everything the guest booking flow needs, from site.json and allergens.json (D59). */
export function bookingFlowProps() {
  const { hours, booking, contact } = site;
  return {
    hours: { timezone: hours.timezone, weekly: hours.weekly, closures: hours.closures },
    rules: {
      slotMinutes: booking.rules.slotMinutes,
      lastSeatingMinutesBeforeClose: booking.rules.lastSeatingMinutesBeforeClose,
      bookingWindowDays: booking.rules.bookingWindowDays,
      minNoticeMinutes: booking.rules.minNoticeMinutes,
    },
    maxPartySize: booking.maxPartySize,
    contact: { phone: contact.phone, phoneE164: contact.phoneE164, email: contact.email },
    allergyNote: allergens.generalNote,
    preview: booking.availability.mock === true,
  };
}
