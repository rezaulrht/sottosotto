import { BookButton } from '@/components/global/BookButton';
import { StairDescent } from '@/components/shared/StairDescent';
import { VenuePhoto } from '@/components/shared/VenuePhoto';
import { pageMetadata, venue } from '@/content';
import { siteEnv } from '@/lib/env';
import { MotionScope } from '@/motion/MotionScope';
import styles from './venue.module.css';

export const metadata = pageMetadata('venue', '/venue/');

/**
 * Venue (PAGES.md Venue, M5): a slow walk through the space. Every photo is a MOCK
 * placeholder until the client sends them (venue.json); "Our story" is MOCK (Q34).
 * Motion: slow zoom (1), pinned stair descent (2), image unmask (3a), pinned horizontal
 * rooms gallery (4); phones get native equivalents, reduced motion gets none.
 */
export default function VenuePage() {
  const { opening, descent, setting, story, rooms, details, bookingPrompt } = venue;
  // The street fact needs verification (Q33): shown in dev/staging only; a production
  // build cannot run while it is flagged.
  const showFact = !setting.fact.needsVerification || siteEnv() !== 'production';
  return (
    <MotionScope>
      {/* 1. Opening */}
      <section className={styles.opening} aria-labelledby="venue-title">
        <div className={styles.openingMedia} data-effect="slow-zoom">
          <VenuePhoto image={opening.image} sizes="100vw" fill priority />
        </div>
        <div className={`container ${styles.openingText}`}>
          <h1 id="venue-title" className={styles.display}>
            The Venue
          </h1>
        </div>
      </section>

      {/* 2. The descent */}
      <StairDescent images={descent.images} labelledBy="venue-descent">
        <h2 id="venue-descent" className="sr-only">
          The descent
        </h2>
      </StairDescent>

      {/* 3a. The street */}
      <section className={styles.section} aria-labelledby="venue-street">
        <div className={`container ${styles.splitInner}`}>
          <div className={styles.text}>
            <p className={`label ${styles.eyebrow}`}>{setting.eyebrow}</p>
            <h2 id="venue-street" className={styles.heading} data-effect="reveal-lines">
              {setting.heading}
            </h2>
            <p className={styles.lead}>{setting.lead}</p>
            {showFact ? (
              <p className={styles.fact} data-needs-verification="">
                {setting.fact.text}
              </p>
            ) : null}
            <p>{setting.close}</p>
          </div>
          <div data-effect="image-unmask">
            <VenuePhoto image={setting.image} sizes="(min-width: 64em) 45vw, 100vw" ratio="4 / 5" />
          </div>
        </div>
      </section>

      {/* 3b. Our story (MOCK, Q34) */}
      <section className={styles.section} aria-labelledby="venue-story">
        <div className={`container ${styles.splitInner} ${styles.reverse}`}>
          <div className={styles.text}>
            <h2 id="venue-story" className={styles.heading} data-effect="reveal-lines">
              {story.heading}
            </h2>
            <p className={styles.lead}>{story.text}</p>
          </div>
          <div data-effect="image-unmask">
            <VenuePhoto image={story.image} sizes="(min-width: 64em) 45vw, 100vw" ratio="4 / 5" />
          </div>
        </div>
      </section>

      {/* 4. The rooms */}
      <section className={styles.rooms} aria-labelledby="venue-rooms" data-effect="rooms-gallery">
        <h2 id="venue-rooms" className="sr-only">
          The rooms
        </h2>
        <div
          className={styles.roomsTrack}
          data-track=""
          tabIndex={0}
          role="region"
          aria-labelledby="venue-rooms"
        >
          {rooms.images.map((img, i) => (
            <VenuePhoto
              key={`${img.alt}-${i}`}
              image={img}
              sizes="(min-width: 64em) 60vw, 85vw"
              ratio="3 / 2"
              className={styles.room}
            />
          ))}
        </div>
      </section>

      {/* 5. Details */}
      <section className={styles.section} aria-labelledby="venue-details">
        <div className="container">
          <h2 id="venue-details" className="sr-only">
            Details
          </h2>
          <div className={styles.collage}>
            {details.images.map((img, i) => (
              <VenuePhoto
                key={`${img.alt}-${i}`}
                image={img}
                sizes="(min-width: 64em) 40vw, 50vw"
                ratio={i % 3 === 0 ? '4 / 5' : '1 / 1'}
                className={styles.detail}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Booking prompt */}
      <section className={styles.section} aria-labelledby="venue-book">
        <div className={`container ${styles.bookPrompt}`}>
          <h2 id="venue-book" className={styles.heading} data-effect="reveal-lines">
            {bookingPrompt.heading}
          </h2>
          <BookButton label={bookingPrompt.button} />
        </div>
      </section>
    </MotionScope>
  );
}
