import { BookingFlow } from '@/booking/BookingFlow';
import { bookingFlowProps, pageMetadata, site } from '@/content';
import styles from '../pages.module.css';

export const metadata = pageMetadata('book', '/book/');

/**
 * Booking page (D59): where every Book a Table link points. With JS the same flow usually
 * opens in the booking dialog instead; this page serves direct visits, shared links and
 * visitors without JS (who get the phone number and email).
 */
export default function BookPage() {
  const { contact, copy } = site;
  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>Book a Table</h1>
      <p className={styles.lead}>{copy.bookingNote}</p>
      <noscript>
        <p className={styles.lead}>
          Online booking needs JavaScript. To book, call us on{' '}
          <a href={`tel:${contact.phoneE164}`}>{contact.phone}</a> or email{' '}
          <a href={`mailto:${contact.email}`}>{contact.email}</a>.
        </p>
      </noscript>
      <div className={styles.bookPanel}>
        <BookingFlow {...bookingFlowProps()} headingLevel={2} />
      </div>
    </div>
  );
}
