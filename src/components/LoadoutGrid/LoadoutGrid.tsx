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
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' fill='%233D2864'/%3E%3Ctext x='18' y='24' text-anchor='middle' font-size='18' fill='%23B87CF8' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";
const fallbackArmorIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%233D2864'/%3E%3Ctext x='40' y='52' text-anchor='middle' font-size='40' fill='%23B87CF8' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

function ArmorCard({
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
      className={styles.armorCard}
      data-dimmed={String(!isRelevant)}
      data-top-pick={item.topPick || undefined}
    >
      <img
        alt={item.name}
        className={`${styles.armorSprite} pixel-img`}
        decoding="async"
        height="80"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = fallbackArmorIcon;
        }}
        src={`${import.meta.env.BASE_URL}icons/${item.icon}`}
        width="80"
      />
      <div className={styles.armorInfo}>
        <div className={styles.armorName} id={`item-${item.id}-name`}>
          {item.name}
          {item.topPick && <span className={styles.badge}>★ Top</span>}
        </div>
        <details className={styles.details}>
          <summary className={styles.summary}>Details</summary>
          <div className={styles.detailBody}>
            <div className={styles.source}>{item.source}</div>
            <div>{item.why}</div>
          </div>
        </details>
      </div>
    </article>
  );
}

function ItemRow({
  difficulty,
  item,
}: {
  difficulty: DifficultyFilter;
  item: Item;
}) {
  const isRelevant = isItemRelevantToDifficulty(item.tags, difficulty);

  return (
    <li
      className={styles.row}
      data-dimmed={String(!isRelevant)}
      data-top-pick={item.topPick || undefined}
    >
      <img
        alt=""
        className={`${styles.icon} pixel-img`}
        decoding="async"
        height="36"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = fallbackIcon;
        }}
        src={`${import.meta.env.BASE_URL}icons/${item.icon}`}
        width="36"
      />
      <div className={styles.rowBody}>
        <div className={styles.rowHeader}>
          <span className={styles.itemName} id={`item-${item.id}-name`}>
            {item.name}
          </span>
          {item.topPick && <span className={styles.badge}>★ Top</span>}
          {item.subclass && (
            <span className={styles.subclassTag}>{item.subclass}</span>
          )}
        </div>
        <details className={styles.details}>
          <summary className={styles.summary}>{item.source}</summary>
          <div className={styles.detailBody}>{item.why}</div>
        </details>
      </div>
    </li>
  );
}

function filterItems(items: Item[], selectedSubclassSet: Set<string>) {
  if (selectedSubclassSet.size === 0) return items;
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
    <section aria-labelledby="loadout-grid-heading" className={styles.root}>
      <h2 id="loadout-grid-heading">Loadout</h2>
      {groups.map((group) => {
        const items = filterItems(loadout[group.key], selectedSubclassSet);
        const isArmor = group.key === 'armor';

        return (
          <details className={styles.groupDetails} key={group.key} open>
            <summary className={styles.groupSummary}>
              <span className={styles.groupTitle}>{group.title}</span>
              <span className={styles.count}>{items.length}</span>
            </summary>

            {items.length === 0 ? (
              <div className={styles.empty}>No items authored yet.</div>
            ) : isArmor ? (
              <div className={styles.armorGrid}>
                {items.map((item) => (
                  <ArmorCard difficulty={difficulty} item={item} key={item.id} />
                ))}
              </div>
            ) : (
              <ul className={styles.list}>
                {items.map((item) => (
                  <ItemRow difficulty={difficulty} item={item} key={item.id} />
                ))}
              </ul>
            )}
          </details>
        );
      })}
    </section>
  );
}
