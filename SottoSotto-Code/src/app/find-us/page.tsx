import { pageMetadata, site } from '@/content';
import { isProduction } from '@/lib/env';
import { directionsUrl } from '@/lib/prices';
import styles from '../pages.module.css';

export const metadata = pageMetadata('findUs', '/find-us/');

/* M1: every Find Us section with its data. The static dark map art comes in M6 (D42, Q1). */
export default function FindUsPage() {
  const { address, contact, copy, geo, parking } = site;
  // Getting here is optional and hidden in production while its entries are mock (ARCHITECTURE §4.2).
  const gettingHere = site.gettingHere.filter((g) => !(g.mock && isProduction()));
  return (
    <div className={styles.page}>
      <section className={styles.section} aria-labelledby="find-title">
        <div className={`container ${styles.stack}`}>
          <h1 id="find-title">Find Us</h1>
          <div className={styles.mapPlaceholder}>
            <p>Map of North Parade, Bath: drawn once the map pin is confirmed.</p>
          </div>
          <a
            href={directionsUrl(geo.lat, geo.lng)}
            className={styles.textLink}
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
          <h2 id="find-contact">{copy.enquiriesHeading}</h2>
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
          <h2 id="find-parking" className={styles.title}>
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
          <h2 id="find-careers">{copy.careers.heading}</h2>
          {copy.careers.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p>
            {copy.careers.applyText}{' '}
            <a href={`mailto:${contact.careersEmail}`}>{contact.careersEmail}</a>
          </p>
          <a href={`mailto:${contact.careersEmail}`} className={styles.textLink}>
            {copy.careers.button}
          </a>
        </div>
      </section>
    </div>
  );
}
