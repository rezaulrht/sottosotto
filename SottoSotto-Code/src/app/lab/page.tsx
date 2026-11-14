import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './lab.module.css';

export const metadata: Metadata = { title: 'Prototypes' };

const PROTOTYPES = [
  {
    href: '/',
    title: 'Home hero',
    checks: [
      'The loop plays after the page has loaded, then fades in over the poster.',
      'The pause button (bottom left) stops the video, the grain and the badge, and stays paused when you come back in the same tab.',
      'With reduced motion on, or Data Saver on (Android Chrome), you see the still poster and nothing moves.',
      'Text stays readable over every shot of the loop.',
    ],
  },
  {
    href: '/lab/candle/',
    title: 'Menu candle',
    checks: [
      'Laptop: the pointer becomes a flame; the dish under it brightens with a spark and a pool of light.',
      'Phone: the dish crossing the middle of the screen lights up as you scroll.',
      'Keyboard: Tab to an “Allergens” toggle; its dish lights up. Opening it keeps the dish lit.',
      'Reduced motion: every dish is lit, no flame, nothing flickers.',
      'Dim dishes stay readable.',
    ],
  },
  {
    href: '/lab/hospres/',
    title: 'Hospres booking sheet',
    checks: [
      'Open it on an iPhone (Safari) and an Android phone (Chrome).',
      'Does the widget fit the sheet, or does it need its own scrolling?',
      'Does the keyboard cover the fields when you type your details?',
      'Is there a card or deposit step, and does it work inside the sheet?',
      'Note the sizes shown on the page and send a screenshot.',
    ],
  },
];

export default function LabIndex() {
  return (
    <div className={`container ${styles.page}`}>
      <p className={`label ${styles.eyebrow}`}>M2 review</p>
      <h1 className={styles.title}>Prototypes</h1>
      <p className={styles.lead}>
        Three pieces to judge on a laptop and a phone before the rest is built. Staging only; these
        pages are not part of the live site.
      </p>
      <ol className={styles.cards}>
        {PROTOTYPES.map((p) => (
          <li key={p.href} className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Link href={p.href}>{p.title}</Link>
            </h2>
            <ul className={styles.checks}>
              {p.checks.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
