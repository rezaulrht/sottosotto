import type { CSSProperties } from 'react';
import { BookButton } from '@/components/global/BookButton';
import { Picture } from '@/components/shared/Picture';
import { VenuePhoto } from '@/components/shared/VenuePhoto';
import { pageMetadata, venue, venuePhoto } from '@/content';
import { isDemo, siteEnv } from '@/lib/env';
import { MotionScope } from '@/motion/MotionScope';
import styles from './venue.module.css';

export const metadata = pageMetadata('venue', '/venue/');

type WallImage = (typeof venue.wall.images)[number];

/** Round-robin into columns, so the niches sit at different heights like a real wall. */
function columns(images: WallImage[], count: number): WallImage[][] {
  return Array.from({ length: count }, (_, c) => images.filter((_, i) => i % count === c));
}

/**
 * Venue (PAGES.md Venue, D77): a walk from the street down into the vault, in the client's
 * own photos (D76). Street level on North Parade; scrolling takes the stairs (the street
 * closes overhead, the stone takes over); below, Our story and the rooms in arched niches
 * set into the stone wall. Scroll motion is CSS only; without it (reduced motion, older
 * browsers) every part reads as a plain, static page. "Our story" text is MOCK (Q34).
 */
export default function VenuePage() {
  const { opening, setting, stairs, story, wall, bookingPrompt } = venue;
  // The street fact needs verification (Q33): shown in dev/staging only; a production
  // build cannot run while it is flagged.
  const showFact = !setting.fact.needsVerification || siteEnv() !== 'production';
  const showStory = !(story.mock && isDemo());
  const street = venuePhoto(stairs.image);
  const streetCredit = stairs.image.credit;
  const stone = venuePhoto(wall.texture);
  // "Leave the street, take the stairs, and step inside." → one line per step.
  const steps = setting.close.split(/(?<=,)\s+/);
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

      {/* 2. Street level */}
      <section className={styles.street} aria-labelledby="venue-street">
        <div className={`container ${styles.streetGrid}`}>
          <div className={styles.streetPhoto} data-effect="image-unmask">
            <VenuePhoto image={setting.image} sizes="(min-width: 64em) 58vw, 100vw" ratio="3 / 2" />
          </div>
          <div className={styles.streetText} data-rise="">
            <h2 id="venue-street" className={styles.heading}>
              {setting.heading}
            </h2>
            <p className={styles.lead}>{setting.lead}</p>
          </div>
          {showFact ? (
            <p className={styles.pull} data-needs-verification="">
              {setting.fact.text}
            </p>
          ) : null}
        </div>
      </section>

      {/* 3. The stairs: the street closes overhead as you go down (CSS scroll timeline). */}
      <div className={styles.stairs} data-venue-stairs="">
        <div className={styles.stairsStage}>
          {stone ? (
            <div className={styles.stairsStone} aria-hidden="true">
              <Picture image={stone} alt="" sizes="100vw" />
            </div>
          ) : null}
          <div className={styles.stairsSteps} aria-hidden="true" />
          {street ? (
            <div className={styles.stairsStreet} aria-hidden="true">
              <Picture image={street} alt="" sizes="100vw" />
            </div>
          ) : null}
          {streetCredit ? (
            <p className={styles.stairsCredit}>
              Photo:{' '}
              <a href={streetCredit.sourceUrl} rel="noopener">
                {streetCredit.author}
              </a>
              ,{' '}
              <a href={streetCredit.licenseUrl} rel="noopener license">
                {streetCredit.license}
              </a>
              , via Wikimedia Commons
            </p>
          ) : null}
          <p className={`container ${styles.stairsLine}`}>
            {steps.map((step, i) => (
              <span key={step} style={{ '--i': i } as CSSProperties}>
                {step}{' '}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* 4. The vault: the stone wall stays behind everything below. */}
      <div className={styles.vault}>
        {stone ? (
          <div className={styles.vaultStone} aria-hidden="true">
            <Picture image={stone} alt="" sizes="100vw" />
          </div>
        ) : null}

        {/* 4a. Our story (MOCK, Q34): left out of the client demo until the text exists (D83). */}
        {showStory ? (
          <section className={styles.story} aria-labelledby="venue-story">
            <div className={`container ${styles.storyGrid}`}>
              <VenuePhoto
                image={story.image}
                sizes="(min-width: 64em) 30vw, 70vw"
                ratio="3 / 4"
                className={`${styles.niche} ${styles.storyNiche}`}
                frameClassName={styles.arch}
                rise
              />
              <div className={styles.storyText} data-rise="">
                <h2 id="venue-story" className={styles.heading}>
                  {story.heading}
                </h2>
                <p className={styles.lead}>{story.text}</p>
              </div>
            </div>
          </section>
        ) : null}

        {/* 4b. The rooms, set into the wall */}
        <section className={styles.wall} aria-labelledby="venue-rooms">
          <div className="container">
            <h2 id="venue-rooms" className={styles.heading} data-effect="reveal-lines">
              The rooms
            </h2>
            <div className={styles.niches} data-venue-wall="">
              {columns(wall.images, 3).map((column, c) => (
                <div key={c} className={styles.column}>
                  {column.map((img) => (
                    <VenuePhoto
                      key={img.src}
                      image={img}
                      sizes="(min-width: 64em) 30vw, 46vw"
                      ratio={
                        img.shape === 'plaque' ? '2 / 1' : img.shape === 'round' ? '1 / 1' : '3 / 4'
                      }
                      className={`${styles.niche} ${styles[`niche-${img.shape}`]}`}
                      frameClassName={styles[img.shape]}
                      rise
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Booking prompt */}
        <section className={styles.book} aria-labelledby="venue-book">
          <div className={`container ${styles.bookPrompt}`} data-rise="">
            <h2 id="venue-book" className={styles.heading}>
              {bookingPrompt.heading}
            </h2>
            <BookButton label={bookingPrompt.button} />
          </div>
        </section>
      </div>
    </MotionScope>
  );
}
