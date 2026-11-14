import Link from 'next/link';
import { BookButton } from '@/components/global/BookButton';
import { HoursChip } from '@/components/global/HoursChip';
import { MockImage } from '@/components/shared/MockImage';
import { Picture } from '@/components/shared/Picture';
import { desserts, imageFor, menu, pageMetadata, site, venue, wine } from '@/content';
import type { Dish } from '@/content/schemas';
import { weeklySummary } from '@/lib/hours';
import { formatPrice } from '@/lib/prices';
import styles from './pages.module.css';

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
];

function featuredDishes(): Dish[] {
  const all = [...menu.sections, ...desserts.sections].flatMap((s) => s.items);
  return FEATURED_IDS.map((id) => {
    const dish = all.find((d) => d.id === id);
    if (!dish) throw new Error(`Featured dish "${id}" is not in menu.json or desserts.json`);
    return dish;
  });
}

/** "Tue–Sat · 12–2 & 5–10": the chip's no-JS text, always true. */
function openDaysSummary(): string {
  return weeklySummary(site.hours.weekly)
    .filter((row) => row.sessions)
    .map((row) => `${row.days} · ${row.sessions}`)
    .join(', ');
}

export default function HomePage() {
  const { copy, hours } = site;
  return (
    <>
      {/* 1. Hero: video and rotating badge come in M3 (placeholder video D50). */}
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={`container ${styles.stack}`}>
          <p className={`label ${styles.eyebrow}`}>{site.tagline}</p>
          <h1 id="home-title" className={styles.display}>
            {site.name}
          </h1>
          <p className={styles.lead}>{copy.homeIntro}</p>
          <HoursChip hours={hours} summary={openDaysSummary()} />
          <BookButton href={site.booking.widgetUrl} />
        </div>
      </section>

      {/* 2. Philosophy */}
      <section className={styles.section} aria-labelledby="home-philosophy">
        <div className={`container ${styles.stack}`}>
          <h2 id="home-philosophy" className={styles.title}>
            {copy.philosophyHeading}
          </h2>
          {copy.philosophyFull.map((p) => (
            <p key={p} className={styles.lead}>
              {p}
            </p>
          ))}
          <p>{copy.bookingNote}</p>
          <BookButton href={site.booking.widgetUrl} variant="outline" />
        </div>
      </section>

      {/* 3. Venue teaser: pinned stair descent in M3; photos are placeholders. */}
      <section className={styles.section} aria-labelledby="home-venue">
        <div className="container">
          <h2 id="home-venue" className={styles.title}>
            Venue
          </h2>
          <div className={styles.grid}>
            {venue.descent.images.map((img) => (
              <MockImage key={img.alt} alt={img.alt} caption={img.caption} ratio="3 / 4" />
            ))}
          </div>
          <p>
            <Link href="/venue/" className={styles.textLink}>
              Step inside
            </Link>
          </p>
        </div>
      </section>

      {/* 4. Featured menu */}
      <section className={styles.section} aria-labelledby="home-menu">
        <div className="container">
          <h2 id="home-menu" className={styles.title}>
            Menu
          </h2>
          <ul className={styles.grid}>
            {featuredDishes().map((dish) => {
              const image = imageFor(dish.id);
              return (
                <li key={dish.id} className={styles.card}>
                  {image ? (
                    <Picture
                      image={image}
                      alt=""
                      sizes="(min-width: 64em) 30vw, (min-width: 40em) 45vw, 100vw"
                    />
                  ) : null}
                  <div className={styles.dishHead}>
                    <h3 className={styles.cardTitle}>{dish.name}</h3>
                    <span className={styles.price}>{formatPrice(dish.price)}</span>
                  </div>
                  {dish.description ? <p className={styles.muted}>{dish.description}</p> : null}
                </li>
              );
            })}
          </ul>
          <ul className={styles.links}>
            <li>
              <Link href="/menu/#menu">Menu</Link>
            </li>
            <li>
              <Link href="/menu/#dessert">Dessert</Link>
            </li>
            <li>
              <Link href={`/menu/#${wine.tab.id}`}>{wine.tab.label}</Link>
            </li>
          </ul>
        </div>
      </section>

      {/* 5. Wine strip: marquee in M3 */}
      <section className={styles.section} aria-labelledby="home-wine">
        <div className="container">
          <h2 id="home-wine" className={styles.title}>
            From the cellar
          </h2>
          <p className={styles.lead}>
            {wine.groups.flatMap((g) => g.wines.map((w) => w.name)).join(' · ')}
          </p>
        </div>
      </section>

      {/* 6. Booking band */}
      <section className={styles.section} aria-labelledby="home-book">
        <div className={`container ${styles.stack}`}>
          <h2 id="home-book">Reserve your table</h2>
          <p className={styles.lead}>{copy.bookingNote}</p>
          <BookButton href={site.booking.widgetUrl} />
        </div>
      </section>

      {/* 7. Find us teaser: static map in M6 (D42) */}
      <section className={styles.section} aria-labelledby="home-find">
        <div className={`container ${styles.stack}`}>
          <h2 id="home-find">Find Us</h2>
          <address className={styles.lead} style={{ fontStyle: 'normal' }}>
            {site.address.line1}, {site.address.city} {site.address.postcode}
          </address>
          <Link href="/find-us/#parking" className={styles.textLink}>
            Parking nearby
          </Link>
        </div>
      </section>
    </>
  );
}
