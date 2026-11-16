/**
 * Home sections 2–6 (PAGES.md Home). Server Components: static HTML that reads in full
 * without JS. Motion is declared with `data-effect` and run by MotionScope (D33).
 */
import Link from 'next/link';
import { BookButton } from '@/components/global/BookButton';
import { Picture } from '@/components/shared/Picture';
import { StairDescent } from '@/components/shared/StairDescent';
import { desserts, imageFor, menu, site, venue, wine } from '@/content';
import type { Dish } from '@/content/schemas';
import styles from './HomeSections.module.css';

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

/* ---- 4. The menu at a glance: its courses, not a handful of dishes */

interface Course {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  /** A few names from the course, as a taste of what is in it. */
  sample: string[];
  /** The first dish in the course with a photo. */
  imageId: string | null;
}

function courses(): Course[] {
  const firstPhoto = (items: Dish[]) => items.find((d) => imageFor(d.id))?.id ?? null;
  const food: Course[] = menu.sections
    .filter((s) => !('textOnly' in s && s.textOnly))
    .map((s) => ({
      id: s.id,
      title: s.nameIt,
      subtitle: s.nameEn,
      href: '/menu/#menu',
      sample: s.items.slice(0, 3).map((d) => d.name),
      imageId: firstPhoto(s.items),
    }));
  const [sweet, ...others] = desserts.sections;
  const dessert: Course = {
    id: sweet!.id,
    title: sweet!.nameIt,
    subtitle: [sweet!.nameEn, ...others.map((o) => o.nameEn)].join(' & '),
    href: '/menu/#dessert',
    sample: sweet!.items.slice(0, 3).map((d) => d.name),
    imageId: firstPhoto(sweet!.items),
  };
  const drink: Course = {
    id: wine.tab.id,
    title: wine.tab.label,
    subtitle: [
      ...wine.groups.map((g) => g.name),
      ...wine.drinks.slice(0, 3).map((d) => d.name),
    ].join(' · '),
    href: `/menu/#${wine.tab.id}`,
    sample: [],
    imageId: null,
  };
  return [...food, dessert, drink];
}

export function MenuIndex() {
  return (
    <section className={styles.section} aria-labelledby="home-menu">
      <div className="container">
        <h2 id="home-menu" className={styles.heading} data-effect="reveal-lines">
          Menu
        </h2>
        <ol className={styles.courses}>
          {courses().map((c, i) => {
            const image = c.imageId ? imageFor(c.imageId) : undefined;
            return (
              <li key={c.id}>
                <Link href={c.href} className={styles.course}>
                  <span className={styles.courseNo} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.courseText}>
                    <span className={styles.courseTitle}>{c.title}</span>
                    <span className={styles.courseSub}>{c.subtitle}</span>
                    {c.sample.length ? (
                      <span className={styles.courseSample}>{c.sample.join(' · ')}</span>
                    ) : null}
                  </span>
                  {image ? (
                    <span className={styles.coursePhoto} aria-hidden="true">
                      <Picture image={image} alt="" sizes="(min-width: 48em) 16rem, 5rem" />
                    </span>
                  ) : null}
                  <span className={styles.courseArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <p className={styles.menuMore}>
          <Link href="/menu/" className={styles.textLink}>
            See the full menu
          </Link>
        </p>
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
