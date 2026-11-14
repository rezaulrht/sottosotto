import { flags } from '@/content';
import { mockOverride, siteEnv } from '@/lib/env';
import styles from './MockBadge.module.css';

/** True when the mock badge must show: dev and staging, or production built with the override. */
export function showMockBadge(): boolean {
  return siteEnv() !== 'production' || mockOverride();
}

/**
 * Corner badge listing every flagged value (D45). Native <details>, so it needs no JS.
 * Never rendered in a normal production build (which fails anyway while flags remain).
 */
export function MockBadge() {
  if (!showMockBadge() || flags.length === 0) return null;
  return (
    <details className={styles.badge}>
      <summary className={styles.summary}>
        Mock data · {flags.length} values
        <span className="sr-only"> (show list)</span>
      </summary>
      <div className={styles.panel}>
        <p className={styles.intro}>
          Placeholder or unconfirmed content ({siteEnv()} build). Full list:{' '}
          <code>npm run content:report</code>.
        </p>
        <ul className={styles.list}>
          {flags.map((f) => (
            <li key={`${f.file}:${f.path}`}>
              <code>
                {f.file} → {f.path}
              </code>
              {f.label ? <span> {f.label}</span> : null}
              <span className={styles.reasons}> ({f.reasons.join(', ')})</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
