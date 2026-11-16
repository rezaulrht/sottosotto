import { flagsInFile } from '@/content/report';

/**
 * JSON-LD `Restaurant` (D43, ARCHITECTURE §10.1). A field is included only when its source
 * object carries no flag (mock, toConfirm, unconfirmed, …) anywhere inside it, in every
 * environment. Today that leaves out the address, geo, telephone, closures and social links.
 */

/** True when the value and everything inside it is free of flags. */
export function isClean(value: unknown): boolean {
  return flagsInFile('jsonld', value).length === 0;
}

type Session = { open: string; close: string };
const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
type Weekly = Record<(typeof DAYS)[number], Session[]>;

/** One OpeningHoursSpecification per distinct session, listing the days it applies to. */
export function openingHours(weekly: Weekly) {
  const bySession = new Map<string, string[]>();
  for (const day of DAYS) {
    for (const s of weekly[day]) {
      const key = `${s.open}-${s.close}`;
      bySession.set(key, [...(bySession.get(key) ?? []), day]);
    }
  }
  return [...bySession].map(([key, days]) => {
    const [opens, closes] = key.split('-');
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: days.map((d) => `https://schema.org/${d[0]!.toUpperCase()}${d.slice(1)}`),
      opens,
      closes,
    };
  });
}

interface SiteForJsonLd {
  name: string;
  website: string;
  hours: { weekly: Weekly };
  contact: { phoneE164: string };
  address: { line1: string; city: string; postcode: string };
  geo: { lat: number; lng: number };
  social: Array<{ url: string }>;
}

export function restaurantJsonLd(site: SiteForJsonLd): Record<string, unknown> {
  const url = (path: string) => new URL(path, site.website).toString();
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: site.name,
    url: url('/'),
    servesCuisine: 'Italian',
    menu: url('/menu/'),
    acceptsReservations: url('/book/'),
  };
  if (isClean(site.hours.weekly)) ld.openingHoursSpecification = openingHours(site.hours.weekly);
  if (isClean(site.contact)) ld.telephone = site.contact.phoneE164;
  if (isClean(site.address)) {
    ld.address = {
      '@type': 'PostalAddress',
      streetAddress: site.address.line1,
      addressLocality: site.address.city,
      postalCode: site.address.postcode,
      addressCountry: 'GB',
    };
  }
  if (isClean(site.geo)) {
    ld.geo = { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng };
  }
  const sameAs = site.social.filter(isClean).map((s) => s.url);
  if (sameAs.length) ld.sameAs = sameAs;
  return ld;
}

/** Safe to inline in a <script type="application/ld+json">: no `</script>` break-out. */
export function serialiseJsonLd(ld: unknown): string {
  return JSON.stringify(ld).replace(/</g, '\\u003c');
}
