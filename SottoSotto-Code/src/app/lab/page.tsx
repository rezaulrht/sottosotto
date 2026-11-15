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
    href: '/book/',
    title: 'Booking (preview)',
    checks: [
      'Any Book a Table button opens the booking dialog; on a phone it is a full-screen sheet.',
      'Sundays, Mondays and holiday closures are greyed out; past days too.',
      'Pick a date, guests (1–5) and a time; some times show as fully booked (made up).',
      'Your details: try leaving a field empty to see the error messages.',
      'It always says preview: nothing is sent or booked yet.',
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
