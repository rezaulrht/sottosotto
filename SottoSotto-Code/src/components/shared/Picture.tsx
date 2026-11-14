import type { ManifestEntry } from '@/content/schemas';
import styles from './Picture.module.css';

interface Props {
  image: ManifestEntry;
  alt: string;
  /** The `sizes` attribute, e.g. "(min-width: 64em) 33vw, 100vw". */
  sizes: string;
  /** Above the fold: load eagerly with high priority (the LCP image). */
  priority?: boolean;
  className?: string;
}

/**
 * <picture> with AVIF and WebP srcsets from the image manifest, intrinsic width and
 * height (no layout shift) and a blurred placeholder behind it (ARCHITECTURE §4.1).
 */
export function Picture({ image, alt, sizes, priority = false, className }: Props) {
  const srcset = (list: ManifestEntry['sources']['webp']) =>
    list.map((s) => `${s.src} ${s.width}w`).join(', ');
  const fallback = image.sources.webp.at(-1)!;
  return (
    <picture className={[styles.picture, className].filter(Boolean).join(' ')}>
      <source type="image/avif" srcSet={srcset(image.sources.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(image.sources.webp)} sizes={sizes} />
      <img
        src={fallback.src}
        alt={alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ backgroundImage: `url("${image.lqip}")` }}
        className={styles.img}
      />
    </picture>
  );
}
