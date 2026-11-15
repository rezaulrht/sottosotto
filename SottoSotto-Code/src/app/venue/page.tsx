import { BookButton } from '@/components/global/BookButton';
import { MockImage } from '@/components/shared/MockImage';
import { pageMetadata, venue } from '@/content';
import { siteEnv } from '@/lib/env';
import styles from '../pages.module.css';

export const metadata = pageMetadata('venue', '/venue/');

/* M1: every Venue section with its data; motion (zoom, pinned descent, gallery) in M5. */
export default function VenuePage() {
  const { opening, descent, setting, story, rooms, details, bookingPrompt } = venue;
  // The street fact needs verification (Q33). Shown in dev/staging only; production
  // cannot build while it is flagged.
  const showFact = !setting.fact.needsVerification || siteEnv() !== 'production';
  return (
    <div className={styles.page}>
      <section className={styles.section} aria-labelledby="venue-title">
        <div className="container">
          <h1 id="venue-title" className={styles.title}>
            The Venue
          </h1>
          <MockImage alt={opening.image.alt} caption={opening.image.caption} ratio="16 / 9" />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="venue-descent">
        <div className="container">
          <h2 id="venue-descent" className={styles.title}>
            The descent
          </h2>
          <div className={styles.grid}>
            {descent.images.map((img) => (
              <MockImage key={img.alt} alt={img.alt} caption={img.caption} ratio="3 / 4" />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="venue-street">
        <div className={`container ${styles.stack}`}>
          <p className={`label ${styles.eyebrow}`}>{setting.eyebrow}</p>
          <h2 id="venue-street">{setting.heading}</h2>
          <p className={styles.lead}>{setting.lead}</p>
          {showFact ? <p>{setting.fact.text}</p> : null}
          <p>{setting.close}</p>
          <MockImage alt={setting.image.alt} caption={setting.image.caption} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="venue-story">
        <div className={`container ${styles.stack}`}>
          <h2 id="venue-story">{story.heading}</h2>
          <p>{story.text}</p>
          <MockImage alt={story.image.alt} caption={story.image.caption} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="venue-rooms">
        <div className="container">
          <h2 id="venue-rooms" className={styles.title}>
            The rooms
          </h2>
          <div className={styles.grid}>
            {rooms.images.map((img) => (
              <MockImage key={img.alt} alt={img.alt} caption={img.caption} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="venue-details">
        <div className="container">
          <h2 id="venue-details" className={styles.title}>
            Details
          </h2>
          <div className={styles.grid}>
            {details.images.map((img) => (
              <MockImage key={img.alt} alt={img.alt} caption={img.caption} ratio="1 / 1" />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="venue-book">
        <div className={`container ${styles.stack}`}>
          <h2 id="venue-book">{bookingPrompt.heading}</h2>
          <BookButton label={bookingPrompt.button} />
        </div>
      </section>
    </div>
  );
}
