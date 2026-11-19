/**
 * Home sections 2–6 (PAGES.md Home). Server Components: static HTML that reads in full
 * without JS. Motion is declared with `data-effect` and run by MotionScope (D33).
 */
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { BookButton } from '@/components/global/BookButton';
import { Picture } from '@/components/shared/Picture';
import { StairDescent } from '@/components/shared/StairDescent';
import { VenuePhoto } from '@/components/shared/VenuePhoto';
import { desserts, imageFor, menu, site, venue, venuePhoto, wine } from '@/content';
import type { ManifestEntry } from '@/content/schemas';
import styles from './HomeSections.module.css';
import { WineRack, type RackGroup } from './WineRack';

/* ---- 2. Philosophy: an editorial spread (heading and photo, then the words) */

/** A dish photo beside the philosophy text: local seafood, Italian pasta. */
const PHILOSOPHY_IMAGE = 'linguine-con-gamberi';

/** Sets the Italian word in the copy ('Sapori') apart, without changing the text. */
function withSapori(text: string) {
  const parts = text.split(/('Sapori')/);
  return parts.map((part, i) =>
    part === "'Sapori'" ? (
      <em key={i} className={styles.sapori}>
        {part}
      </em>
    ) : (
      part
    ),
  );
}

export function Philosophy() {
  const { copy } = site;
  const [lead, ...rest] = copy.philosophyFull;
  const image = imageFor(PHILOSOPHY_IMAGE);
  return (
    <section className={styles.philosophy} aria-labelledby="home-philosophy">
      <div className={`container ${styles.philosophyGrid}`}>
        <div className={styles.philosophyAside}>
          <h2 id="home-philosophy" className={styles.philosophyHeading} data-effect="reveal-lines">
            {copy.philosophyHeading}
          </h2>
          {image ? (
            <div className={styles.philosophyPhoto} data-effect="image-unmask">
              <Picture image={image} alt="" sizes="(min-width: 64em) 36vw, 100vw" />
            </div>
          ) : null}
        </div>
        <div className={styles.philosophyBody}>
          <p className={styles.philosophyLead}>{lead}</p>
          <div className={styles.philosophyRest}>
            {rest.map((p) => (
              <p key={p}>{withSapori(p)}</p>
            ))}
          </div>
          <div className={styles.bookingLead}>
            <p>{copy.bookingNote}</p>
            <BookButton variant="outline" />
          </div>
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

/* ---- 4. Menu: a strip of courses, each opening its part of the Menu page */

interface Course {
  id: string;
  nameIt: string;
  nameEn: string;
  href: string;
  /** The dishes' names (Italian, as on the menu). */
  dishes: string[];
  image: ManifestEntry | undefined;
}

/** The food courses that have dishes with photos, then desserts and cheese together. */
function courses(): Course[] {
  const food = menu.sections
    .filter((s) => !('textOnly' in s && s.textOnly) && s.items.some((d) => d.image))
    .map((s) => ({
      id: s.id,
      nameIt: s.nameIt,
      nameEn: s.nameEn,
      href: `/menu/#group-${s.id}`,
      dishes: s.items.map((d) => d.name),
      image: imageFor(s.items.find((d) => d.image)!.id),
    }));
  const sweet = desserts.sections.flatMap((s) => s.items);
  const dessert: Course = {
    id: 'dessert',
    nameIt: desserts.sections.map((s) => s.nameIt).join(' & '),
    nameEn: desserts.sections.map((s) => s.nameEn).join(' & '),
    href: '/menu/#dessert',
    dishes: sweet.map((d) => d.name),
    image: imageFor(sweet.find((d) => d.image)!.id),
  };
  return [...food, dessert];
}

/** How many dish names a panel shows before "and more". */
const SHOWN = 3;

/**
 * Home: the menu as a strip of courses (user, 2026-11-18, replaces the tag line of D72).
 * Each course is a tall photo panel that opens on its own part of the Menu page; on a
 * laptop the panel under the pointer (or focus) widens and shows its first dishes, on a
 * phone the panels are a swipe row with the dishes shown. A taste of the Menu page, not a
 * copy of it: no prices, no allergens, no full lists.
 */
export function MenuCourses() {
  const list = courses();
  return (
    <section className={styles.section} aria-labelledby="home-menu">
      <div className={`container ${styles.coursesHead}`}>
        <h2 id="home-menu" className={styles.heading}>
          Menu
        </h2>
        <Link href="/menu/" className={styles.textLink}>
          See the full menu <span aria-hidden="true">→</span>
        </Link>
      </div>
      <ul className={`container ${styles.courses}`}>
        {list.map((c) => (
          <li key={c.id} className={styles.course}>
            <Link href={c.href} className={styles.courseLink}>
              {c.image ? (
                <Picture
                  image={c.image}
                  alt=""
                  sizes="(min-width: 64em) 45vw, (min-width: 48em) 40vw, 80vw"
                  className={styles.coursePhoto}
                />
              ) : null}
              <span className={styles.courseText}>
                <span className={styles.courseName}>{c.nameIt}</span>
                <span className={`label ${styles.courseIt}`}>{c.nameEn}</span>
                <span className={styles.courseDishes}>
                  {c.dishes.slice(0, SHOWN).map((d, i) => (
                    <span key={d} style={{ '--i': i } as CSSProperties}>
                      {d}
                    </span>
                  ))}
                  <span className="label" style={{ '--i': SHOWN } as CSSProperties}>
                    {c.dishes.length} dishes
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---- 5. Wine list: a rack of labels in front of the barrel wall (D77) */

export function WineList() {
  const title = `${wine.tab.label} list`;
  const photo = venuePhoto(venue.home.wine);
  const groups: RackGroup[] = wine.groups.map((g) => ({
    id: g.id,
    name: g.name,
    wines: g.wines.map((w) => ({
      id: w.id,
      name: w.name,
      producer: w.producer,
      region: w.region,
      vintage: w.vintage,
      note: w.note,
    })),
  }));
  return (
    <section className={styles.cellar} aria-labelledby="home-wine">
      {photo ? (
        <div className={styles.cellarPhoto}>
          <Picture image={photo} alt={venue.home.wine.alt} sizes="(min-width: 64em) 50vw, 100vw" />
        </div>
      ) : null}
      <div className={`container ${styles.cellarInner}`}>
        <h2 id="home-wine" className={styles.heading} data-effect="reveal-lines">
          {title}
        </h2>
        <WineRack groups={groups} />
        <Link href={`/menu/#${wine.tab.id}`} className={styles.textLink}>
          See the full {wine.tab.label.toLowerCase()} list
        </Link>
      </div>
    </section>
  );
}

/* ---- 6. Booking band: a set table, and a card framed like a place card */

export function BookingBand({ hoursSummary }: { hoursSummary: string }) {
  return (
    <section className={styles.band} aria-labelledby="home-book" data-meets-footer="">
      <div className={styles.bandMedia} data-effect="slow-zoom">
        <VenuePhoto image={venue.home.booking} sizes="100vw" fill />
      </div>
      <div className={`container ${styles.bandInner}`}>
        <div className={styles.bandCard}>
          <h2 id="home-book" className={styles.bandHeading} data-effect="reveal-lines">
            Reserve your table
          </h2>
          <p className={styles.bandNote}>{site.copy.bookingNote}</p>
          <p className={styles.bandHours}>{hoursSummary}</p>
          <BookButton />
        </div>
      </div>
    </section>
  );
}
