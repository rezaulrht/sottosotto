import { isEmptySet, type AllergenSet } from '@/lib/allergens';
import styles from './AllergenToggle.module.css';

interface Props {
  sets: AllergenSet[];
  labels: { contains: string; canBeOmitted: string };
  /** Wording for a set with none of the client's categories (proposal, Q35). */
  noneText: string;
}

/**
 * Quiet "Allergens" toggle under a dish (PAGES.md "Allergens"). A native <details>: works
 * without JS, is keyboard reachable and announces its state. Opening it lights the dish.
 * "Contains" and "Can be made without" are separate labelled lines, never colour alone.
 */
export function AllergenToggle({ sets, labels, noneText }: Props) {
  return (
    <details className={styles.toggle}>
      <summary className={styles.summary}>Allergens</summary>
      <div className={styles.panel}>
        {sets.map((set, i) => (
          <dl key={set.label ?? i} className={styles.set}>
            {set.label ? <p className={styles.variant}>{set.label}</p> : null}
            {isEmptySet(set) ? (
              <p className={styles.none}>{noneText}</p>
            ) : (
              <>
                {set.contains.length ? (
                  <div className={styles.line}>
                    <dt>{labels.contains}</dt>
                    <dd>{set.contains.join(', ')}</dd>
                  </div>
                ) : null}
                {set.canBeOmitted.length ? (
                  <div className={styles.line}>
                    <dt>{labels.canBeOmitted}</dt>
                    <dd>{set.canBeOmitted.join(', ')}</dd>
                  </div>
                ) : null}
              </>
            )}
          </dl>
        ))}
      </div>
    </details>
  );
}
