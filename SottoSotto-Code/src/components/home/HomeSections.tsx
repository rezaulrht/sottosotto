/**
 * Home sections 2–6 (PAGES.md Home). Server Components: static HTML that reads in full
 * without JS. Motion is declared with `data-effect` and run by MotionScope (D33).
 */
import Link from 'next/link';
import { BookButton } from '@/components/global/BookButton';
import { Picture } from '@/components/shared/Picture';
import { StairDescent } from '@/components/shared/StairDescent';
import { desserts, imageFor, menu, site, venue, wine } from '@/content';
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

/* ---- 4. Menu: a line of course tags to the Menu page (the user: a pointer, not a showcase) */

interface Tag {
  label: string;
  href: string;
}

function menuTags(): Tag[] {
  const food = menu.sections
    .filter((s) => !('textOnly' in s && s.textOnly))
    .map((s) => ({ label: s.nameEn, href: '/menu/#menu' }));
  const dessert = {
    label: desserts.sections.map((s) => s.nameEn).join(' & '),
    href: '/menu/#dessert',
  };
  return [...food, dessert, { label: wine.tab.label, href: `/menu/#${wine.tab.id}` }];
}

export function MenuTags() {
  return (
    <section className={styles.section} aria-labelledby="home-menu">
      <div className={`container ${styles.menuTags}`}>
        <h2 id="home-menu" className={styles.label}>
          Menu
        </h2>
        <ul className={styles.tags}>
          {menuTags().map((t) => (
            <li key={t.label}>
              <Link href={t.href}>{t.label}</Link>
            </li>
          ))}
        </ul>
        <Link href="/menu/" className={styles.textLink}>
          See the menu <span aria-hidden="true">→</span>
        </Link>
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
