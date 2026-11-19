import { HomeHero } from '@/components/home/HomeHero';
import {
  BookingBand,
  MenuCourses,
  Philosophy,
  VenueDescent,
  WineList,
} from '@/components/home/HomeSections';
import { PressSection } from '@/components/home/PressSection';
import { pageMetadata, site } from '@/content';
import { siteUrl } from '@/lib/env';
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

/** Home (PAGES.md: hero, philosophy, venue, press, menu, wine, booking; the footer comes from the layout). */
export default function HomePage() {
  return (
    <MotionScope>
      {/* Old `/?p=menu` style links (D43); inline so they move on before first paint. */}
      <script dangerouslySetInnerHTML={{ __html: legacyRedirectScript() }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serialiseJsonLd(restaurantJsonLd({ ...site, website: siteUrl(site.website) })),
        }}
      />
      <HomeHero hoursSummary={openDaysSummary()} />
      <Philosophy />
      <VenueDescent />
      <PressSection />
      <MenuCourses />
      <WineList />
      <BookingBand hoursSummary={openDaysSummary()} />
    </MotionScope>
  );
}
