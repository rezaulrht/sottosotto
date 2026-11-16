import buttons from '@/components/global/BookButton.module.css';
import { StaticMap } from '@/components/find-us/StaticMap';
import { pageMetadata, site } from '@/content';
import { isProduction } from '@/lib/env';
import { directionsUrl } from '@/lib/prices';
import { MotionScope } from '@/motion/MotionScope';
import styles from '../pages.module.css';

export const metadata = pageMetadata('findUs', '/find-us/');

/*
 * Find Us (PAGES.md, M6): self-hosted dark map with the pin and "Get directions" (D42),
 * contact block, parking cards, optional getting-here lines (hidden in production while
 * mock) and careers. Address, pin and walking times are MOCK until confirmed (Q1, Q30).
 */
const outlineButton = `${buttons.button} ${buttons.outline}`;
export default function FindUsPage() {
  const { address, contact, copy, geo, parking } = site;
  // Getting here is optional and hidden in production while its entries are mock (ARCHITECTURE §4.2).
  const gettingHere = site.gettingHere.filter((g) => !(g.mock && isProduction()));
  return (
    <MotionScope>
      <div className={styles.page}>
        <section className={styles.section} aria-labelledby="find-title">
          <div className={`container ${styles.stack}`}>
            <h1 id="find-title">Find Us</h1>
            <StaticMap className={styles.findMap} />
            <a
              href={directionsUrl(geo.lat, geo.lng)}
              className={outlineButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions
              <span className="sr-only"> (opens Google Maps)</span>
            </a>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="find-contact">
          <div className={`container ${styles.stack}`}>
            <h2 id="find-contact" data-effect="reveal-lines">
              {copy.enquiriesHeading}
            </h2>
            <address className={styles.contactLine}>
              {address.line1}, {address.city} {address.postcode}
            </address>
            <p className={`label ${styles.muted}`}>{contact.phoneLabel}</p>
            <p className={styles.contactLine}>
              <a href={`tel:${contact.phoneE164}`}>{contact.phone}</a>
            </p>
            <p className={`label ${styles.muted}`}>{contact.emailLabel}</p>
            <p className={styles.contactLine}>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
            <p className={styles.muted}>{copy.emailResponseNote}</p>
          </div>
        </section>

        <section id="parking" className={styles.section} aria-labelledby="find-parking">
          <div className="container">
            <h2 id="find-parking" className={styles.title} data-effect="reveal-lines">
              Parking
            </h2>
            <ul className={styles.grid}>
              {parking.map((p) => (
                <li key={p.name} className={styles.parkingCard}>
                  <h3 className={styles.cardTitle}>{p.name}</h3>
                  {p.address ? <p className={styles.muted}>{p.address}</p> : null}
                  <p>{p.walkingMinutes.value} min walk</p>
                  {p.note ? <p className={styles.muted}>{p.note}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {gettingHere.length ? (
          <section className={styles.section} aria-labelledby="find-getting-here">
            <div className={`container ${styles.stack}`}>
              <h2 id="find-getting-here">Getting here</h2>
              <ul>
                {gettingHere.map((g) => (
                  <li key={g.mode}>{g.text}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby="find-careers">
          <div className={`container ${styles.stack}`}>
            <h2 id="find-careers" data-effect="reveal-lines">
              {copy.careers.heading}
            </h2>
            {copy.careers.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p>
              {copy.careers.applyText}{' '}
              <a href={`mailto:${contact.careersEmail}`}>{contact.careersEmail}</a>
            </p>
            <a href={`mailto:${contact.careersEmail}`} className={outlineButton}>
              {copy.careers.button}
            </a>
          </div>
        </section>
      </div>
    </MotionScope>
  );
}
