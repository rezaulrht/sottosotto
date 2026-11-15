import type { CSSProperties } from 'react';
import { venuePhoto } from '@/content';
import { Picture } from './Picture';
import styles from './VenuePhoto.module.css';

interface Props {
  image: {
    src: string | null;
    alt: string;
    caption: string | null;
    credit?: { author: string; license: string; licenseUrl: string; sourceUrl: string };
  };
  sizes: string;
  /** Fill the positioned parent (for full-screen and pinned frames). */
  fill?: boolean;
  /** Width / height when not filling, e.g. "4 / 5". */
  ratio?: string;
  priority?: boolean;
  className?: string;
}

/**
 * A venue photo from venue.json (M5). Real photos come from the image pipeline; until the
 * client sends them (`src: null`, mock), a marked placeholder of the same size shows the
 * planned subject, so the layout and motion can be judged now.
 */
export function VenuePhoto({
  image,
  sizes,
  fill = false,
  ratio = '4 / 3',
  priority,
  className,
}: Props) {
  const entry = venuePhoto(image);
  const style = fill ? undefined : ({ aspectRatio: ratio } as CSSProperties);
  return (
    <figure
      className={[styles.figure, fill ? styles.fill : null, className].filter(Boolean).join(' ')}
    >
      <div
        className={[styles.frame, image.credit ? styles.graded : null].filter(Boolean).join(' ')}
        style={style}
      >
        {entry ? (
          <Picture
            image={entry}
            alt={image.alt}
            sizes={sizes}
            priority={priority}
            className={styles.picture}
          />
        ) : (
          <div className={styles.placeholder} role="img" aria-label={image.alt} data-placeholder="">
            <span aria-hidden="true">{image.alt}</span>
          </div>
        )}
      </div>
      {image.caption || image.credit ? (
        <figcaption className={styles.caption}>
          {image.caption}
          {image.credit ? (
            <span className={styles.credit}>
              Photo:{' '}
              <a href={image.credit.sourceUrl} rel="noopener">
                {image.credit.author}
              </a>
              ,{' '}
              <a href={image.credit.licenseUrl} rel="noopener license">
                {image.credit.license}
              </a>
              , via Wikimedia Commons
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
