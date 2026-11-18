import type { CSSProperties } from 'react';
import { Picture } from '@/components/shared/Picture';
import { press, pressImage, site } from '@/content';
import type { ManifestEntry, PressItem } from '@/content/schemas';
import { PressReader, type ReaderItem } from './PressReader';
import styles from './PressTable.module.css';

/**
 * Home: the press, papers on a dark table (design 2026-11-18, D70). The headline list is
 * the one accessible path (links that open the reader, or the image without JS); the
 * scattered pages are the same links for the pointer, hidden from assistive tech.
 * `press-drop` drops the pages in once; under reduced motion they are already at rest.
 */

/** Hand-set places on the table (percent of the table box) and resting angles. */
const PLACES: ReadonlyArray<{ x: number; y: number; w: number; r: number }> = [
  { x: 0, y: 2, w: 46, r: -6 },
  { x: 52, y: 0, w: 34, r: 4 },
  { x: 24, y: 18, w: 48, r: -2 },
  { x: 64, y: 20, w: 34, r: 7 },
  { x: 2, y: 42, w: 44, r: 3 },
  { x: 48, y: 44, w: 46, r: -5 },
  { x: 18, y: 60, w: 46, r: 6 },
  { x: 58, y: 64, w: 40, r: -3 },
  { x: 34, y: 34, w: 32, r: -8 },
];

const largest = (list: ManifestEntry['sources']['webp']) => list.at(-1)!.src;

function image(item: PressItem): ManifestEntry {
  const entry = pressImage(item.id);
  if (!entry) throw new Error(`No processed press page for "${item.id}". Run npm run images.`);
  return entry;
}

const sourceLine = (item: PressItem) => [item.publication, item.date].filter(Boolean).join(' · ');

export function PressTable() {
  const { eyebrow, heading } = site.copy.press;
  const items = press.items;
  const readerItems: ReaderItem[] = items
    .filter((i) => i.readable)
    .map((i) => {
      const img = image(i);
      return {
        id: i.id,
        publication: i.publication,
        date: i.date,
        headline: i.headline,
        spot: i.spot,
        avif: largest(img.sources.avif),
        webp: largest(img.sources.webp),
        width: img.width,
        height: img.height,
      };
    });

  return (
    <section className={styles.press} aria-labelledby="home-press">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <p className={`label ${styles.eyebrow}`}>{eyebrow}</p>
          <h2 id="home-press" className={styles.heading} data-effect="reveal-lines">
            {heading}
          </h2>
          <ol className={styles.list} data-press-list="">
            {items.map((item) => {
              const text = (
                <>
                  <span className={`label ${styles.source}`}>{sourceLine(item)}</span>
                  <span className={styles.headline}>{item.headline}</span>
                </>
              );
              return (
                <li key={item.id}>
                  {item.readable ? (
                    <a
                      href={largest(image(item).sources.webp)}
                      className={styles.entry}
                      data-press-open={item.id}
                      data-press-headline=""
                    >
                      {text}
                    </a>
                  ) : (
                    <p className={styles.entry} data-press-headline="">
                      {text}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className={styles.table} data-effect="press-drop" aria-hidden="true">
          {items.map((item, i) => {
            const place = PLACES[i % PLACES.length]!;
            const style = {
              '--x': `${place.x}%`,
              '--y': `${place.y}%`,
              '--w': `${place.w}%`,
              '--r': `${place.r}deg`,
              zIndex: i + 1,
            } as CSSProperties;
            const body = (
              <>
                <Picture
                  image={image(item)}
                  alt=""
                  sizes="(min-width: 64em) 26vw, (min-width: 48em) 40vw, 90vw"
                />
                <span className={styles.caption}>
                  <span className={`label ${styles.source}`}>{sourceLine(item)}</span>
                  <span className={styles.headline}>{item.headline}</span>
                </span>
              </>
            );
            return item.readable ? (
              <a
                key={item.id}
                href={largest(image(item).sources.webp)}
                className={styles.page}
                style={style}
                tabIndex={-1}
                data-press-page=""
                data-press-open={item.id}
              >
                {body}
              </a>
            ) : (
              <div key={item.id} className={styles.page} style={style} data-press-page="">
                {body}
              </div>
            );
          })}
        </div>
      </div>
      <PressReader items={readerItems} />
    </section>
  );
}
