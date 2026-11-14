import styles from './MockImage.module.css';

interface Props {
  alt: string;
  caption?: string | null;
  /** Width / height, e.g. "4 / 5". */
  ratio?: string;
}

/**
 * Placeholder for a photo the client has not sent yet (venue photos, video posters).
 * Shows the planned subject so reviewers know what goes there. Counted by the mock badge
 * through the `mock: true` flag on the data it comes from.
 */
export function MockImage({ alt, caption, ratio = '4 / 3' }: Props) {
  return (
    <figure className={styles.figure}>
      <div className={styles.box} style={{ aspectRatio: ratio }} role="img" aria-label={alt}>
        <span aria-hidden="true">{alt}</span>
      </div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
