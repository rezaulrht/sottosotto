'use client';

import { useState, type CSSProperties } from 'react';
import type { WalksMap } from '@/lib/walks';
import styles from './Walks.module.css';

export interface WalkRow {
  mode: string;
  /** "By train" */
  way: string;
  /** The directions line from site.json. */
  text: string;
  minutes: number | null;
  from: string | null;
}

interface Props {
  map: WalksMap;
  rows: WalkRow[];
  /** The street drawing behind the routes (the Find Us map's own SVG). */
  art: { src: string; width: number; height: number };
  attribution: { text: string; url: string };
}

/**
 * Find Us "Getting here" (D81): the three walks drawn on the map. Each route draws itself the
 * first time the section is seen (the section is a `data-rise` group; see globals.css);
 * pointing at, tapping or focusing a way lights its route and dims the others. The rows carry
 * the directions for everyone; the map is an illustration of them.
 */
export function Walks({ map, rows, art, attribution }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const { crop } = map;
  // Map pixels per CSS pixel are about crop.width / 640: keep labels and strokes legible.
  const u = crop.width / 640;

  return (
    <div className={styles.walks} data-active={active ?? undefined} data-rise="">
      <figure className={styles.figure}>
        <svg
          viewBox={map.viewBox}
          className={styles.map}
          role="img"
          aria-label={`Map of the walks to North Parade from ${rows
            .map((r) => r.from)
            .filter(Boolean)
            .join(', ')}.`}
        >
          <image href={art.src} x={0} y={0} width={art.width} height={art.height} />
          <g className={styles.labels} style={{ fontSize: 12 * u } as CSSProperties}>
            {map.labels.map((l) => (
              <text
                key={l.text}
                x={l.x}
                y={l.y}
                transform={`rotate(${l.angle} ${l.x} ${l.y})`}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {l.text}
              </text>
            ))}
          </g>
          {map.walks.map((w, i) => (
            <g
              key={w.mode}
              className={styles.walk}
              data-mode={w.mode}
              style={{ '--n': i, '--u': u } as CSSProperties}
            >
              <path d={w.d} pathLength={1} className={styles.route} />
              <circle cx={w.start.x} cy={w.start.y} r={5 * u} className={styles.start} />
              {/* Labels sit on the side away from the other start (bus to the left). */}
              <text
                x={w.start.x + (w.mode === 'bus' ? -9 : 9) * u}
                y={w.start.y + 4 * u}
                textAnchor={w.mode === 'bus' ? 'end' : 'start'}
                className={styles.from}
              >
                {w.from}
              </text>
            </g>
          ))}
          <g className={styles.pin}>
            <circle cx={map.pin.x} cy={map.pin.y} r={7 * u} />
            {/* Below the pin: North Parade's own label runs along the street beside it. */}
            <text
              x={map.pin.x}
              y={map.pin.y + 24 * u}
              textAnchor="middle"
              style={{ fontSize: 14 * u }}
            >
              Sotto Sotto
            </text>
          </g>
        </svg>
        <figcaption className={styles.credit}>
          Map data <a href={attribution.url}>{attribution.text}</a>
        </figcaption>
      </figure>

      <ul className={styles.rows}>
        {rows.map((r) => (
          <li key={r.mode} className={styles.row} data-mode={r.mode}>
            <button
              type="button"
              className={styles.way}
              aria-pressed={active === r.mode}
              onClick={() => setActive(r.mode)}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') setActive(r.mode);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === 'mouse') setActive(null);
              }}
              onFocus={() => setActive(r.mode)}
              onBlur={() => setActive(null)}
            >
              <span className={styles.wayName}>{r.way}</span>
              {r.minutes ? (
                <span className={styles.minutes}>
                  {r.minutes}
                  <span className="label"> min walk</span>
                </span>
              ) : null}
              <span className="sr-only">, show this walk on the map</span>
            </button>
            <p className={styles.text}>{r.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
