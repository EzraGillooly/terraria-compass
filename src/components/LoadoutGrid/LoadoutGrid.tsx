import type { DifficultyFilter } from '../../lib/difficulty';
import { isItemRelevantToDifficulty } from '../../lib/difficulty';
import type { Item, Loadout } from '../../data/schema';
import styles from './LoadoutGrid.module.css';

interface LoadoutGridProps {
  difficulty: DifficultyFilter;
  loadout: Loadout;
  selectedSubclassSet: Set<string>;
}

const groups: Array<{
  key: keyof Pick<Loadout, 'weapons' | 'armor' | 'accessories' | 'buffs'>;
  title: string;
}> = [
  { key: 'weapons', title: 'Weapons' },
  { key: 'armor', title: 'Armor' },
  { key: 'accessories', title: 'Accessories' },
  { key: 'buffs', title: 'Buffs' },
];

const fallbackIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23c9b58a'/%3E%3Ctext x='20' y='26' text-anchor='middle' font-size='22' fill='%232a2118' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

function ItemCard({
  difficulty,
  item,
}: {
  difficulty: DifficultyFilter;
  item: Item;
}) {
  const isRelevant = isItemRelevantToDifficulty(item.tags, difficulty);

  return (
    <article
      aria-labelledby={`item-${item.id}-name`}
      className={styles.card}
      data-dimmed={String(!isRelevant)}
      data-top-pick={item.topPick || undefined}
    >
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          <img
            alt=""
            className={`${styles.icon} pixel-img`}
            decoding="async"
            height="40"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = fallbackIcon;
            }}
            src={`${import.meta.env.BASE_URL}icons/${item.icon}`}
            width="40"
          />
          <div className={styles.itemName} id={`item-${item.id}-name`}>
            {item.name}
          </div>
        </div>
        {item.topPick ? <span className={styles.badge}>Top pick</span> : null}
      </div>
      <div className={styles.source}>{item.source}</div>
      <div>{item.why}</div>
      {item.subclass ? (
        <div className={styles.meta}>Subclass: {item.subclass}</div>
      ) : null}
      {item.tags.length > 0 ? (
        <ul aria-label="Tags" className={styles.tags}>
          {item.tags.map((tag) => (
            <li className={styles.tag} key={tag}>
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function filterItems(items: Item[], selectedSubclassSet: Set<string>) {
  if (selectedSubclassSet.size === 0) {
    return items;
  }

  return items.filter(
    (item) => !item.subclass || selectedSubclassSet.has(item.subclass),
  );
}

export function LoadoutGrid({
  difficulty,
  loadout,
  selectedSubclassSet,
}: LoadoutGridProps) {
  return (
    <section aria-labelledby="loadout-grid-heading">
      <h2 id="loadout-grid-heading">Loadout</h2>
      {groups.map((group) => {
        const items = filterItems(loadout[group.key], selectedSubclassSet);

        return (
          <section className={styles.group} key={group.key}>
            <h3>
              {group.title}
              <span className={styles.count}>({items.length})</span>
            </h3>
            {items.length === 0 ? (
              <div className={styles.empty}>No items authored in this slot yet.</div>
            ) : (
              <ul className={styles.grid}>
                {items.map((item) => (
                  <li key={item.id}>
                    <ItemCard difficulty={difficulty} item={item} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </section>
  );
}
