import { HomeHero } from '@/components/home/HomeHero';
import { BookingBand, MenuIndex, Philosophy, VenueDescent } from '@/components/home/HomeSections';
import { WineStrip } from '@/components/home/WineStrip';
import { pageMetadata, site, wine } from '@/content';
import { weeklySummary } from '@/lib/hours';
import { restaurantJsonLd, serialiseJsonLd } from '@/lib/jsonld';
import { legacyRedirectScript } from '@/lib/nav';
import { MotionScope } from '@/motion/MotionScope';

export const metadata = pageMetadata('home', '/');

/** "Tue–Sat · 12–2 & 5–10": the chip's no-JS text, always true. */
function openDaysSummary(): string {
  return weeklySummary(site.hours.weekly)
    .filter((row) => row.sessions)
    .map((row) => `${row.days} · ${row.sessions}`)
    .join(', ');
}

/** Home (PAGES.md: hero, philosophy, venue, menu, wine, booking; the footer comes from the layout). */
export default function HomePage() {
  const wineNames = wine.groups.flatMap((g) => g.wines.map((w) => w.name));
  return (
    <MotionScope>
      {/* Old `/?p=menu` style links (D43); inline so they move on before first paint. */}
      <script dangerouslySetInnerHTML={{ __html: legacyRedirectScript() }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serialiseJsonLd(restaurantJsonLd(site)) }}
      />
      <HomeHero hoursSummary={openDaysSummary()} />
      <Philosophy />
      <VenueDescent />
      <MenuIndex />
      <WineStrip title={`${wine.tab.label} list`} names={wineNames} />
      <BookingBand />
    </MotionScope>
  );
}
