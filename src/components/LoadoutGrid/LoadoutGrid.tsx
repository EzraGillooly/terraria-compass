import type { DifficultyFilter } from '../../lib/difficulty';
import { isItemRelevantToDifficulty } from '../../lib/difficulty';
import type { Item, Loadout } from '../../data/schema';
import styles from './LoadoutGrid.module.css';

interface LoadoutGridProps {
  difficulty: DifficultyFilter;
  loadout: Loadout;
  selectedSubclassSet: Set<string>;
}

const WIKI_BASE = 'https://terraria.wiki.gg/wiki/Special:FilePath';

const fallbackIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' fill='%234A6830'/%3E%3Ctext x='18' y='24' text-anchor='middle' font-size='18' fill='%23C8D4A4' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";
const fallbackArmorIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Crect width='72' height='72' fill='%234A6830'/%3E%3Ctext x='36' y='48' text-anchor='middle' font-size='36' fill='%23C8D4A4' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

/** Build a wiki URL from an icon filename, e.g. "items/Zenith.png" → wiki path */
function wikiUrl(iconPath: string): string {
  // Strip any leading directory and use just the filename
  const filename = iconPath.split('/').pop() ?? iconPath;
  return `${WIKI_BASE}/${filename}`;
}

function makeErrorHandler(wikiSrc: string, finalFallback: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src !== wikiSrc && !img.src.startsWith('data:')) {
      img.src = wikiSrc;
    } else {
      img.src = finalFallback;
    }
  };
}

/* ── Shared compact item row ── */
function ItemRow({ item, difficulty }: { item: Item; difficulty: DifficultyFilter }) {
  const relevant = isItemRelevantToDifficulty(item.tags, difficulty);
  const localSrc = `${import.meta.env.BASE_URL}icons/${item.icon}`;
  const wiki     = wikiUrl(item.icon);
  return (
    <li
      className={styles.row}
      data-dimmed={String(!relevant)}
      data-top-pick={item.topPick || undefined}
    >
      <img
        alt=""
        className={`${styles.icon} pixel-img`}
        decoding="async"
        height="36"
        loading="lazy"
        onError={makeErrorHandler(wiki, fallbackIcon)}
        src={localSrc}
        width="36"
      />
      <div className={styles.rowBody}>
        <div className={styles.rowHeader}>
          <span className={styles.itemName}>{item.name}</span>
          {item.topPick && <span className={styles.badge}>★</span>}
          {item.subclass && <span className={styles.subTag}>{item.subclass}</span>}
        </div>
        {item.source && <div className={styles.source}>{item.source}</div>}
        {item.why && <div className={styles.detailBody}>{item.why}</div>}
      </div>
    </li>
  );
}

/* ── Armor column ── */
function ArmorColumn({ items, difficulty }: { items: Item[]; difficulty: DifficultyFilter }) {
  return (
    <div className={styles.col}>
      <div className={styles.colHeader}>
        <span className={styles.colTitle}>Armor</span>
      </div>
      <ul className={styles.armorList}>
        {items.map((item) => {
          const relevant  = isItemRelevantToDifficulty(item.tags, difficulty);
          const localSrc  = `${import.meta.env.BASE_URL}icons/${item.icon}`;
          const wiki      = wikiUrl(item.icon);
          return (
            <li
              key={item.id}
              className={styles.armorCard}
              data-dimmed={String(!relevant)}
              data-top-pick={item.topPick || undefined}
            >
              <img
                alt={item.name}
                className={`${styles.armorSprite} pixel-img`}
                decoding="async"
                height="72"
                loading="lazy"
                onError={makeErrorHandler(wiki, fallbackArmorIcon)}
                src={localSrc}
                width="72"
              />
              <div className={styles.armorInfo}>
                <div className={styles.armorName}>
                  {item.name}
                  {item.topPick && <span className={styles.badge}>★ Top</span>}
                </div>
                {item.source && <div className={styles.source}>{item.source}</div>}
                {item.why && <div className={styles.detailBody}>{item.why}</div>}
              </div>
            </li>
          );
        })}
        {items.length === 0 && <li className={styles.empty}>No armor data yet.</li>}
      </ul>
    </div>
  );
}

