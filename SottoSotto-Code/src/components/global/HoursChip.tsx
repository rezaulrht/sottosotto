'use client';

import { useEffect, useState } from 'react';
import { hoursStatus, statusText, type HoursData } from '@/lib/hours';
import styles from './HoursChip.module.css';

interface Props {
  hours: HoursData;
  /** Weekly summary rendered at build time, e.g. "Tue–Sat · 12–2 & 5–10". Always true. */
  summary: string;
}

/**
 * Hours beside the hero's Book button (D82): a hairline, the state as a small amber label,
 * the detail in the display face. Static weekly summary first (correct without JS and with no layout shift), then
 * today's state in Europe/London (ARCHITECTURE §5.2). Recomputed when the tab is shown again.
 */
export function HoursChip({ hours, summary }: Props) {
  const [text, setText] = useState(summary);

  useEffect(() => {
    const update = () => setText(statusText(hoursStatus(new Date(), hours)));
    update();
    const onVisible = () => {
      if (document.visibilityState === 'visible') update();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [hours]);

  // "Open today · 12–2 & 5–10" → state, then detail. The separator stays in the text (read
  // aloud and matched as one sentence) but is not shown; the two parts stack instead.
  const cut = text.match(/^(.*?)( · |, )(.*)$/);
  return (
    <p className={styles.chip} aria-live="polite">
      {cut ? (
        <span key={text} className={styles.inner}>
          <span className={styles.when}>{cut[1]}</span>
          <span className={styles.sep}>{cut[2]}</span>
          <span className={styles.detail}>{cut[3]}</span>
        </span>
      ) : (
        <span key={text} className={`${styles.inner} ${styles.when}`}>
          {text}
        </span>
      )}
    </p>
  );
}
