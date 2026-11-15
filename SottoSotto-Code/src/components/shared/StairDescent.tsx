import type { CSSProperties, ReactNode } from 'react';
import { VenuePhoto } from './VenuePhoto';
import styles from './StairDescent.module.css';

interface Props {
  images: Array<{ src: string | null; alt: string; caption: string | null }>;
  /** Id of the heading inside `children` that names the section. */
  labelledBy: string;
  /** Text laid over the stage (heading, link). */
  children: ReactNode;
}

const MAX_DARK = 0.45;

/**
 * The stair descent (DESIGN_SYSTEM §4), used on Home (teaser) and Venue. Each frame is
 * darker and warmer than the last; `stair-descent` pins and slides them on desktop, fades
 * them in on phones, and nothing runs under reduced motion (frames stacked).
 */
export function StairDescent({ images, labelledBy, children }: Props) {
  return (
    <section className={styles.descent} aria-labelledby={labelledBy} data-effect="stair-descent">
      <div className={styles.stage} data-stage="">
        {images.map((img, i) => (
          <div
            key={`${img.alt}-${i}`}
            className={styles.step}
            data-step=""
            style={{ '--dark': (i / Math.max(1, images.length - 1)) * MAX_DARK } as CSSProperties}
          >
            <VenuePhoto image={img} sizes="100vw" fill />
          </div>
        ))}
        <div className={`container ${styles.stageText}`}>{children}</div>
      </div>
    </section>
  );
}
