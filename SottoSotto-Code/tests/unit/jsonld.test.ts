import { describe, expect, it } from 'vitest';
import { isClean, restaurantJsonLd, serialiseJsonLd } from '@/lib/jsonld';
import { site } from '@/content';
import { flagsInFile } from '@/content/report';
import raw from '../../data/site.json';

/** Every string and number inside the flagged objects of site.json. */
function flaggedLeaves(): string[] {
  const out: string[] = [];
  const get = (path: string) =>
    path
      .replace(/\[(\d+)\]/g, '.$1')
      .split('.')
      .reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], raw);
  const walk = (v: unknown) => {
    if (typeof v === 'string' && v.length > 3) out.push(v);
    else if (typeof v === 'number' && String(v).length > 3)
      out.push(String(v)); // e.g. coordinates
    else if (v && typeof v === 'object')
      for (const [k, c] of Object.entries(v)) if (!k.startsWith('_')) walk(c);
  };
  for (const f of flagsInFile('site.json', raw)) walk(get(f.path));
  return out;
}

describe('JSON-LD Restaurant (D43)', () => {
  const ld = restaurantJsonLd(site);
  const text = JSON.stringify(ld);

  it('contains no value from a mock, to-confirm or unconfirmed object', () => {
    const leaked = flaggedLeaves().filter(
      (v) => text.includes(v) && !['Sotto Sotto', 'true', 'false'].includes(v),
    );
    expect(leaked).toEqual([]);
  });

  it('leaves out the flagged address, geo, telephone and social links today', () => {
    expect(ld).not.toHaveProperty('address');
    expect(ld).not.toHaveProperty('geo');
    expect(ld).not.toHaveProperty('telephone');
    expect(ld).not.toHaveProperty('sameAs');
  });

  it('keeps the confirmed facts: name, cuisine, menu, booking page, weekly hours', () => {
    expect(ld).toMatchObject({
      '@type': 'Restaurant',
      name: 'Sotto Sotto',
      url: 'https://www.sottosotto.co.uk/',
      servesCuisine: 'Italian',
      menu: 'https://www.sottosotto.co.uk/menu/',
      acceptsReservations: 'https://www.sottosotto.co.uk/book/',
    });
    expect(ld.openingHoursSpecification).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
          (d) => `https://schema.org/${d}`,
        ),
        opens: '12:00',
        closes: '14:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
          (d) => `https://schema.org/${d}`,
        ),
        opens: '17:00',
        closes: '22:00',
      },
    ]);
  });

  it('adds a field as soon as its source is confirmed', () => {
    const confirmed = {
      ...site,
      address: { line1: '1 Test Street', city: 'Bath', postcode: 'BA1 1AA' },
      geo: { lat: 51.38, lng: -2.36 },
    };
    const withAddress = restaurantJsonLd(confirmed);
    expect(withAddress).toHaveProperty('address.postalCode', 'BA1 1AA');
    expect(withAddress).toHaveProperty('geo.latitude', 51.38);
  });

  it('isClean sees nested flags', () => {
    expect(isClean({ a: { mock: true } })).toBe(false);
    expect(isClean({ a: { confirmed: true } })).toBe(true);
  });

  it('serialises without a way out of the script element', () => {
    expect(serialiseJsonLd({ x: '</script><script>alert(1)</script>' })).not.toContain('</');
  });
});
