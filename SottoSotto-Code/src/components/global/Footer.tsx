import Link from 'next/link';
import { site } from '@/content';
import { capitalise, weeklySummary } from '@/lib/hours';
import styles from './Footer.module.css';

/**
 * Philosophy line, hours, address, phone, info@, privacy, social (D10).
 * No careers link (D2). Every value comes from site.json.
 */
export function Footer() {
  const { address, contact, copy, hours, social } = site;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.lead}>
          <p className={styles.name}>{site.name}</p>
          <p className={styles.philosophy}>{copy.philosophyShort}</p>
          <p className={styles.note}>{copy.bookingNote}</p>
        </div>

        <section aria-labelledby="footer-hours">
          <h2 id="footer-hours" className={`label ${styles.heading}`}>
            Hours
          </h2>
          <dl className={styles.hours}>
            {weeklySummary(hours.weekly).map((row) => (
              <div key={row.days}>
                <dt>{row.days}</dt>
                <dd>{row.sessions ?? 'Closed'}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="footer-visit">
          <h2 id="footer-visit" className={`label ${styles.heading}`}>
            Visit
          </h2>
          <address className={styles.address}>
            {address.line1}
            <br />
            {address.city} {address.postcode}
          </address>
        </section>

        <section aria-labelledby="footer-contact">
          <h2 id="footer-contact" className={`label ${styles.heading}`}>
            Contact
          </h2>
          <ul className={styles.list}>
            <li>
              <span className={styles.muted}>{contact.phoneLabel}: </span>
              <a href={`tel:${contact.phoneE164}`}>{contact.phone}</a>
            </li>
            <li>
              <span className={styles.muted}>{contact.emailLabel}: </span>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
          </ul>
        </section>

        <div className={styles.bottom}>
          <ul className={styles.inline}>
            {social.map((s) => (
              <li key={s.platform}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {capitalise(s.platform)}
                </a>
              </li>
            ))}
          </ul>
          <ul className={styles.inline}>
            <li>
              <Link href="/privacy/">Privacy Policy</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
