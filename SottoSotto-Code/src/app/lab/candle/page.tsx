import type { Metadata } from 'next';
import { CandleLight } from '@/components/menu/CandleLight';
import { DishCard } from '@/components/menu/DishCard';
import { allergens, menu } from '@/content';
import styles from '../lab.module.css';

export const metadata: Metadata = { title: 'Candle prototype' };

/** BUILD_PLAN M2: "To start" and "Pasta & risotto" with real data and photos. */
const SECTION_IDS = ['starters', 'pasta-risotto'];

export default function CandlePrototype() {
  const sections = menu.sections.filter((s) => SECTION_IDS.includes(s.id));
  return (
    <div className={styles.candlePage}>
      <div className={`container ${styles.page}`}>
        <p className={`label ${styles.eyebrow}`}>M2 prototype</p>
        <h1 className={styles.title}>Menu candle</h1>
        <p className={styles.lead}>
          Move the pointer over the dishes. On a phone, scroll. With the keyboard, Tab to an
          allergen toggle.
        </p>

        <CandleLight>
          {sections.map((section) => (
            <section
              key={section.id}
              className={styles.menuGroup}
              aria-labelledby={`group-${section.id}`}
            >
              <h2 id={`group-${section.id}`} className={styles.groupTitle}>
                {section.nameIt}
                <small>{section.nameEn}</small>
              </h2>
              <div className={styles.groupNotes}>
                <p>{allergens.generalNote}</p>
                <p>
                  (v) {menu.tagLegend.v} · (n) {menu.tagLegend.n} · Allergens:{' '}
                  {allergens.key.contains.label}, {allergens.key.canBeOmitted.label.toLowerCase()}
                </p>
              </div>
              <ul className={styles.dishGrid}>
                {section.items.map((dish) => (
                  <li key={dish.id}>
                    <DishCard dish={dish} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </CandleLight>
      </div>
    </div>
  );
}
