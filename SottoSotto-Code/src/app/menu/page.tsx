import { AllergenToggle } from '@/components/menu/AllergenToggle';
import { CandleLight } from '@/components/menu/CandleLight';
import { DishCard, NONE_TEXT } from '@/components/menu/DishCard';
import { allergens, desserts, menu, pageMetadata, wine } from '@/content';
import type { Dish, DishSection, DrinkSection } from '@/content/schemas';
import { allergenSets } from '@/lib/allergens';
import { formatPrice } from '@/lib/prices';
import styles from '../pages.module.css';

export const metadata = pageMetadata('menu', '/menu/');

/*
 * Menu with the candle (ARCHITECTURE §7.5, PAGES.md Menu). Every dish, side, wine and bar
 * row is a candle item: lit under the pointer (laptop), in the middle of the screen
 * (phone) or on focus; all lit under reduced motion and without JS.
 * Allergens: dishes and sides show the toggle (client data only; `null` and `estimated`
 * render nothing). Drink allergens come in M4 (Q29).
 */

const ALLERGEN_LABELS = {
  contains: allergens.key.contains.label,
  canBeOmitted: allergens.key.canBeOmitted.label,
};

function SideAllergens({ dish }: { dish: Dish }) {
  const sets = allergenSets(dish, allergens.categories);
  return sets ? (
    <div className={styles.rowDetail}>
      <AllergenToggle sets={sets} labels={ALLERGEN_LABELS} noneText={NONE_TEXT} />
    </div>
  ) : null;
}

function TagMarks({ tags }: { tags: Array<'v' | 'n'> }) {
  if (!tags.length) return null;
  return (
    <span className={styles.tags}>
      {tags.map((t) => (
        <abbr key={t} title={menu.tagLegend[t]}>
          {' '}
          ({t})
        </abbr>
      ))}
    </span>
  );
}

function Legend() {
  return (
    <p className={styles.placeholderNote}>
      (v) {menu.tagLegend.v} · (n) {menu.tagLegend.n} · Allergens: {ALLERGEN_LABELS.contains},{' '}
      {ALLERGEN_LABELS.canBeOmitted.toLowerCase()}
    </p>
  );
}

