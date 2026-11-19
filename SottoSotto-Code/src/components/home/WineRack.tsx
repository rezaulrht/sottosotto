'use client';

import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import styles from './WineRack.module.css';

export interface RackWine {
  id: string;
  name: string;
  producer: string | null;
  region: string | null;
  vintage: string | null;
  note: string | null;
}

export interface RackGroup {
  id: string;
  name: string;
  wines: RackWine[];
}

interface Props {
  groups: RackGroup[];
}

/**
 * Home §5 (D77): the wine list as a rack of upright labels, like the bottles racked in the
 * barrel wall. Pointing at a label (or tapping it, or arrowing to it) pulls it out and the
 * card shows its producer, region, vintage and note. Tabs pattern: one tab stop, arrow keys
 * move along the rack. Without JS the first wine's card shows and the link opens the list.
 */
export function WineRack({ groups }: Props) {
  const wines = groups.flatMap((g) => g.wines.map((w) => ({ ...w, group: g })));
  const [current, setCurrent] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const wine = wines[current]!;

  const move = (to: number) => {
    const next = (to + wines.length) % wines.length;
    setCurrent(next);
    tabs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowDown: current + 1,
      ArrowLeft: current - 1,
      ArrowUp: current - 1,
      Home: 0,
      End: wines.length - 1,
    };
    const to = keys[e.key];
    if (to === undefined) return;
    e.preventDefault();
    move(to);
  };

  const meta = [wine.producer, wine.region, wine.vintage].filter(Boolean).join(' · ');
  // Where each group starts in the flat list of wines.
  const starts = groups.map((_, g) =>
    groups.slice(0, g).reduce((n, earlier) => n + earlier.wines.length, 0),
  );

  return (
    <div className={styles.rack}>
      <div
        className={styles.card}
        role="tabpanel"
        id="wine-card"
        aria-labelledby={`wine-tab-${wine.id}`}
        aria-live="polite"
      >
        <p key={wine.id} className={styles.cardName}>
          {wine.name}
        </p>
        {meta ? <p className={styles.cardMeta}>{meta}</p> : null}
        {wine.note ? <p className={styles.cardNote}>{wine.note}</p> : null}
      </div>

      <div
        className={styles.shelf}
        role="tablist"
        aria-label="Wines"
        aria-orientation="horizontal"
        data-rise=""
      >
        {groups.map((group, g) => (
          <div
            key={group.id}
            className={styles.group}
            data-group={group.id}
            style={{ '--count': group.wines.length } as CSSProperties}
          >
            <div className={styles.bottles}>
              {group.wines.map((w, n) => {
                const i = starts[g]! + n;
                const selected = i === current;
                return (
                  <button
                    key={w.id}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`wine-tab-${w.id}`}
                    aria-selected={selected}
                    aria-controls="wine-card"
                    aria-label={`${w.name}, ${group.name}`}
                    tabIndex={selected ? 0 : -1}
                    className={styles.label}
                    style={{ '--i': i } as CSSProperties}
                    onClick={() => setCurrent(i)}
                    onPointerEnter={(e) => {
                      if (e.pointerType === 'mouse') setCurrent(i);
                    }}
                    onFocus={() => setCurrent(i)}
                    onKeyDown={onKeyDown}
                  >
                    <span className={styles.capsule} aria-hidden="true" />
                    <span className={styles.labelName} aria-hidden="true">
                      {w.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className={styles.groupName} aria-hidden="true">
              {group.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
