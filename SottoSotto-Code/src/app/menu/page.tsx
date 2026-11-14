import { Picture } from '@/components/shared/Picture';
import { allergens, desserts, imageFor, menu, pageMetadata, wine } from '@/content';
import type { DishSection, DrinkSection } from '@/content/schemas';
import { formatPrice } from '@/lib/prices';
import styles from '../pages.module.css';

export const metadata = pageMetadata('menu', '/menu/');

/*
 * M1: plain, readable rendering of all menu data. Tabs, candle lighting and the allergen
 * toggle come in M4. Allergens are deliberately not rendered yet; when they are,
 * `null` and `estimated` must render nothing (ARCHITECTURE §11.2).
 */

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
      (v) {menu.tagLegend.v} · (n) {menu.tagLegend.n}
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
            <li key={dish.id} className={styles.row}>
              <span>
                {dish.name}
                <TagMarks tags={dish.tags} />
              </span>
              <span className={styles.price}>{formatPrice(dish.price)}</span>
              {dish.description ? (
                <span className={styles.rowDetail}>{dish.description}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.grid}>
          {section.items.map((dish) => {
            const image = dish.image ? imageFor(dish.id) : undefined;
            return (
              <li key={dish.id} id={dish.id} className={styles.card}>
                {image ? (
                  <Picture
                    image={image}
                    alt=""
                    sizes="(min-width: 64em) 30vw, (min-width: 40em) 45vw, 100vw"
                  />
                ) : null}
                <div className={styles.dishHead}>
                  <h4 className={styles.cardTitle}>
                    {dish.name}
                    <TagMarks tags={dish.tags} />
                  </h4>
                  <span className={styles.price}>{formatPrice(dish.price)}</span>
                </div>
                {dish.description ? <p className={styles.muted}>{dish.description}</p> : null}
              </li>
            );
          })}
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
                <li key={item.id} className={styles.row}>
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
          <li key={item.id} className={styles.row}>
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
                <li key={w.id} className={styles.row}>
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
          <section key={section.id} className={styles.group} aria-labelledby={`bar-${section.id}`}>
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
    </div>
  );
}