function DishGroups({ sections }: { sections: DishSection[] }) {
  return sections.map((section) => (
    <section key={section.id} className={styles.group} aria-labelledby={`group-${section.id}`}>
      <h3 id={`group-${section.id}`} className={styles.groupTitle}>
        {section.nameIt}
        <small>{section.nameEn}</small>
      </h3>
      {section.textOnly ? (
        <ul className={styles.rows}>
          {section.items.map((dish) => (
            <li key={dish.id} id={dish.id} className={styles.row} data-candle-item="">
              <span>
                {dish.name}
                <TagMarks tags={dish.tags} />
              </span>
              <span className={styles.price}>{formatPrice(dish.price)}</span>
              {dish.description ? (
                <span className={styles.rowDetail}>{dish.description}</span>
              ) : null}
              <SideAllergens dish={dish} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.dishGrid}>
          {section.items.map((dish) => (
            <li key={dish.id}>
              <DishCard dish={dish} />
            </li>
          ))}
        </ul>
      )}
    </section>
  ));
}

function DrinkRows({ section }: { section: DrinkSection }) {
  if (section.shape === 'priceColumns') {
    const groups = section.groups ?? [{ name: null, items: section.items ?? [] }];
    return (
      <>
        <div className={styles.row} aria-hidden="true">
          <span />
          <span className={`${styles.rowPrices} ${styles.muted}`}>
            {section.priceColumns.map((c) => (
              <span key={c.id}>{c.label}</span>
            ))}
          </span>
        </div>
        {groups.map((group, gi) => (
          <div key={group.name ?? gi}>
            {group.name ? <h4 className={`label ${styles.subgroup}`}>{group.name}</h4> : null}
            <ul className={styles.rows}>
              {group.items.map((item) => (
                <li key={item.id} className={styles.row} data-candle-item="">
                  <span>
                    {item.name}
                    {item.abv !== null ? <span className={styles.muted}> {item.abv}%</span> : null}
                  </span>
                  <span className={styles.rowPrices}>
                    {section.priceColumns.map((c) => {
                      const p = item.prices[c.id];
                      return (
                        <span key={c.id}>
                          {p !== undefined ? formatPrice(p) : '–'}
                          <span className="sr-only"> for {c.label}</span>
                        </span>
                      );
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </>
    );
  }
  return (
    <ul className={styles.rows}>
      {section.items.map((item) => {
        const detail = [item.description, item.details, item.abv ? `${item.abv}%` : null]
          .filter(Boolean)
          .join(' · ');
        return (
          <li key={item.id} className={styles.row} data-candle-item="">
            <span>{item.name}</span>
            {section.shape === 'price' ? (
              <span className={styles.price}>{formatPrice(item.price)}</span>
            ) : (
              <span />
            )}
            {detail ? <span className={styles.rowDetail}>{detail}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

export default function MenuPage() {
  return (
    <div className={styles.dimmed}>
      <div className={`container ${styles.page}`}>
        <h1 className={styles.title}>Menu</h1>

        <nav aria-label="Menu sections">
          <ul className={styles.tabs}>
            <li>
              <a href="#menu">Menu</a>
            </li>
            <li>
              <a href="#dessert">Dessert</a>
            </li>
            <li>
              <a href={`#${wine.tab.id}`}>{wine.tab.label}</a>
            </li>
          </ul>
        </nav>

        <CandleLight>
          <section id="menu" className={styles.menuSection} aria-labelledby="menu-heading">
            <h2 id="menu-heading">Menu</h2>
            <p className={styles.muted}>{allergens.generalNote}</p>
            <Legend />
            <DishGroups sections={menu.sections} />
          </section>

          <section id="dessert" className={styles.menuSection} aria-labelledby="dessert-heading">
            <h2 id="dessert-heading">Dessert</h2>
            <p className={styles.muted}>{allergens.generalNote}</p>
            <Legend />
            <DishGroups sections={desserts.sections} />
          </section>

          <section id={wine.tab.id} className={styles.menuSection} aria-labelledby="wine-heading">
            <h2 id="wine-heading">{wine.tab.label}</h2>
            <p className={styles.muted}>{allergens.generalNote}</p>
            <p className={styles.placeholderNote}>
              {wine.notes.glassSizes} {wine.notes.smallGlass} {wine.notes.vat}
            </p>

            {wine.groups.map((group) => (
              <section key={group.id} className={styles.group} aria-labelledby={`wine-${group.id}`}>
                <h3 id={`wine-${group.id}`} className={styles.groupTitle}>
                  {group.name}
                </h3>
                <div className={styles.row} aria-hidden="true">
                  <span />
                  <span className={`${styles.rowPrices} ${styles.muted}`}>
                    <span>{group.glassMl} ml</span>
                    <span>Bottle</span>
                  </span>
                </div>
                <ul className={styles.rows}>
                  {group.wines.map((w) => (
                    <li key={w.id} className={styles.row} data-candle-item="">
                      <span>
                        {w.name}
                        {w.vintage ? <span className={styles.muted}> {w.vintage}</span> : null}
                      </span>
                      <span className={styles.rowPrices}>
                        <span>
                          {w.glass !== null ? formatPrice(w.glass) : 'bottle only'}
                          {w.glass !== null ? <span className="sr-only"> per glass</span> : null}
                        </span>
                        <span>
                          {formatPrice(w.bottle)}
                          <span className="sr-only"> per bottle</span>
                        </span>
                      </span>
                      {w.producer || w.region || w.note ? (
                        <span className={styles.rowDetail}>
                          {[w.producer, w.region].filter(Boolean).join(', ')}
                          {w.note ? <> — {w.note}</> : null}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {wine.drinks.map((section) => (
              <section
                key={section.id}
                className={styles.group}
                aria-labelledby={`bar-${section.id}`}
              >
                <h3 id={`bar-${section.id}`} className={styles.groupTitle}>
                  {section.nameIt ?? section.name}
                  {section.nameIt ? <small>{section.name}</small> : null}
                  {section.shape === 'uniformPrice' ? (
                    <small>all {formatPrice(section.uniformPrice)}</small>
                  ) : null}
                </h3>
                {section.note ? <p className={styles.placeholderNote}>{section.note}</p> : null}
                <DrinkRows section={section} />
              </section>
            ))}
          </section>
        </CandleLight>
      </div>
    </div>
  );
}