/* ── Weapons column ── */
function WeaponsColumn({
  items,
  difficulty,
  selectedSubclassSet,
}: {
  items: Item[];
  difficulty: DifficultyFilter;
  selectedSubclassSet: Set<string>;
}) {
  const filtered =
    selectedSubclassSet.size === 0
      ? items
      : items.filter((i) => !i.subclass || selectedSubclassSet.has(i.subclass));

  return (
    <div className={styles.col}>
      <div className={styles.colHeader}>
        <span className={styles.colTitle}>Weapons</span>
        <span className={styles.colCount}>{filtered.length}</span>
      </div>
      <ul className={styles.itemList}>
        {filtered.map((item) => (
          <ItemRow key={item.id} item={item} difficulty={difficulty} />
        ))}
        {filtered.length === 0 && (
          <li className={styles.empty}>No weapons match your filters.</li>
        )}
      </ul>
    </div>
  );
}

/* ── Accessories column — always 5 slots ── */
const SLOTS = 5;

function AccessoriesColumn({
  items,
  difficulty,
}: {
  items: Item[];
  difficulty: DifficultyFilter;
}) {
  const slots = Array.from({ length: SLOTS }, (_, i) => items[i] ?? null);

  return (
    <div className={styles.col}>
      <div className={styles.colHeader}>
        <span className={styles.colTitle}>Accessories</span>
        <span className={styles.colCount}>
          {Math.min(items.length, SLOTS)}/{SLOTS}
        </span>
      </div>
      <ul className={styles.itemList}>
        {slots.map((item, i) =>
          item ? (
            <ItemRow key={item.id} item={item} difficulty={difficulty} />
          ) : (
            <li key={`slot-${i}`} className={`${styles.row} ${styles.emptySlot}`}>
              <span className={styles.slotNum}>{i + 1}</span>
              <span className={styles.emptySlotLabel}>Empty slot</span>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

/* ── Buffs ── */
function BuffsSection({ items, difficulty }: { items: Item[]; difficulty: DifficultyFilter }) {
  if (items.length === 0) return null;
  return (
    <div className={styles.buffsSection}>
      <div className={styles.colHeader}>
        <span className={styles.colTitle}>Buffs</span>
        <span className={styles.colCount}>{items.length}</span>
      </div>
      <ul className={styles.buffsList}>
        {items.map((item) => {
          const relevant = isItemRelevantToDifficulty(item.tags, difficulty);
          const localSrc = `${import.meta.env.BASE_URL}icons/${item.icon}`;
          const wiki     = wikiUrl(item.icon);
          return (
            <li key={item.id} className={styles.buffRow} data-dimmed={String(!relevant)}>
              <img
                alt=""
                className={`${styles.buffIcon} pixel-img`}
                decoding="async"
                height="28"
                loading="lazy"
                onError={makeErrorHandler(wiki, fallbackIcon)}
                src={localSrc}
                width="28"
              />
              <span className={styles.buffName}>{item.name}</span>
              <span className={styles.source}>{item.source}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Root export ── */
export function LoadoutGrid({ difficulty, loadout, selectedSubclassSet }: LoadoutGridProps) {
  return (
    <section aria-label="Loadout" className={styles.root}>
      <div className={styles.grid}>
        <ArmorColumn items={loadout.armor} difficulty={difficulty} />
        <WeaponsColumn
          items={loadout.weapons}
          difficulty={difficulty}
          selectedSubclassSet={selectedSubclassSet}
        />
        <AccessoriesColumn items={loadout.accessories} difficulty={difficulty} />
      </div>
      <BuffsSection items={loadout.buffs} difficulty={difficulty} />
    </section>
  );
}
