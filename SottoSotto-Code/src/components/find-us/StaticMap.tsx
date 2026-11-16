import type { CSSProperties } from 'react';
import { site } from '@/content';
import mapData from '@/content/map.json';
import { toPercent } from '@/lib/map';
import styles from './StaticMap.module.css';

/**
 * Self-hosted dark map (D42, M6): an SVG drawn from OpenStreetMap data by `npm run map`,
 * with street and place labels as real text and the pin placed from site.json `geo`
 * (MOCK until the client confirms it, Q1). No third-party request. Directions are a plain
 * link to Google Maps, next to the map.
 */
export function StaticMap({ className }: { className?: string }) {
  const { geo, name } = site;
  const pin = toPercent(mapData.bbox, geo.lat, geo.lng);
  if (!pin) {
    throw new Error(
      'The map pin (site.json geo) is outside the drawn map. Widen the box in scripts/map.ts and run `npm run map`.',
    );
  }
  return (
    <figure className={[styles.map, className].filter(Boolean).join(' ')}>
      <div
        className={styles.canvas}
        style={{ aspectRatio: `${mapData.width} / ${mapData.height}` } as CSSProperties}
        role="img"
        aria-label={`Map of the streets around North Parade in Bath, with ${name} marked.`}
      >
        {/* A static SVG: next/image adds nothing in a static export (images are unoptimised). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/map/north-parade.svg"
          alt=""
          width={mapData.width}
          height={mapData.height}
          loading="lazy"
          decoding="async"
          className={styles.art}
        />
        <ul className={styles.labels} aria-hidden="true">
          {mapData.labels.map((l) => (
            <li
              key={l.text}
              style={{
                left: `${l.left}%`,
                top: `${l.top}%`,
                transform: `translate(-50%, -50%) rotate(${l.angle}deg)`,
              }}
            >
              {l.text}
            </li>
          ))}
        </ul>
        <div
          className={styles.pin}
          style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
          aria-hidden="true"
        >
          <span className={styles.dot} />
          <span className={styles.pinLabel}>{name}</span>
        </div>
      </div>
      <figcaption className={styles.credit}>
        Map data{' '}
        <a href={mapData.attributionUrl} rel="noopener license">
          {mapData.attribution}
        </a>
      </figcaption>
    </figure>
  );
}
