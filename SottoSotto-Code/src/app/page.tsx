import { HomeHero } from '@/components/home/HomeHero';
import {
  BookingBand,
  FeaturedDishes,
  FindUsTeaser,
  Philosophy,
  VenueDescent,
} from '@/components/home/HomeSections';
import { WineStrip } from '@/components/home/WineStrip';
import { pageMetadata, site, wine } from '@/content';
import { weeklySummary } from '@/lib/hours';
import { MotionScope } from '@/motion/MotionScope';

export const metadata = pageMetadata('home', '/');

/**
 * Featured dishes: the proposal in PAGES.md (only dishes with a "clear" photo match).
 * The client chooses the final set (OPEN_QUESTIONS Q19).
 */
const FEATURED_IDS = [
  'cicchetti-della-casa',
  'linguine-con-gamberi',
  'fettucce-al-ragu-di-manzo',
  'filetto-di-manzo-in-crosta-di-pistacchi',
  'polenta-grigliata-con-zucca-e-pecorino',
  'tiramisu',
] as const;

/** "Tue–Sat · 12–2 & 5–10": the chip's no-JS text, always true. */
function openDaysSummary(): string {
  return weeklySummary(site.hours.weekly)
    .filter((row) => row.sessions)
    .map((row) => `${row.days} · ${row.sessions}`)
    .join(', ');
}

/** Home (PAGES.md sections 1–8; the footer comes from the layout). */
export default function HomePage() {
  const wineNames = wine.groups.flatMap((g) => g.wines.map((w) => w.name));
  return (
    <MotionScope>
      <HomeHero hoursSummary={openDaysSummary()} />
      <Philosophy />
      <VenueDescent />
      <FeaturedDishes ids={FEATURED_IDS} />
      <WineStrip names={wineNames} />
      <BookingBand />
      <FindUsTeaser />
    </MotionScope>
  );
}
