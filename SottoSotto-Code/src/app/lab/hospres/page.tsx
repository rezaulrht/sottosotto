import type { Metadata } from 'next';
import { BookingSheetSpike } from '@/components/lab/BookingSheetSpike';
import { site } from '@/content';
import styles from '../lab.module.css';

export const metadata: Metadata = { title: 'Hospres spike' };

/** BUILD_PLAN M2: the real widget in a bare sheet, to answer Q25 on real phones. */
export default function HospresSpike() {
  return (
    <div className={`container ${styles.page}`}>
      <p className={`label ${styles.eyebrow}`}>M2 spike</p>
      <h1 className={styles.title}>Hospres booking sheet</h1>
      <p className={styles.lead}>
        The real Hospres widget inside a plain sheet: full screen on phones, a centred panel on
        larger screens. Nothing here is styled yet. Open it, try a booking up to the last step (do
        not confirm), and note what happens.
      </p>
      <BookingSheetSpike url={site.booking.widgetUrl} note={site.copy.bookingNote} />
    </div>
  );
}
