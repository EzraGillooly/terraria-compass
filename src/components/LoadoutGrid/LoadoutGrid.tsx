import type { DifficultyFilter } from '../../lib/difficulty';
import { isItemRelevantToDifficulty } from '../../lib/difficulty';
import type { Item, Loadout } from '../../data/schema';
import type { SyntheticEvent } from 'react';
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

// Must mirror the WIKI_NAMES map in scripts/fetch-icons.mjs
const WIKI_NAMES: Record<string, string> = {
  "nights-edge":             "Night's_Edge",
  "abigails-flower":         "Abigail's_Flower",
  "horsemans-blade":         "Horseman's_Blade",
  "paladins-hammer":         "Paladin's_Hammer",
  "natures-gift":            "Nature's_Gift",
  "dao-of-pow":              "Dao_of_Pow",
  "shield-of-cthulhu":       "Shield_of_Cthulhu",
  "cloud-in-a-bottle":       "Cloud_in_a_Bottle",
  "flower-of-fire":          "Flower_of_Fire",
  "band-of-regeneration":    "Band_of_Regeneration",
  "blade-of-grass":          "Blade_of_Grass",
  "code-1":                  "Code_1",
  "sdmg":                    "S.D.M.G",
  "uzi":                     "Uzi",
  "star-cannon":             "Star_Cannon",
  "celebration-mk2":         "Celebration_Mk2",
  "platinum-armor":          "Platinum_armor",
  "gold-armor":              "Gold_armor",
  "shadow-armor":            "Shadow_armor",
  "crimson-armor":           "Crimson_armor",
  "jungle-armor":            "Jungle_armor",
  "ancient-cobalt-armor":    "Ancient_Cobalt_armor",
  "flinx-fur-coat":          "Flinx_Fur_Coat",
  "meteor-armor":            "Meteor_armor",
  "obsidian-armor":          "Obsidian_armor",
  "bee-armor":               "Bee_armor",
  "molten-armor":            "Molten_armor",
  "adamantite-armor":        "Adamantite_armor",
  "mythril-armor":           "Mythril_armor",
  "palladium-armor":         "Palladium_armor",
  "titanium-armor":          "Titanium_armor",
  "hallowed-armor":          "Hallowed_armor",
  "chlorophyte-armor":       "Chlorophyte_armor",
  "turtle-armor":            "Turtle_armor",
  "beetle-armor":            "Beetle_armor",
  "necro-armor":             "Necro_armor",
  "forbidden-armor":         "Forbidden_armor",
  "spider-armor":            "Spider_armor",
  "tiki-armor":              "Tiki_armor",
  "spooky-armor":            "Spooky_armor",
  "shroomite-armor":         "Shroomite_armor",
  "spectre-armor":           "Spectre_armor",
  "solar-flare-armor":       "Solar_Flare_armor",
  "vortex-armor":            "Vortex_armor",
  "nebula-armor":            "Nebula_armor",
  "stardust-armor":          "Stardust_armor",
  "bewitching-table":        "Bewitching_Table",
  "crystal-ball":            "Crystal_Ball",
  "ammo-box":                "Ammo_Box",
  "sharpening-station":      "Sharpening_Station",
  "crystal-bullets":         "Crystal_Bullet",
  "flask-of-ichor":          "Flask_of_Ichor",
  "golden-delight":          "Golden_Delight",
  "mana-regeneration-potion":"Mana_Regeneration_Potion",
  "lesser-mana-potion":      "Lesser_Mana_Potion",
  "ammo-reservation-potion": "Ammo_Reservation_Potion",
  "lifeforce-potion":        "Lifeforce_Potion",
  "endurance-potion":        "Endurance_Potion",
  "magic-power-potion":      "Magic_Power_Potion",
  "rage-potion":             "Rage_Potion",
  "wrath-potion":            "Wrath_Potion",
  "well-fed":                "Well_Fed",
};

function toWikiName(stem: string): string {
  if (WIKI_NAMES[stem]) return WIKI_NAMES[stem];
  return stem.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
}

/** Build a wiki URL from an icon path, e.g. "items/starfury.png" to wiki URL. */
function wikiUrl(iconPath: string): string {
  const filename = iconPath.split('/').pop() ?? iconPath;
  const stem = filename.replace(/\.png$/i, '');
  return `${WIKI_BASE}/${toWikiName(stem)}.png`;
}

function makeErrorHandler(wikiSrc: string, finalFallback: string) {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;

    if (img.dataset.iconFallbackStage === 'placeholder') {
      return;
    }

    if (img.dataset.iconFallbackStage !== 'wiki') {
      img.dataset.iconFallbackStage = 'wiki';
      img.src = wikiSrc;
      return;
    }

    img.dataset.iconFallbackStage = 'placeholder';
    img.src = finalFallback;
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
