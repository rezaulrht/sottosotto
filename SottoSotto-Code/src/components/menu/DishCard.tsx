import { Picture } from '@/components/shared/Picture';
import { allergens as allergenData, imageFor, menu } from '@/content';
import type { Dish } from '@/content/schemas';
import { allergenSets } from '@/lib/allergens';
import { formatPrice } from '@/lib/prices';
import { AllergenToggle } from './AllergenToggle';
import styles from './DishCard.module.css';

/** Proposal for an item the client lists with no allergens (Q35). */
export const NONE_TEXT = 'None of our listed allergens';

/**
 * One dish under the candle (ARCHITECTURE §7.5): photo with a dimming overlay, name,
 * (v)/(n) marks, price, description and the allergen toggle. Lit and dim states are
 * driven by `data-lit` (CandleLight), `:focus-within` and an open allergen toggle.
 */
export function DishCard({ dish }: { dish: Dish }) {
  const image = dish.image ? imageFor(dish.id) : undefined;
  const sets = allergenSets(dish, allergenData.categories);
  const titleId = `dish-${dish.id}`;
  return (
    <article className={styles.card} data-candle-item="" id={dish.id} aria-labelledby={titleId}>
      {image ? (
        <div className={styles.photo}>
          <Picture
            image={image}
            alt=""
            sizes="(min-width: 64em) 30vw, (min-width: 40em) 45vw, 100vw"
          />
        </div>
      ) : null}
      <div className={styles.head}>
        <h4 id={titleId} className={styles.name}>
          {dish.name}
          {dish.tags.map((t) => (
            <abbr key={t} title={menu.tagLegend[t]} className={styles.tag}>
              {' '}
              ({t})
            </abbr>
          ))}
        </h4>
        <span className={styles.price}>{formatPrice(dish.price)}</span>
      </div>
      {dish.description ? <p className={styles.description}>{dish.description}</p> : null}
      {sets ? (
        <AllergenToggle
          sets={sets}
          labels={{
            contains: allergenData.key.contains.label,
            canBeOmitted: allergenData.key.canBeOmitted.label,
          }}
          noneText={NONE_TEXT}
        />
      ) : null}
    </article>
  );
}
