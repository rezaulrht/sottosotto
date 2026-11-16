/**
 * Home sections 2–7 (PAGES.md Home). Server Components: static HTML that reads in full
 * without JS. Motion is declared with `data-effect` and run by MotionScope (D33).
 */
import Link from 'next/link';
import { BookButton } from '@/components/global/BookButton';
import { Picture } from '@/components/shared/Picture';
import { StairDescent } from '@/components/shared/StairDescent';
import { StaticMap } from '@/components/find-us/StaticMap';
import { desserts, imageFor, menu, site, venue, wine } from '@/content';
import type { Dish } from '@/content/schemas';
import { formatPrice } from '@/lib/prices';
import styles from './HomeSections.module.css';

/* ---- 2. Philosophy */

export function Philosophy() {
  const { copy } = site;
  return (
    <section className={styles.philosophy} aria-labelledby="home-philosophy">
      <div className="container">
        <h2 id="home-philosophy" className={styles.heading} data-effect="reveal-lines">
          {copy.philosophyHeading}
        </h2>
        <div className={styles.philosophyText}>
          {copy.philosophyFull.map((p) => (
            <p key={p} data-effect="word-reveal">
              {p}
            </p>
          ))}
        </div>
        <div className={styles.bookingLead}>
          <p>{copy.bookingNote}</p>
          <BookButton variant="outline" />
        </div>
      </div>
    </section>
  );
}

/* ---- 3. Venue teaser: the stair descent (shared with the Venue page) */

export function VenueDescent() {
  return (
    <StairDescent images={venue.descent.images} labelledBy="home-venue">
      <h2 id="home-venue" className={styles.heading}>
        Venue
      </h2>
      <Link href="/venue/" className={styles.textLink}>
        Step inside
      </Link>
    </StairDescent>
  );
}

/* ---- 4. Featured menu */

function findDishes(ids: readonly string[]): Dish[] {
  const all = [...menu.sections, ...desserts.sections].flatMap((s) => s.items);
  return ids.map((id) => {
    const dish = all.find((d) => d.id === id);
    if (!dish) throw new Error(`Featured dish "${id}" is not in menu.json or desserts.json`);
    return dish;
  });
}

export function FeaturedDishes({ ids }: { ids: readonly string[] }) {
  return (
    <section className={styles.section} aria-labelledby="home-menu">
      <div className="container">
        <h2 id="home-menu" className={styles.heading} data-effect="reveal-lines">
          Menu
        </h2>
        <ul className={styles.dishes}>
          {findDishes(ids).map((dish) => {
            const image = imageFor(dish.id);
            return (
              <li key={dish.id}>
                <Link href={`/menu/#${dish.id}`} className={styles.dish}>
                  {image ? (
                    <span className={styles.dishPhoto}>
                      <Picture
                        image={image}
                        alt=""
                        sizes="(min-width: 64em) 30vw, (min-width: 40em) 45vw, 100vw"
                      />
                    </span>
                  ) : null}
                  <span className={styles.dishHead}>
                    <span className={styles.dishName}>{dish.name}</span>
                    <span className={styles.price}>{formatPrice(dish.price)}</span>
                  </span>
                  {dish.description ? (
                    <span className={styles.dishText}>{dish.description}</span>
                  ) : null}
                </Link>
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
  );
}

/* ---- 6. Booking band */

/** Until the client's booking-band media arrives (site.json media.bookingVideo), a dish photo. */
const BAND_IMAGE = 'cicchetti-della-casa';

export function BookingBand() {
  const image = imageFor(BAND_IMAGE);
  return (
    <section className={styles.band} aria-labelledby="home-book">
      {image ? (
        <div className={styles.bandMedia} data-effect="image-unmask">
          <Picture image={image} alt="" sizes="100vw" />
        </div>
      ) : null}
      <div className={`container ${styles.bandText}`}>
        <h2 id="home-book" className={styles.heading} data-effect="reveal-lines">
          Reserve your table
        </h2>
        <p className={styles.lead}>{site.copy.bookingNote}</p>
        <BookButton />
      </div>
    </section>
  );
}

/* ---- 7. Find us teaser */

export function FindUsTeaser() {
  const { address } = site;
  return (
    <section className={styles.section} aria-labelledby="home-find">
      <div className={`container ${styles.findUs}`}>
        <div className={styles.findUsText}>
          <h2 id="home-find" className={styles.heading} data-effect="reveal-lines">
            Find Us
          </h2>
          <address className={styles.address}>
            {site.name}
            <br />
            {address.line1}
            <br />
            {address.city} {address.postcode}
          </address>
          <ul className={styles.links}>
            <li>
              <Link href="/find-us/#parking">Parking nearby</Link>
            </li>
            <li>
              <Link href="/find-us/">Find Us</Link>
            </li>
          </ul>
        </div>
        <StaticMap />
      </div>
    </section>
  );
}
