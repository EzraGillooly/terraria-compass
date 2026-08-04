import { Fragment, useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ItemModal } from '../components/ItemModal/ItemModal';
import { useAppState, usePack } from '../lib/app-context';
import { isObtainable } from '../lib/difficulty';
import type { DifficultyFilter } from '../lib/difficulty';
import { useSubclassFilters } from '../lib/subclasses';
import type { Item, PhaseId } from '../data/schema';
import type { SyntheticEvent } from 'react';
import styles from './Loadouts.module.css';

const BASE = import.meta.env.BASE_URL;
const WIKI = 'https://terraria.wiki.gg/wiki/Special:FilePath';

/* Class rail icons - a representative early-game weapon per class, served locally
   from public/icons/classes (Copper Broadsword, Wooden Bow, Topaz Staff, Finch Staff). */

/* Phase → biome backdrop / representative boss (data has no bossIcon yet). */
const PHASE_BIOME: Record<PhaseId, string> = {
  'pre-bosses': 'forest',
  'pre-skeletron': 'dungeon',
  'pre-wof': 'underworld',
  'pre-mech': 'snow',
  'pre-plantera': 'jungle',
  'pre-golem': 'jungle',
  'pre-cultist': 'dungeon',
  'pre-moonlord': 'hallow',
  endgame: 'sky',
  // Thorium phases (its own progression tiers).
  'thor-pre-boss': 'forest',
  'thor-pre-evil': 'forest',
  'thor-mid-prehm': 'snow',
  'thor-pre-skeletron': 'dungeon',
  'thor-pre-wof': 'underworld',
  'thor-post-wof': 'hallow',
  'thor-pre-mech': 'snow',
  'thor-post-mech': 'jungle',
  'thor-pre-lunar': 'dungeon',
  'thor-pre-primordials': 'hallow',
  'thor-endgame': 'sky',
};
const PHASE_BOSS: Record<PhaseId, string> = {
  'pre-bosses': 'eye-of-cthulhu',
  'pre-skeletron': 'skeletron',
  'pre-wof': 'wall-of-flesh',
  'pre-mech': 'the-twins',
  'pre-plantera': 'plantera',
  'pre-golem': 'golem',
  'pre-cultist': 'lunatic-cultist',
  'pre-moonlord': 'moon-lord',
  endgame: 'moon-lord',
  // Calamity's phase waypoints show a curated map icon per phase; these map each
  // one to the boss that icon depicts (matched by icon content) so the banner's
  // in-game sprite/gif lines up with the map marker in the progress bar.
  'cal-pre-boss': 'desert-scourge',
  'cal-pre-evil': 'brain-of-cthulhu',
  'cal-pre-hive-perf': 'the-perforators',
  'cal-pre-skeletron': 'skeletron',
  'cal-pre-wof': 'wall-of-flesh',
  'cal-pre-mech': 'cryogen',
  'cal-post-mech1': 'aquatic-scourge',
  'cal-post-mech2': 'brimstone-elemental',
  'cal-pre-plantera': 'plantera',
  'cal-pre-golem': 'golem',
  'cal-pre-lunar': 'lunatic-cultist',
  'cal-pre-ml': 'moon-lord',
  'cal-pre-providence': 'providence-the-profaned-goddess',
  'cal-pre-polterghast': 'polterghast',
  'cal-pre-dog': 'the-devourer-of-gods',
  'cal-pre-yharon': 'yharon-dragon-of-rebirth',
  'cal-pre-exo': 'auric-bar',                  // Auric Bar - the tier's endgame material, distinct from post-Exo
  'cal-post-calamitas': 'supreme-witch-calamitas',
  'cal-post-exo': 'exo-mechs',
  // cal-post-golem (prismatic crystal) and cal-endgame (compass) have no single
  // boss, so they are left out - the banner falls back to their own map art.
  // Thorium phases → the boss whose map icon marks that tier.
  'thor-pre-boss': 'the-grand-thunder-bird',
  'thor-pre-evil': 'brain-of-cthulhu',
  'thor-mid-prehm': 'queen-jellyfish',
  'thor-pre-skeletron': 'skeletron',
  'thor-pre-wof': 'wall-of-flesh',
  'thor-post-wof': 'borean-strider',
  'thor-pre-mech': 'the-twins',
  'thor-post-mech': 'plantera',
  'thor-pre-lunar': 'lunatic-cultist',
  'thor-pre-primordials': 'moon-lord',
  'thor-endgame': 'the-primordials',
};

function makeWikiName(stem: string): string {
  const overrides: Record<string, string> = {
    'nights-edge': "Night's_Edge",
    'shield-of-cthulhu': 'Shield_of_Cthulhu',
    'cloud-in-a-bottle': 'Cloud_in_a_Bottle',
  };
  return overrides[stem] ?? stem.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
}

function makeErrorHandler(wikiSrc: string, fallback: string) {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.stage === 'placeholder') return;
    if (img.dataset.stage !== 'wiki') { img.dataset.stage = 'wiki'; img.src = wikiSrc; return; }
    img.dataset.stage = 'placeholder';
    img.src = fallback;
  };
}

const FALLBACK_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Crect width='36' height='36' fill='%23E6F2ED'/%3E%3Ctext x='18' y='24' text-anchor='middle' font-size='18' fill='%234F6E60' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

/* Prefer the real wiki page name for the sprite fallback - kebab→TitleCase mangles
   names with apostrophes ("Ball O' Hurt" → Ball_O_Hurt, which 404s). */
function iconSrcs(icon: string, wikiUrl?: string) {
  // any image extension, not just .png - an animated entry is a .gif, and
  // leaving the extension on the stem produced "Any-balloon.gif.png" as the
  // wiki fallback name
  const stem = icon.replace(/\.(png|gif|jpe?g|webp)$/i, '').split('/').pop() ?? '';
  const fromWikiUrl = wikiUrl?.split('/wiki/')[1];
  const wikiName = fromWikiUrl || makeWikiName(stem);
  /* Ask the wiki the item actually lives on. This was hardcoded to the
     Terraria wiki, so a Calamity item with no local sprite fell through to a
     404 there and then to the "?" placeholder, when the mod wiki has the
     sprite. The item's own wikiUrl names the right host. */
  const host = wikiUrl?.startsWith('https://calamitymod.wiki.gg')
    ? 'https://calamitymod.wiki.gg/wiki/Special:FilePath'
    : WIKI;
  return { local: `${BASE}icons/${icon}`, wiki: `${host}/${wikiName}.png` };
}

/* ── Weapon card ── */
function WeaponTile({ item, difficulty, onOpen }: { item: Item; difficulty: DifficultyFilter; onOpen: (i: Item) => void }) {
  const locked = !isObtainable(item, difficulty);
  const { local, wiki } = iconSrcs(item.icon, item.wikiUrl);

  // No top-pick star: `topPick` only ever meant "listed first in the wiki's
  // class-setup table", which is layout order rather than a ranking, so the
  // highlight asserted a best-in-slot the data never established.
  return (
    <button
      type="button"
      className={`${styles.wtile} pixel-frame pixel-hollow ${locked ? styles.locked : ''}`}
      title={locked ? 'Not obtainable in a Classic world' : undefined}
      onClick={() => onOpen(item)}
    >
      <div className={styles.wIcon}>
        <img
          src={local} alt="" aria-hidden="true"
          className={`${styles.wtileImg} pixel-img`}
          width="40" height="40" loading="lazy"
          onError={makeErrorHandler(wiki, FALLBACK_ICON)}
        />
      </div>
      <div className={styles.wName}>{item.name}</div>
      {item.source && <div className={styles.wSource}>{item.source}</div>}
      {item.subclass && <span className={`${styles.wSub} pixel-frame pixel-hollow`}>{item.subclass}</span>}
    </button>
  );
}

/* One minion in the Minion Mixing card: its sprite, its name, and the count to
   summon shown as gold text in the top-right corner (not a pill). */
function MinionMixCard({ item, count, onOpen }: { item: Item; count: number; onOpen: (i: Item) => void }) {
  const { local, wiki } = iconSrcs(item.icon, item.wikiUrl);
  return (
    <button
      type="button"
      className={`${styles.mixItem} pixel-frame pixel-hollow`}
      onClick={() => onOpen(item)}
      title={`${count} × ${item.name}`}
    >
      <span className={styles.mixIcon}>
        <img
          src={local} alt="" aria-hidden="true"
          className="pixel-img" width="40" height="40" loading="lazy"
          onError={makeErrorHandler(wiki, FALLBACK_ICON)}
        />
        <span className={styles.mixCount}>×{count}</span>
      </span>
      <span className={styles.mixName}>{item.name}</span>
    </button>
  );
}

/* Ammo reads better grouped by what fires it: every arrow together, then
   bullets, then rockets. The guide lists them in one run, so a bow user had to
   pick their arrows out from among bullets and darts. Anything that matches no
   family keeps its order at the end under "Other". */
const AMMO_FAMILIES: [string, RegExp][] = [
  // matched anywhere in the name, not just at the end: Calamity numbers its
  // rockets ("Cluster Rocket I", "Rocket III"), so an end-anchored pattern
  // filed every rocket under Other
  ['Arrows', /\barrows?\b/i],
  ['Bullets', /\bbullets?\b|\bmusket ball\b|\brounds?\b/i],
  ['Rockets', /\brockets?\b|\bmissiles?\b|\bgrenades?\b/i],
  ['Darts', /\bdarts?\b/i],
  ['Bolts', /\bbolts?\b/i],
  ['Solutions', /\bsolutions?\b/i],
];

function groupAmmo(ammo: Item[]): { label: string; items: Item[] }[] {
  const rest = [...ammo];
  const out: { label: string; items: Item[] }[] = [];
  for (const [label, pattern] of AMMO_FAMILIES) {
    const hit = rest.filter((a) => pattern.test(a.name));
    if (!hit.length) continue;
    hit.forEach((a) => rest.splice(rest.indexOf(a), 1));
    out.push({ label, items: hit });
  }
  if (rest.length) out.push({ label: out.length ? 'Other' : '', items: rest });
  return out;
}

/* The Ammo panel groups by role - single-target, crowd-control, then a weapon's
   own special ammo - so a reader picks by what the fight needs. Ammo the data
   has not tagged yet keeps the family order (arrows, bullets, …) in one last
   unlabelled group, so untagged phases read as they did before. */
const AMMO_ROLES: [NonNullable<Item['ammoRole']>, string][] = [
  ['single-target', 'Single Target'],
  ['crowd-control', 'Crowd Control'],
  ['special', 'Special'],
];
function groupAmmoByRole(ammo: Item[]): { label: string; items: Item[] }[] {
  const rest = [...ammo];
  const out: { label: string; items: Item[] }[] = [];
  for (const [role, label] of AMMO_ROLES) {
    const hit = rest.filter((a) => a.ammoRole === role);
    if (!hit.length) continue;
    hit.forEach((a) => rest.splice(rest.indexOf(a), 1));
    out.push({ label, items: hit });
  }
  if (rest.length) out.push({ label: '', items: groupAmmo(rest).flatMap((g) => g.items) });
  return out;
}

/* Most armour sets a phase shows. The guide names two or three class-specific
   sets plus an all-class one; past three the column reads as a list rather
   than a recommendation. */
const MAX_ARMOR_SHOWN = 3;


/* Set-bonus lines shown on an armour card before it defers to the modal. Three
   lines wrap to about six on a narrow card, which is as much as the card can
   carry without the armour list dominating the page. */
const ARMOR_EFFECT_LINES = 3;

/* ── Accessory equip cell ── */

/* Post-Moon Lord in Calamity, where the Celestial Onion becomes available. */
const CALAMITY_POST_ML = new Set<string>([
  'cal-pre-providence', 'cal-pre-polterghast', 'cal-pre-dog',
  'cal-pre-yharon', 'cal-pre-exo', 'cal-post-calamitas', 'cal-post-exo', 'cal-endgame',
]);

/* Hardmode, where the Wall of Flesh has dropped its bag and the Demon Heart is
   available. Calamity's own hardmode phases were missing, so the sixth slot
   never opened on that pack: the guide equips six from Pre-Mech Bosses and
   seven from Pre-Providence, and the site was stuck at five and then six. The
   post-Moon Lord phases are hardmode too, so they are folded in rather than
   listed twice. */
const HARDMODE_PHASES = new Set<PhaseId>([
  'pre-mech', 'pre-plantera', 'pre-golem', 'pre-cultist', 'pre-moonlord', 'endgame',
  'cal-pre-mech', 'cal-post-mech1', 'cal-post-mech2', 'cal-pre-plantera',
  'cal-pre-golem', 'cal-post-golem', 'cal-pre-lunar', 'cal-pre-ml',
  // Thorium hardmode phases (Post-Wall of Flesh and later).
  'thor-post-wof', 'thor-pre-mech', 'thor-post-mech', 'thor-pre-lunar',
  'thor-pre-primordials', 'thor-endgame',
  ...CALAMITY_POST_ML,
]);

/* Only the basic pre-Hardmode ores are true world variants: the pairs below
   differ in defense alone and carry no set bonus, so one row covers both.
   The Hardmode ores and the evil pairs are NOT interchangeable - Adamantite
   boosts damage and speed where Titanium raises a defensive shard barrier, and
   Shadow gives movement speed where Crimson gives life regen - so those stay as
   separate entries with their own explanations. */
const ARMOR_VARIANTS: [string, string][] = [
  ['Copper', 'Tin'], ['Iron', 'Lead'], ['Silver', 'Tungsten'], ['Gold', 'Platinum'],
];

const armorMaterial = (name: string) => name.replace(/\s*armor\b.*$/i, '').trim();
const tidyArmorName = (name: string) => name.replace(/\bArmor\b/, 'armor');

/**
 * @param mergeVariants pair the basic ores into one row. True for vanilla,
 *   where world generation gives you one ore of each pair and the two differ in
 *   defense alone. False for Calamity: every ore is obtainable there, and each
 *   set carries its own bonus - Gold grants coin drops and crit scaling where
 *   Platinum grants 10% damage reduction - so a shared row could only ever show
 *   one set's bonus while hiding the other's.
 */
function groupArmor(armor: Item[], mergeVariants: boolean): Item[] {
  const out: Item[] = [];
  const used = new Set<string>();
  for (const a of armor) {
    if (used.has(a.id)) continue;
    const mat = armorMaterial(a.name);
    const pair = mergeVariants
      ? ARMOR_VARIANTS.find((p) => p.some((v) => v.toLowerCase() === mat.toLowerCase()))
      : undefined;
    if (pair) {
      // ore/evil armor is one choice across two worlds - always show the pair name
      // ("Adamantite armor" → "Adamantite / Titanium armor"), even if the data lists
      // only one side. Dedupe the sibling if it's also present.
      const other = armor.find((x) => !used.has(x.id) && x.id !== a.id &&
        pair.some((v) => v.toLowerCase() === armorMaterial(x.name).toLowerCase()));
      if (other) used.add(other.id);
      used.add(a.id);
      out.push({ ...a, name: `${pair[0]} / ${pair[1]} armor` });
      continue;
    }
    used.add(a.id);
    out.push({ ...a, name: tidyArmorName(a.name) });
  }
  return out;
}

/* Calamity-added armor sets (everything else is treated as a vanilla set). Used to
   show exactly two options per stage: the best vanilla set and the best Calamity
   set. Extend as later-tier sets are added. */
const CALAMITY_ARMOR = new Set([
  'victide', 'aerospec', 'statigel', 'sulphurous', 'wulfrum', 'mollusk', 'desert prowler',
  'snow ruffian', 'brimflame', 'daedalus', 'titan heart', 'hydrothermic', 'plague reaper',
  'reaver', 'umbraphile', 'astral', 'lunic corps', 'lunic eye', 'bloodflare', 'god slayer',
  'silva', 'auric tesla', 'auric', 'prismatic', 'tarragon', 'empyrean', 'demonshade',
  'ataraxia', 'plaguebringer', 'fathom swarmer', 'omega blue', 'gem-tech', 'gem tech',
]);

const isCalamityArmor = (name: string) =>
  name.toLowerCase().split('/').some((part) => CALAMITY_ARMOR.has(part.replace(/armor.*/, '').trim()));

/* Show two armor options per stage: the best vanilla set and the best Calamity set
   (the list is already ordered best→good→other, so the first of each is the pick). */
function curateArmor(grouped: Item[]): Item[] {
  /* Everything the guide lists for this phase and class.
   *
   * This used to trim to one Calamity set plus one vanilla set, which hid sets
   * the guide explicitly recommends: Pre-Golem ranger lost Shroomite, and
   * Post-Golem lost Plague Reaper. The armour column is already a curated
   * shortlist - Calamity names two or three class-specific sets and one
   * all-class set - so trimming it again was second-guessing the source.
   *
   * Calamity's own sets lead, since playing the mod they are the point and the
   * vanilla set is the fallback.
   */
  /* Two class-specific sets and the all-class one.
   *
   * The guide splits its armour column under "Class-specific armor" and
   * "All-class armor", and that split is what the three slots should reflect.
   * Taking the first three in list order dropped the all-class set every time,
   * since it is always listed last - so the third class-specific set gives way
   * to it instead. */
  const ordered = [...grouped.filter((a) => isCalamityArmor(a.name)),
    ...grouped.filter((a) => !isCalamityArmor(a.name))];
  /* Counted by set, not by card. Shroomite is listed once per helmet -
     Headgear, Mask, Helmet - because choosing between them is the decision it
     asks for, but the three are one set and should cost one slot, not three. */
  const setOf = (a: Item) => a.name.replace(/\s*\([^)]*\)\s*$/, '');
  const pick = (list: Item[], limit: number) => {
    const keep: string[] = [];
    for (const a of list) {
      const key = setOf(a);
      if (!keep.includes(key)) {
        if (keep.length >= limit) continue;
        keep.push(key);
      }
    }
    return list.filter((a) => keep.includes(setOf(a)));
  };
  const specific = ordered.filter((a) => !a.allClass);
  const allClass = ordered.filter((a) => a.allClass);
  if (!allClass.length) return pick(specific, MAX_ARMOR_SHOWN);
  return [...pick(specific, MAX_ARMOR_SHOWN - 1), ...pick(allClass, 1)];
}

/* ── Accessory taxonomy ──
   Categories, quality tiers and markers follow the community accessory guide, so
   the labels and colours match what a reader will have seen there. */
const CATEGORY_LABEL: Record<string, string> = {
  mobility: 'Mobility', offense: 'Offensive', survivability: 'Defensive',
  'primary-mobility': 'Primary Mobility', 'extra-mobility': 'Extra Mobility',
  'all-around': 'All-Around',
  melee: 'Melee', ranged: 'Ranged', magic: 'Magic', summon: 'Summon',
  // Thorium's own accessory types, from the wiki's Accessories page.
  movement: 'Movement', 'health-mana': 'Health & Mana', combat: 'Combat',
  ring: 'Ring', shield: 'Shield', thrower: 'Thrower', healer: 'Healer',
  bard: 'Bard', vanity: 'Vanity', 'music-box': 'Music Box', misc: 'Misc',
};
/* The Thorium accessory types, as tag ids. Used to tell a Thorium type tag from
   the app's own category on an item that carries both. */
const THORIUM_ACC_TYPES = ['movement', 'health-mana', 'combat', 'ring', 'shield',
  'thrower', 'healer', 'bard', 'vanity', 'music-box', 'misc'] as const;
const THORIUM_ACC_TYPE_SET = new Set<string>(THORIUM_ACC_TYPES);
/** taxonomy damage-type -> our class id, so a class badge only shows on its own page */
const CATEGORY_CLASS: Record<string, string> = {
  melee: 'melee', ranged: 'ranger', magic: 'mage', summon: 'summoner',
};
const MARKER_LABEL: Record<string, string> = {
  expert: 'Expert', tank: 'Tank', corruption: 'Corruption', crimson: 'Crimson',
  whips: 'Whips', yoyos: 'Yoyos',
  tedious: 'Tedious', risky: 'Risky', 'crowd-control': 'Crowd control',
  support: 'Support', upgradeable: 'Upgradeable',
  'calamity-changed': 'Changed', pairs: 'Pair',
};
const MARKER_TITLE: Record<string, string> = {
  expert: 'Expert Mode and above only',
  tank: 'More effective in a tank build',
  corruption: 'Corruption worlds only',
  crimson: 'Crimson worlds only',
  whips: 'Only worth it if you use whips',
  yoyos: 'Only worth it if you use yoyos',
  tedious: 'Difficult or tedious to get at this stage',
  risky: 'Difficult or risky to use, and needs boss preparation',
  'crowd-control': 'Best for crowd control, such as events or worm bosses',
  support: 'Debuffs enemies or benefits the player, rather than dealing the damage itself',
  upgradeable: 'Variants and upgrades of this are also viable',
  'calamity-changed': 'Calamity changes how this works',
  pairs: 'Meant to be used together with another item',
};
/* The two packs tag accessories from different sources and the sets do not
   overlap, so each shows only its own key - a Calamity reader has no use for
   "Crimson worlds only" and a vanilla reader has none for "Changed". */
const PACK_MARKERS: Record<string, readonly string[]> = {
  vanilla: ['expert', 'tank', 'corruption', 'crimson', 'whips', 'yoyos'],
  calamity: ['tedious', 'risky', 'crowd-control', 'support', 'upgradeable',
    'calamity-changed', 'pairs'],
  // Expert Mode is the wiki's 12th accessory type; it rides as a marker since an
  // Expert accessory also belongs to one of the other eleven types.
  thorium: ['expert'],
};

/** Class-specific categories are noise on the other three classes' pages. */
function visibleCategories(item: Item, activeClass: string): string[] {
  return (item.categories ?? []).filter((c) => {
    const owner = CATEGORY_CLASS[c];
    return !owner || owner === activeClass;
  });
}

function AccCell({
  item, alts = [], demonHeart, activeClass, difficulty, onOpen,
}: {
  item: Item | null; alts?: Item[]; demonHeart?: boolean; activeClass: string;
  difficulty: DifficultyFilter; onOpen: (i: Item) => void;
}) {
  if (!item) {
    return (
      <div className={styles.accCell}>
        <div className={`${styles.accSlot} pixel-frame pixel-hollow ${styles.accEmpty} ${demonHeart ? styles.accDemon : ''}`}>
          <span className={styles.accSlotHint}>{demonHeart ? 'Demon Heart' : 'Open'}</span>
        </div>
      </div>
    );
  }
  const { local, wiki } = iconSrcs(item.icon, item.wikiUrl);
  const cats = visibleCategories(item, activeClass);
  const typeTag = item.tags?.find((t) => THORIUM_ACC_TYPE_SET.has(t));
  const markers = item.markers ?? [];
  const locked = !isObtainable(item, difficulty);
  /* The cell is the primary card plus, when the guide offers a swap, an "or" and
     a smaller card beneath it - both outside the primary's frame, so the pick
     itself stays one clean card.

     The card is a div rather than a button because the alternative is its own
     control and a button cannot contain one. The primary fills the card, so it
     still reads as a single hit target. */
  return (
    <div className={styles.accCell}>
    <div
      className={`${styles.accSlot} pixel-frame pixel-hollow ${demonHeart ? styles.accDemon : ''} ${locked ? styles.locked : ''}`}
      title={locked ? 'Not obtainable in a Classic world' : undefined}
    >
      <button type="button" className={styles.accMain} onClick={() => onOpen(item)}>
        <img
          src={local} alt="" aria-hidden="true"
          className={`${styles.accSlotImg} pixel-img`}
          width="28" height="28" loading="lazy"
          onError={makeErrorHandler(wiki, FALLBACK_ICON)}
        />
        <span className={styles.accSlotName}>{item.name}</span>
      </button>

      {(typeTag || cats.length > 0 || item.quality || markers.length > 0) && (
        <span className={styles.accTags}>
          {item.quality && (
            <span className={`${styles.accQuality} ${styles[`q_${item.quality}`]}`}>
              {item.quality}
            </span>
          )}
          {/* A Thorium item carries the wiki's own type (Shield, Ring, Thrower…)
              as a tag, with its own colour; otherwise show the app categories. */}
          {(typeTag ? [typeTag] : cats).map((c) => (
            <span key={c} className={`${styles.accCat} ${styles[`c_${c}`]}`}>
              {CATEGORY_LABEL[c] ?? c}
            </span>
          ))}
          {markers.map((m) => (
            <span key={m} className={styles.accMarker} title={MARKER_TITLE[m]}>
              {MARKER_LABEL[m]}
            </span>
          ))}
        </span>
      )}

    </div>

    {/* "Sandstorm in a Bottle / Fledgling Wings" in the guide is one slot with
        two interchangeable picks, so the alternative hangs off its primary
        rather than spending a slot of its own. It sits outside the primary's
        frame as a miniature of it - icon and name on one line - with "or"
        between, so the two read as the choice the guide is offering. */}
    {alts.map((alt) => {
      const altImg = iconSrcs(alt.icon, alt.wikiUrl);
      return (
        <Fragment key={alt.id}>
          <span className={styles.accOr}>or</span>
          <button
            type="button"
            className={`${styles.accAlt} pixel-frame pixel-hollow`}
            title={alt.name}
            onClick={() => onOpen(alt)}
          >
            <img
              src={altImg.local} alt="" aria-hidden="true"
              className={`${styles.accAltImg} pixel-img`}
              width="16" height="16" loading="lazy"
              onError={makeErrorHandler(altImg.wiki, FALLBACK_ICON)}
            />
            <span className={styles.accAltName}>{alt.name}</span>
          </button>
        </Fragment>
      );
    })}
    </div>
  );
}

/* ── One row in the "other options" pool ──
   Denser than a slot: the pool is a list to scan, not a build to read. Class
   categories carry no grade on the source page, so the badge is simply absent
   rather than defaulted to something the page never said. */
function PoolRow(
  { item, difficulty, onOpen }:
  { item: Item; difficulty: DifficultyFilter; onOpen: (i: Item) => void },
) {
  const { local, wiki } = iconSrcs(item.icon, item.wikiUrl);
  const markers = item.markers ?? [];
  const locked = !isObtainable(item, difficulty);
  return (
    <button
      type="button"
      className={`${styles.poolRow} ${locked ? styles.locked : ''}`}
      title={locked ? 'Not obtainable in a Classic world' : undefined}
      onClick={() => onOpen(item)}
    >
      <img
        src={local} alt="" aria-hidden="true"
        className={`${styles.poolImg} pixel-img`}
        width="24" height="24" loading="lazy"
        onError={makeErrorHandler(wiki, FALLBACK_ICON)}
      />
      {/* name and badges stack: an item with a grade and two world markers
          (Brain of Confusion is Expert + Crimson) has no room on one line and
          the name is what the reader is scanning for */}
      <span className={styles.poolBody}>
        <span className={styles.poolName}>{item.name}</span>
        {(item.quality || markers.length > 0) && (
          <span className={styles.poolTags}>
            {item.quality && (
              <span className={`${styles.accQuality} ${styles[`q_${item.quality}`]}`}>{item.quality}</span>
            )}
            {markers.map((m) => (
              <span key={m} className={styles.accMarker} title={MARKER_TITLE[m]}>{MARKER_LABEL[m]}</span>
            ))}
          </span>
        )}
      </span>
    </button>
  );
}

/** Key to the accessory tags, so the colours mean something on first read. */
function AccLegend({ packId, hasQuality }: { packId: string; hasQuality: boolean }) {
  const markers = PACK_MARKERS[packId] ?? [];
  /* Thorium tags accessories with the wiki's own 12 accessory types; every other
     pack uses the app's own accessory categories. */
  const cats: readonly string[] = packId === 'thorium'
    ? THORIUM_ACC_TYPES
    : ['primary-mobility', 'extra-mobility', 'all-around', 'offense', 'survivability'];
  return (
    <div className={styles.accLegend}>
      <span className={styles.accLegendLabel}>Tags</span>
      {cats.map((c) => (
        <span key={c} className={`${styles.accCat} ${styles[`c_${c}`]}`}>
          {CATEGORY_LABEL[c]}
        </span>
      ))}
      {/* Calamity's guide grades nothing, so the grade key would be three
          swatches a Calamity reader never sees on an item. */}
      {hasQuality && (
        <>
          <span className={styles.accLegendSep} aria-hidden="true" />
          {(['great', 'good', 'fine'] as const).map((q) => (
            <span key={q} className={`${styles.accQuality} ${styles[`q_${q}`]}`}>{q}</span>
          ))}
        </>
      )}
      {markers.length > 0 && (
        <>
          <span className={styles.accLegendSep} aria-hidden="true" />
          {markers.map((m) => (
            <span key={m} className={styles.accMarker} title={MARKER_TITLE[m]}>
              {MARKER_LABEL[m]}
            </span>
          ))}
        </>
      )}
      <span className={styles.accLegendNote}>
        class tags show on that class only
      </span>
    </div>
  );
}

/* ── Accessory reforges ──
   Calamity is not vanilla here: it adds four modifiers of its own and retunes
   several existing ones, so showing vanilla's four on a Calamity loadout would
   be wrong rather than merely incomplete. Two of the new ones belong to a
   single class and are gated the same way the class tags are. */
interface Reforge { name: string; stat: string; note: string; onlyClass?: string }
interface ReforgeSet { intro: string; list: Reforge[]; href: string; label: string }

/* Keyed by pack id. Typed with an explicit `vanilla` key rather than a bare
   Record, so the fallback below is a value the compiler knows exists:
   noUncheckedIndexedAccess makes every Record lookup possibly-undefined, which
   `?? REFORGES.vanilla` does not resolve when that is also an index lookup. */
const REFORGES: { vanilla: ReforgeSet } & Record<string, ReforgeSet> = {
  vanilla: {
    intro: 'Reforge at the Goblin Tinkerer. Warding is the default. Swap to Menacing or Lucky once you can dodge reliably.',
    list: [
      { name: 'Warding', stat: '+4 defense', note: 'survive more hits, best on most builds' },
      { name: 'Menacing', stat: '+4% damage', note: 'most damage' },
      { name: 'Lucky', stat: '+4% crit', note: 'better the higher your base damage' },
      { name: 'Quick', stat: '+4% move speed', note: 'player movement only, try to avoid using' },
    ],
    href: 'https://terraria.wiki.gg/wiki/Modifiers#Menacing,_Lucky,_and_Warding',
    label: 'Menacing vs Lucky vs Warding on the wiki',
  },
  calamity: {
    intro: 'Reforge at the Goblin Tinkerer. Warding is still the default, but Calamity adds four modifiers of its own and retunes several vanilla ones - Hard drops its defense for 3% damage reduction, and Guarding, Armored and Brisk all gain a second bonus.',
    list: [
      { name: 'Warding', stat: '+4 defense', note: 'survive more hits, best on most builds' },
      { name: 'Menacing', stat: '+4% damage', note: 'most damage' },
      { name: 'Lucky', stat: '+4% crit, +0.05 luck', note: 'better the higher your base damage' },
      { name: 'Quick', stat: '+4% move speed', note: 'player movement only, try to avoid using' },
      { name: 'Silent', stat: '+8% stealth regen', note: 'Calamity only, and only useful to rogue', onlyClass: 'rogue' },
      { name: 'Friendly', stat: '+1 minion', note: 'Calamity only, and only useful to summoner', onlyClass: 'summoner' },
      { name: 'Dauntless', stat: '+20 max life', note: 'Calamity only' },
      { name: 'Invigorating', stat: '+0.25 HP/s regen', note: 'Calamity only' },
    ],
    href: 'https://calamitymod.wiki.gg/wiki/Modifiers',
    label: 'Calamity modifier table on the wiki',
  },
  thorium: {
    intro: 'Reforge at the Goblin Tinkerer. Warding is the default. Thorium adds two accessory modifiers on top of vanilla\'s - Lucrative for coins, and Engrossing for bard empowerments.',
    list: [
      { name: 'Warding', stat: '+4 defense', note: 'survive more hits, best on most builds' },
      { name: 'Menacing', stat: '+4% damage', note: 'most damage' },
      { name: 'Lucky', stat: '+4% crit', note: 'better the higher your base damage' },
      { name: 'Quick', stat: '+4% move speed', note: 'player movement only, try to avoid using' },
      { name: 'Lucrative', stat: '+15% coin drops', note: 'Thorium only, farming utility' },
      { name: 'Engrossing', stat: '+2s empowerment', note: 'Thorium only, only useful to bard', onlyClass: 'bard' },
    ],
    href: 'https://thoriummod.wiki.gg/wiki/Modifiers',
    label: 'Thorium modifier table on the wiki',
  },
};

/* ── Weapon reforges ──
   Vanilla weapon modifiers are broad and well-known, so they are not spelled out
   here. Thorium adds a whole symphonic set, though, which the Goblin Tinkerer only
   offers on symphonic weapons - bard weapons in Thorium. Healer weapons are radiant,
   not symphonic, so this shows for bard alone. */
interface WeaponReforgeSet { title: string; classes: string[]; intro: string; list: Reforge[]; href: string; label: string }
const WEAPON_REFORGES: Record<string, WeaponReforgeSet[]> = {
  thorium: [
    {
      title: 'Symphonic weapon reforges',
      classes: ['bard'],
      intro: 'Reforge symphonic weapons at the Goblin Tinkerer. Fabled is the best - it raises every stat at once.',
      list: [
        { name: 'Fabled', stat: '+15% dmg · +10% speed · +5% crit', note: 'best overall' },
        { name: 'Melodic', stat: '+10% dmg · +5% speed · +2% crit', note: 'strong all-round alternative' },
        { name: 'Loud', stat: '+10% dmg · +3% crit', note: 'simple damage boost' },
      ],
      href: 'https://thoriummod.wiki.gg/wiki/Modifiers',
      label: 'All 12 symphonic modifiers on the wiki',
    },
  ],
};

function ReforgeBlock({ packId, activeClass }: { packId: string; activeClass: string }) {
  const pack = REFORGES[packId] ?? REFORGES.vanilla;
  const list = pack.list.filter((r) => !r.onlyClass || r.onlyClass === activeClass);
  return (
    <div className={styles.reforgeBlock}>
      <div className={styles.reforgeLabel}>Accessory reforges</div>
      <p className={styles.reforgeIntro}>{pack.intro}</p>
      <ul className={styles.reforgeList}>
        {list.map((r) => (
          <li key={r.name}><b>{r.name}</b> <span>{r.stat}</span> {r.note}</li>
        ))}
      </ul>
      <p className={styles.reforgeMore}>
        <a href={pack.href} rel="noopener noreferrer" target="_blank">{pack.label}</a>
      </p>
    </div>
  );
}

/* Weapon-reforge blocks that apply only to the active class (symphonic → bard). */
function WeaponReforgeBlocks({ packId, activeClass }: { packId: string; activeClass: string }) {
  const sets = (WEAPON_REFORGES[packId] ?? []).filter((s) => s.classes.includes(activeClass));
  if (sets.length === 0) return null;
  return (
    <>
      {sets.map((set) => (
        <div key={set.title} className={styles.reforgeBlock}>
          <div className={styles.reforgeLabel}>{set.title}</div>
          <p className={styles.reforgeIntro}>{set.intro}</p>
          <ul className={styles.reforgeList}>
            {set.list.map((r) => (
              <li key={r.name}><b>{r.name}</b> <span>{r.stat}</span> {r.note}</li>
            ))}
          </ul>
          <p className={styles.reforgeMore}>
            <a href={set.href} rel="noopener noreferrer" target="_blank">{set.label}</a>
          </p>
        </div>
      ))}
    </>
  );
}

/* ── Buff / consumable card (same shape as an accessory slot) ── */
function BuffCell(
  { item, difficulty, onOpen }:
  { item: Item; difficulty: DifficultyFilter; onOpen: (i: Item) => void },
) {
  const { local, wiki } = iconSrcs(item.icon, item.wikiUrl);
  const locked = !isObtainable(item, difficulty);
  return (
    <button
      type="button"
      className={`${styles.buffCell} pixel-frame pixel-hollow ${locked ? styles.locked : ''}`}
      title={locked ? 'Not obtainable in a Classic world' : undefined}
      onClick={() => onOpen(item)}
    >
      <img
        src={local} alt="" aria-hidden="true"
        className={`${styles.buffCellImg} pixel-img`}
        width="28" height="28" loading="lazy"
        onError={makeErrorHandler(wiki, FALLBACK_ICON)}
      />
      <span className={styles.buffCellName}>{item.name}</span>
    </button>
  );
}

/* Remember the phase across navigation: the page unmounts when you leave it, so
   without this the chosen phase resets to pre-bosses every time you come back.
   Kept in localStorage the same way the pack and class are. A stored phase that
   the active pack does not have falls back to that pack's first phase (see
   `validPhaseId` below). */
const PHASE_STORAGE_KEY = 'tc:loadout-phase';
const readStoredPhase = (): PhaseId => {
  try { return (window.localStorage.getItem(PHASE_STORAGE_KEY) as PhaseId) || 'pre-bosses'; }
  catch { return 'pre-bosses'; }
};

export function Loadouts() {
  const { difficulty, setDifficulty, classId, progressionMode, progress, setProgress } = useAppState();
  const { id: packId, classes, phases, loadouts, bosses } = usePack();
  const [phaseId, setPhaseId] = useState<PhaseId>(readStoredPhase);
  useEffect(() => {
    try { window.localStorage.setItem(PHASE_STORAGE_KEY, phaseId); } catch { /* storage disabled */ }
  }, [phaseId]);
  const [modalItem, setModalItem] = useState<Item | null>(null);
  const [showRest, setShowRest] = useState(false);
  const [showPool, setShowPool] = useState(false);

  // Progression Mode ties the Loadouts phases to the boss roadmap: the reached
  // boss (or the first, before any progress) sits in some phase, and every phase
  // past it is locked - you can only open gear for tiers you have progressed to.
  const reachedBoss = progress ? bosses.find((b) => b.id === progress) : undefined;
  const reachedPhase = reachedBoss ? phases.find((p) => p.id === reachedBoss.stage) : undefined;
  const reachedPhaseOrder = reachedPhase ? reachedPhase.order : Math.min(...phases.map((p) => p.order));
  // Phase gating mirrors the boss roadmap: the phase after the reached one is the
  // clickable "next" (advancing progression), and anything past that is locked.
  const phaseState = (order: number): 'open' | 'next' | 'locked' => {
    if (!progressionMode || order <= reachedPhaseOrder) return 'open';
    return order === reachedPhaseOrder + 1 ? 'next' : 'locked';
  };
  // The first boss of a phase in roadmap order (optional/side bosses lead), used
  // to advance progression when the reader clicks the next phase here.
  const firstBossOfPhase = (pid: string) => {
    const inStage = bosses.filter((b) => b.stage === pid).sort((a, b) => a.tier - b.tier);
    return (inStage.find((b) => b.side) ?? inStage[0])?.id;
  };

  // classId lives in app-context (header selector); it is already clamped to the
  // active pack there, so no local clamp is needed. A phase selection past the
  // reached tier snaps back to the furthest unlocked phase.
  const validPhaseId = phases.some((p) => p.id === phaseId) ? phaseId : (phases[0]?.id ?? phaseId);
  const validOrder = phases.find((p) => p.id === validPhaseId)?.order ?? 0;
  const activePhaseId = (progressionMode && validOrder > reachedPhaseOrder)
    ? (phases.filter((p) => p.order <= reachedPhaseOrder).sort((a, b) => b.order - a.order)[0]?.id ?? validPhaseId)
    : validPhaseId;
  const activeClassId = classId;

  // Backdrop + phase-bar boss icon per phase. Vanilla uses fixed maps; other
  // packs fall back to a generic backdrop and a representative boss from the data.
  const phaseBiome = (pid: string) => (pid in PHASE_BIOME ? PHASE_BIOME[pid] : 'forest');
  const phaseBossIcon = (pid: string) =>
    pid in PHASE_BOSS
      ? PHASE_BOSS[pid]
      : (bosses.find((b) => b.stage === pid && !b.side)?.id ?? bosses.find((b) => b.stage === pid)?.id ?? '');
  /* A pack can ship its own phase art. Calamity's comes from the icons its
     guide puts beside each phase heading, so the timeline shows Cryogen and
     the Devourer of Gods rather than borrowing vanilla's boss sprites. */
  const phaseIconSrc = (pid: string) => {
    const def = phases.find((p) => p.id === pid);
    return def?.bossIcon
      ? `${BASE}icons/phases/${def.bossIcon}.png`
      : `${BASE}icons/bosses/${phaseBossIcon(pid)}-map.png`;
  };
  /* The banner shows the representative boss's full in-game art (animated gif
     where one exists) for every pack - the same split the Bosses page makes
     between its small roadmap map markers and its blown-up detail card. The
     waypoints keep the map marker (phaseIconSrc); only the banner uses this. */
  const phaseBannerSrc = (pid: string) => {
    // An explicit representative boss (vanilla gate bosses + the matched Calamity
    // phases) shows that boss's full sprite/gif.
    if (pid in PHASE_BOSS) {
      const bid = PHASE_BOSS[pid]!;
      const boss = bosses.find((b) => b.id === bid);
      return `${BASE}icons/bosses/${bid}.${boss?.animated ? 'gif' : 'png'}`;
    }
    // A Calamity phase with curated art but no single boss (the endgame compass,
    // the post-Golem crystal) shows the same art its waypoint uses.
    const def = phases.find((p) => p.id === pid);
    if (def?.bossIcon) return `${BASE}icons/phases/${def.bossIcon}.png`;
    // Otherwise fall back to the phase's representative boss sprite.
    const bid = phaseBossIcon(pid);
    const boss = bosses.find((b) => b.id === bid);
    return `${BASE}icons/bosses/${bid}.${boss?.animated ? 'gif' : 'png'}`;
  };

  const loadout = loadouts.find((l) => l.phase === activePhaseId && l.class === activeClassId);
  const classDef = classes.find((c) => c.id === activeClassId)!;
  const phaseDef = phases.find((p) => p.id === activePhaseId);
  const phaseName = phaseDef?.name ?? '';
  const activeOrder = phaseDef?.order ?? 0;

  const safeLoadout = loadout ?? { phase: activePhaseId, class: activeClassId, weapons: [], tools: [], armor: [], accessories: [], buffs: [], ammo: [], accessoryPool: [] };

  const { clearSubclassFilters, selectedSubclassSet, toggleSubclass } =
    useSubclassFilters(activeClassId);

  // Only offer subclasses that actually have a weapon this phase - e.g. there are
  // no Launchers before Hardmode. A stored subclass that isn't available here (or
  // no longer exists at all) falls back to "Overview" rather than showing an empty list.
  /* The wiki types most weapons but not all - it calls a dozen Calamity items
     simply "a rogue weapon" with no family. Those match no chip, so without
     this they appear in no filtered view at all and look missing. An "Other"
     chip is added when the phase has any, which is honest about the wiki
     having no category rather than inventing one for them. */
  const OTHER_SUB = 'other';
  const hasUntyped = safeLoadout.weapons.some((w) => !w.subclass);
  const availableSubclasses = classDef.subclasses.filter((s) =>
    safeLoadout.weapons.some((w) => w.subclass === s.id),
  );
  if (hasUntyped && availableSubclasses.length > 0
      && !availableSubclasses.some((s) => s.id === OTHER_SUB)) {
    availableSubclasses.push({
      id: OTHER_SUB, name: 'Other',
      description: 'Weapons the wiki does not place in a family.',
    });
  }
  const hasSubclasses = availableSubclasses.length > 0;
  const validSubclasses = new Set(availableSubclasses.map((s) => s.id));
  const activeSubclasses = new Set(
    [...selectedSubclassSet].filter((s) => validSubclasses.has(s)),
  );
  // With no subclasses (e.g. Calamity classes) there are no filter chips, so show
  // the full best/good/other split rather than only best-in-slot.
  const showingAll = hasSubclasses && activeSubclasses.size === 0;
  /* The overview - Top Picks, or a pack with no subclass chips at all - is the
     only view that gets a "Support Items" row. Inside a subclass, a support
     weapon ranks with its family instead, so it is pulled out of the ranked
     rows here and shown in that row on its own. */
  const inOverview = !hasSubclasses || showingAll;

  /* An uncategorised weapon belongs to no chip, so it appears only when no chip
     is active. It used to pass every filter, which put items like the Rod of
     Discord under Daggers, Bombs and Javelins at once. */
  const matchSub = (w: Item) =>
    !hasSubclasses || showingAll
    || (w.subclass ? activeSubclasses.has(w.subclass) : activeSubclasses.has(OTHER_SUB));

  /* Read in the same order as the toggles above: a summoner's toggles run
     Minions, Whips, Sentries, so its picks should too. Anything without a
     subclass sorts last rather than interleaving. */
  const subOrder = new Map(classDef.subclasses.map((sc, i) => [sc.id, i]));
  const bySubclass = (a: Item, b: Item) =>
    (subOrder.get(a.subclass ?? '') ?? Infinity) - (subOrder.get(b.subclass ?? '') ?? Infinity);
  const inScope = safeLoadout.weapons
    .filter((w) => matchSub(w) && !(inOverview && w.support))
    .sort(bySubclass);
  /* Support items (the guide's "Support" column) plus classless tools share the
     one row, shown only in the overview. */
  const supportRow = inOverview
    ? [...safeLoadout.tools, ...safeLoadout.weapons.filter((w) => w.support)]
    : [];

  /*
   * Whether this loadout was actually ranked. Curated entries carry a `why`
   * explaining the pick; the endgame Calamity loadouts were scraped from the
   * wiki's class-setup tables, where `tier` only records the row's position in
   * that table. Calling the first row "Recommended" would assert a judgement
   * nothing made, so those are presented as an unranked list instead.
   */
  /* Vanilla's loadouts are hand-curated, so "Recommended" and "Also Great"
     mean something there. Calamity's come from the guide's class-setup
     columns, where order is layout, not judgement - and `why` survives on
     some entries and not others, so this flipped between phases: Pre-Skeletron
     read "Options" and Pre-Mech "Recommended" for no reason a reader could
     see. One unranked list across every Calamity phase instead. */
  const ranked = packId !== 'calamity' && safeLoadout.weapons.some((w) => w.why);

  // "Overview" shows one pick per subclass rather than every weapon, which is
  // why it is not called "All". Picking a
  // subclass opens it up to the viable alternates, with the rest behind a toggle.
  /* Top Picks is exactly the best-tier picks the guide marks "Best" - no
     top-up. Padding it to a minimum count pulled Recommended weapons into the
     shortlist and made them read as Top Picks, which the curated split does not
     intend. A phase with two Best picks shows two. */
  const bestTier = inScope.filter((w) => w.tier === 'best');
  const filteredBest = bestTier;
  /* Drilled into one subclass, the featured "Best" row is every best-tier
     weapon in that family - the video guide's Best picks - not just one. A
     family the video showed nothing for has no best-tier pick: it is filled
     from the video's Recommended row, or from the wiki's class-setup table when
     the video is silent too. Those good-tier weapons then become the primary
     row, with no "Other Options" to append above the fold. Falls back to the
     first entry for a family that somehow ranks nothing, and unranked packs
     (see `ranked`) keep their own position order via `unrankedShown`. */
  const scopedBestTier = inScope.filter((w) => w.tier === 'best');
  const scopedGoodTier = inScope.filter((w) => w.tier === 'good');
  const hasBest = scopedBestTier.length > 0;
  /* In a video-silent family (no best-tier pick) the good weapons are co-equal
     Best picks - the Adamantite Glaive and Titanium Trident both lead the Spears
     row - unless one is flagged `secondary`, which drops it to Other Options
     (Cascade under Hive-Five). A real best-tier row keeps every good pick as an
     Other Option beneath it. */
  const goodPrimary = scopedGoodTier.filter((w) => !w.secondary);
  const goodSecondary = scopedGoodTier.filter((w) => w.secondary);
  const scopedBest = showingAll
    ? filteredBest
    : hasBest
      ? scopedBestTier
      : goodPrimary.length > 0
        ? goodPrimary
        : inScope.slice(0, 1);
  /* Low-tier 'other' reference weapons - ~60 starter swords in a family like
     pre-boss melee - stay out of the drilled view entirely. */
  const filteredAlso = showingAll ? [] : hasBest ? scopedGoodTier : goodSecondary;
  const filteredRest: Item[] = [];

  // Unranked (Calamity): the guide's own order, with no tier read as a pick.
  const unrankedShown = showingAll ? filteredBest : inScope.slice(0, 3);
  const unrankedRest = showingAll ? [] : inScope.slice(3);

  const groupedArmor = curateArmor(groupArmor(safeLoadout.armor, packId === 'vanilla'));
  const armorSprite = groupedArmor[0]?.icon;
  const armorImg = armorSprite ? iconSrcs(armorSprite) : null;

  /* Five slots, plus the two the game hands out.
   *
   * Demon Heart: Wall of Flesh treasure bag, so hardmode onward - and bags are
   * Expert-and-above, in Calamity too. Its own Treasure Bag page is headed
   * "Expert Mode-Only Content", and no config option changes that.
   *
   * Celestial Onion: Calamity's, dropped by the Moon Lord. Not Expert-gated the
   * way the Demon Heart is - in Classic, where the Demon Heart cannot be had,
   * the Onion grants the sixth slot instead of the seventh. It does nothing in
   * Master, which this filter does not model.
   *
   * So Expert runs 5 -> 6 at hardmode -> 7 post-Moon Lord, which is what the
   * class guides equip, and Classic runs 5 -> 6 post-Moon Lord.
   */
  const demonHeartUnlocked = HARDMODE_PHASES.has(activePhaseId) && difficulty === 'expert';
  const onionUnlocked = packId === 'calamity' && CALAMITY_POST_ML.has(activePhaseId);
  const slotCount = 5 + (demonHeartUnlocked ? 1 : 0) + (onionUnlocked ? 1 : 0);

  /*
   * In Classic, an Expert-only pick is not a recommendation - it is a slot the
   * player cannot fill. Rather than show it greyed, drop it and promote the
   * next best option from the same category in the pool, falling back to any
   * category once that runs out. Ranked great -> good -> fine, which is the
   * sandbox's own grading, so the replacement is the next best thing and not
   * merely the next thing.
   */
  /* An alternative never competes for a slot - it belongs to the pick it is an
     alternative to, and is rendered under it. Held out here so every downstream
     step (substitution, ordering, the slot cap) sees only real slot holders. */
  const altsBy = new Map<string, Item[]>();
  for (const a of safeLoadout.accessories) {
    if (!a.altOf) continue;
    altsBy.set(a.altOf, [...(altsBy.get(a.altOf) ?? []), a]);
  }
  const slotHolders = safeLoadout.accessories.filter((a) => !a.altOf);

  /* An unobtainable pick is not a recommendation - it is a slot the world cannot
     fill - so it is replaced rather than shown greyed. Two things this gets
     right that appending replacements did not:
       - the slot keeps its position, so the guide's order survives a swap
       - the guide's own alternative for that slot is tried first, which is a far
         better answer than the next pool entry: the pair is there precisely
         because either fills the slot
     Only then does it fall back to the pool, preferring the same category so a
     defensive slot is replaced by something defensive. */
  const substitutions: { original: Item; replacement: Item | null; reason: 'swap' | 'expert' | 'slot' }[] = [];
  /* Slot-only extras (Master Ninja Gear, recommended for the Expert sixth slot)
     are obtainable in Classic but have no slot to sit in, so they drop out when
     the world has fewer than six slots - noted apart from Expert-only content. */
  const slotFitHolders = slotHolders.filter((h) => {
    if (h.slotExtra && slotCount < 6) {
      substitutions.push({ original: h, replacement: null, reason: 'slot' });
      return false;
    }
    return true;
  });
  const accessories = ((): Item[] => {
    if (slotFitHolders.every((a) => isObtainable(a, difficulty))) return slotFitHolders;
    const rank = (q?: string) => (q === 'great' ? 0 : q === 'good' ? 1 : 2);
    /* Boots, wings and balloons do not stack - a build wants one of each at
       most - so a substitute must not double up a family already equipped.
       Replacing an Expert-only Shield of Cthulhu next to Terraspark Boots and
       Fairy Wings should reach for a Panic Necklace or Magiluminescence, not a
       second pair of wings. Anything outside these families (emblems, bands,
       necklaces) returns null and is never treated as a duplicate. */
    const family = (name: string): string | null => {
      if (/\bboots\b|\btreads\b/i.test(name)) return 'boots';
      // flight is not always spelled "Wings": Jetpack, Hoverboard and the
      // Celestial Starboard are wing substitutes and stack with none of them.
      if (/\bwings\b|starboard|jetpack|hoverboard/i.test(name)) return 'flight';
      // Bottles (extra jump) and balloons (jump height) are separate families -
      // Cloud in a Bottle and a Shiny Red Balloon stack, and the guide equips
      // both, so only balloon-vs-balloon or bottle-vs-bottle is a true duplicate.
      if (/balloon/i.test(name)) return 'balloon';
      if (/\bbottle\b/i.test(name)) return 'bottle';
      return null;
    };
    /* Seeded with the alternatives too, not just the holders: an alternative is
       already on screen under its pick, so promoting it into another slot showed
       the same accessory twice - Fledgling Wings sat under the balloon and again
       where the Shield of Cthulhu had been. Only alternatives of an *obtainable*
       holder count as taken though: an alt whose holder is itself unobtainable is
       not on screen, so it is free to fill that holder's slot (Fire Gauntlet is
       the Shield of Cthulhu's alt, and steps in for it in a Classic world). */
    const taken = new Set([
      ...slotFitHolders.filter((a) => isObtainable(a, difficulty)).map((a) => a.name),
      ...slotFitHolders.filter((a) => isObtainable(a, difficulty))
        .flatMap((a) => altsBy.get(a.name) ?? [])
        .filter((a) => isObtainable(a, difficulty)).map((a) => a.name),
    ]);
    /* Families already covered, seeded from every obtainable holder up front -
       not just the ones processed so far - so a wing substituted for slot 3 still
       sees the wings the guide equips in slot 6. */
    const covered = new Set(
      slotFitHolders.filter((a) => isObtainable(a, difficulty))
        .map((a) => family(a.name)).filter(Boolean) as string[],
    );
    /* When the obtainable holders already fill every slot, an Expert-only holder
       is a genuine extra (Master/Expert has more slots than Classic), so it is
       dropped rather than swapped for a pool pick - that is what keeps both the
       Shield of Cthulhu and its slotmate Fire Gauntlet as their own slots in an
       Expert world, while a Classic world simply loses the Shield. The reader is
       still told via the note below. */
    const haveEnough = slotFitHolders.filter((a) => isObtainable(a, difficulty)).length >= slotCount;
    const out: Item[] = [];
    for (const holder of slotFitHolders) {
      if (isObtainable(holder, difficulty)) { out.push(holder); continue; }
      if (haveEnough) { substitutions.push({ original: holder, replacement: null, reason: 'expert' }); continue; }

      const ownAlt = (altsBy.get(holder.name) ?? [])
        .find((a) => isObtainable(a, difficulty) && !taken.has(a.name));
      const wanted = new Set(holder.categories ?? []);
      const pick = ownAlt ?? safeLoadout.accessoryPool
        .flatMap((g) => g.items)
        .filter((it) => !taken.has(it.name) && !it.isGroup && !it.tedious
          && isObtainable(it, difficulty))
        .sort((a, b) => {
          /* Movement families are the wrong answer when the build already has
             its boots, wings and jump: the reader wanted their Expert pick, not
             a third movement item. So a utility or survivability accessory (a
             Panic Necklace, Band of Regeneration, Magiluminescence) always beats
             a spare movement item, and a movement item that *duplicates* a family
             already worn is worse still. Non-movement items score 0, a fresh
             movement family 1, a duplicate one 2. */
          const cost = (name: string) => {
            const f = family(name);
            if (!f) return 0;
            return covered.has(f) ? 2 : 1;
          };
          const am = (a.categories ?? []).some((c) => wanted.has(c)) ? 0 : 1;
          const bm = (b.categories ?? []).some((c) => wanted.has(c)) ? 0 : 1;
          return cost(a.name) - cost(b.name) || am - bm || rank(a.quality) - rank(b.quality);
        })[0];
      if (!pick) continue;
      taken.add(pick.name);
      const pf = family(pick.name);
      if (pf) covered.add(pf);
      substitutions.push({ original: holder, replacement: pick, reason: 'swap' });
      out.push(pick);
    }
    return out;
  })();

  /* Fixed reading order for the slots: mobility, survivability, offense, then
     the class's own. An accessory in two categories takes the earliest one, so
     the Celestial Shell (offense + survivability) sits with survivability. */
  const CAT_ORDER = ['primary-mobility', 'mobility', 'extra-mobility',
    'all-around', 'survivability', 'offense'] as const;
  const catRank = (it: Item) => {
    const cats = it.categories ?? [];
    const generic = CAT_ORDER.findIndex((c) => (cats as readonly string[]).includes(c));
    if (generic >= 0) return generic;
    return cats.length > 0 ? CAT_ORDER.length : CAT_ORDER.length + 1;
  };
  /* Calamity's loadouts are transcribed from the class guides, which order the
     five deliberately - boots, then the flight slot, then offence, then defence -
     so re-sorting them by category threw that away and put wings above boots.
     Vanilla's are not ordered that way, so they keep the category sort. */
  const ordered = packId === 'calamity'
    ? accessories
    : [...accessories].sort((a, b) => catRank(a) - catRank(b));
  /* Guarantee a mobility pick in the slots. Sorting by category puts mobility
     first, but a loadout listing more accessories than it has slots can still
     push it past the last one - and a build with no movement accessory reads
     as advice, not an oversight. If none made the cut, pull the best mobility
     option from the pool into the final slot. */
  /* At most one primary-mobility item. The guide lists every primary-mobility
     option together - Betsy's Wings, Empress Wings and Fishron Wings are three
     ways to fill one slot, not three slots - so taking them in order equipped
     three pairs of wings at Pre-Moon Lord and four movement items at
     Pre-Polterghast. Everything else is left in order. */
  const PRIMARY = 'primary-mobility';
  const shown: Item[] = [];
  let primaryUsed = false;
  for (const a of ordered) {
    if (shown.length >= slotCount) break;
    const isPrimary = (a.categories ?? []).includes(PRIMARY);
    if (isPrimary && primaryUsed) continue;
    if (isPrimary) primaryUsed = true;
    shown.push(a);
  }
  const MOVEMENT = ['mobility', PRIMARY, 'extra-mobility'];
  if (!shown.some((a) => (a.categories ?? []).some((c) => MOVEMENT.includes(c)))) {
    const names = new Set(shown.map((a) => a.name));
    const mob = [...accessories, ...safeLoadout.accessoryPool.flatMap((g) => g.items)]
      .find((it) => (it.categories ?? []).some((c) => MOVEMENT.includes(c))
        && !names.has(it.name) && !it.isGroup && isObtainable(it, difficulty));
    if (mob) shown.splice(Math.max(0, slotCount - 1), 1, mob);
  }
  const accSlots = Array.from({ length: slotCount }, (_, i) => shown[i] ?? null);

  /* This is the only place that knows the final equipped list - it includes
     whatever the Classic substitution promoted into a slot a moment ago - so
     the pool is de-duplicated here rather than in the data. Calamity's pool is
     written unfiltered for exactly that reason.

     Deliberately keyed on the slots rather than on `accessories`: a loadout can
     list more accessories than there are slots (Calamity's Pre-Boss rogue lists
     twelve), and those past the last slot are not rendered. Excluding the whole
     list dropped them from "other options" as well, so they appeared nowhere at
     all - which is why the button read "(1)" on a phase the guide gives a dozen
     picks for. */
  /* An alternative shown under its slot counts as equipped for this purpose -
     it is already on screen, so repeating it under "other options" would list
     the same pick twice. */
  const equippedNames = new Set(accSlots.filter(Boolean).flatMap(
    (a) => [a!.name, ...(altsBy.get(a!.name) ?? []).map((x) => x.name)],
  ));
  const accessoryPool = safeLoadout.accessoryPool
    .map((g) => ({ ...g, items: g.items.filter((it) => !equippedNames.has(it.name)) }))
    .filter((g) => g.items.length > 0);
  const poolHasQuality = safeLoadout.accessoryPool
    .some((g) => g.items.some((it) => it.quality))
    || accessories.some((a) => a.quality);


  return (
    <div className={styles.page}>
      <div
        className={styles.backdrop}
        style={{ backgroundImage: `url(${BASE}biomes/${phaseBiome(activePhaseId)}.png)` }}
        aria-hidden="true"
      />
      <div className={styles.backdropWash} aria-hidden="true" />

      <Header variant="photo" />
      <section className={styles.wrap}>

        {/* Boss progression map */}
        <div
          className={styles.bossmap}
          style={{ '--wp-count': phases.length } as React.CSSProperties}
          role="group"
          aria-label="Select phase"
        >
          {phases.map((p, i) => {
            const done = p.order < activeOrder;
            const active = p.id === activePhaseId;
            const state = phaseState(p.order);   // 'open' | 'next' | 'locked'
            const hasLock = state !== 'open';
            return (
              <button
                key={p.id}
                type="button"
                className={`${styles.waypoint} ${active ? styles.on : ''} ${done ? styles.done : ''} ${
                  state === 'locked' ? styles.wpLocked : state === 'next' ? styles.wpNext : ''
                }`}
                aria-pressed={active}
                aria-label={hasLock ? `${p.name} - ${state === 'next' ? 'click to unlock' : 'locked'}` : p.name}
                disabled={state === 'locked'}
                title={
                  state === 'next' ? `${p.name} - click to unlock`
                  : state === 'locked' ? `${p.name} - locked (progress further in the boss roadmap)`
                  : undefined
                }
                onClick={() => {
                  if (state === 'locked') return;
                  if (state === 'next') { const b = firstBossOfPhase(p.id); if (b) setProgress(b); }
                  setPhaseId(p.id as PhaseId); setShowRest(false);
                }}
              >
                {i > 0 && <span className={`${styles.vein} ${p.order <= activeOrder ? styles.veinFill : ''}`} aria-hidden="true" />}
                <span className={`${styles.wpDisc} pixel-frame pixel-circle`}>
                  <img
                    src={phaseIconSrc(p.id)}
                    alt="" aria-hidden="true"
                    className={`${styles.wpIcon} pixel-img`}
                    width="30" height="30" loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src.includes('-map.png')) img.src = img.src.replace('-map.png', '.png');
                      else img.src = FALLBACK_ICON;
                    }}
                  />
                  {hasLock && (
                    <span className={styles.wpLock} aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="14" height="14">
                        <path fill="currentColor" d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm3 8H9V6a3 3 0 0 1 6 0z" />
                      </svg>
                    </span>
                  )}
                </span>
                <span className={styles.wpName}>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Boss banner (re-mounts per phase to replay the slide-in) */}
        <div key={activePhaseId} className={`${styles.banner} pixel-frame`}>
          <img
            src={phaseBannerSrc(activePhaseId)}
            alt="" aria-hidden="true"
            className={`${styles.bannerIcon} pixel-img`}
            width="44" height="44"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src.endsWith('.gif')) img.src = img.src.replace(/\.gif$/, '.png');
              else img.src = FALLBACK_ICON;
            }}
          />
          <div className={styles.bannerBody}>
            <span className={styles.bannerName}>{phaseName}</span>
            {/* The mod guide's own section intro where there is one - it says
                what the phase opens up and what to do in it, which is what a
                reader arriving at a phase wants. Falls back to a cue, then to
                `triggeredBy`; the latter only restates the title
                ("Pre-Skeletron" → "Before Skeletron"), so it is the last
                resort rather than the first. */}
            {phaseDef && (
              <span className={styles.bannerHint}>
                {phaseDef.guideNote ?? phaseDef.blurb ?? phaseDef.cues[0] ?? phaseDef.triggeredBy}
              </span>
            )}
          </div>
        </div>

        {/* Bento grid */}
        <div className={styles.bento}>

          {/* Left column: weapons + reforge (hugging) */}
          <div className={styles.colLeft}>
          <div className={`${styles.invPanel} pixel-frame`}>
            <div className={styles.tlabel}><span>Weapons</span><span className={styles.em}>{classDef.name}</span></div>

            {availableSubclasses.length > 0 && (
              <div className={styles.subclassRow}>
                <button
                  type="button"
                  className={`${styles.subclassChip} pixel-frame pixel-hollow ${showingAll ? styles.on : ''}`}
                  onClick={() => { clearSubclassFilters(); setShowRest(false); }}
                  aria-pressed={showingAll}
                >
                  Top Picks
                </button>
                {availableSubclasses.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    className={`${styles.subclassChip} pixel-frame pixel-hollow ${activeSubclasses.has(sc.id) ? styles.on : ''}`}
                    aria-pressed={activeSubclasses.has(sc.id)}
                    onClick={() => { toggleSubclass(sc.id); setShowRest(false); }}
                  >
                    {sc.name}
                  </button>
                ))}
              </div>
            )}

            {ranked ? (
              <>
                {scopedBest.length > 0 && (
                  <>
                    {!showingAll && <div className={styles.groupLabel}>Best</div>}
                    <div className={styles.weaponRow}>
                      {scopedBest.map((w) => <WeaponTile key={w.id} item={w} difficulty={difficulty} onOpen={setModalItem} />)}
                    </div>
                  </>
                )}

                {filteredAlso.length > 0 && (
                  <>
                    <div className={styles.groupLabel}>Other Options</div>
                    <div className={styles.weaponRow}>
                      {filteredAlso.map((w) => <WeaponTile key={w.id} item={w} difficulty={difficulty} onOpen={setModalItem} />)}
                    </div>
                  </>
                )}
              </>
            ) : (
              unrankedShown.length > 0 && (
                <>
                  {/* Top Picks is already a shortlist and says so, so a
                      heading over the only group on screen is noise. Inside a
                      subclass the heading separates it from the Tools list
                      below, so it stays - without the note. */}
                  {!showingAll && <div className={styles.groupLabel}>Options</div>}
                  <div className={styles.weaponRow}>
                    {unrankedShown.map((w) => <WeaponTile key={w.id} item={w} difficulty={difficulty} onOpen={setModalItem} />)}
                  </div>
                </>
              )
            )}

            {(ranked ? filteredRest : unrankedRest).length > 0 && (
              <>
                <button
                  type="button"
                  className={`${styles.showRest} pixel-frame pixel-hollow`}
                  aria-expanded={showRest}
                  onClick={() => setShowRest((v) => !v)}
                >
                  {showRest ? 'Hide' : 'Show'} {(ranked ? filteredRest : unrankedRest).length} other
                  {(ranked ? filteredRest : unrankedRest).length === 1 ? '' : 's'}
                </button>
                {showRest && (
                  <div className={styles.weaponRow}>
                    {(ranked ? filteredRest : unrankedRest).map((w) => <WeaponTile key={w.id} item={w} difficulty={difficulty} onOpen={setModalItem} />)}
                  </div>
                )}
              </>
            )}

            {scopedBest.length === 0 && filteredAlso.length === 0 && filteredRest.length === 0 && supportRow.length === 0 && (
              <p className={styles.empty}>No weapons match your filters for this phase.</p>
            )}

            {/* Support items and classless tools sit under the weapons, not
                among them: they have no type pill and no filter chip, so mixed
                into the list they read as picks the class failed to categorise.
                Shown only in the overview - inside a subclass a support weapon
                ranks with its family instead. */}
            {supportRow.length > 0 && (
              <>
                <div className={styles.groupLabel}>Support Items</div>
                <div className={styles.weaponRow}>
                  {supportRow.map((w) => (
                    <WeaponTile key={w.id} item={w} difficulty={difficulty} onOpen={setModalItem} />
                  ))}
                </div>
              </>
            )}
          </div>
            {/* Minion Mixing (summoner only): the guide's recommended mix of
                minions to summon together, with a count per minion. Reuses each
                minion's own icon, name and modal from the weapons list. */}
            {safeLoadout.minionMix.length > 0 && (
              <div className={`${styles.invPanel} pixel-frame`}>
                <div className={styles.tlabel}>
                  <span>Minion Mixing</span><span className={styles.em}>Best combination</span>
                </div>
                <div className={styles.mixRow}>
                  {safeLoadout.minionMix.map((m, i) => {
                    const item = safeLoadout.weapons.find((w) => w.id === m.id);
                    if (!item) return null;
                    const alt = m.or ? safeLoadout.weapons.find((w) => w.id === m.or) : undefined;
                    return (
                      <Fragment key={m.id}>
                        {i > 0 && <span className={styles.mixPlus} aria-hidden="true">+</span>}
                        <MinionMixCard item={item} count={m.count} onOpen={setModalItem} />
                        {alt && (
                          <>
                            <span className={styles.mixOr}>or</span>
                            <MinionMixCard item={alt} count={m.count} onOpen={setModalItem} />
                          </>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Accessories sit under the weapons panel in the left column, so the
                card runs tall rather than spanning the full width. */}
          <div className={`${styles.invPanel} ${styles.accPanel} pixel-frame`}>
            <div className={styles.tlabel}>
              <span>Accessories</span>
              <span className={styles.em}>{slotCount} slots</span>
            </div>
            {substitutions.length > 0 && (
              /* The class guides recommend Expert-only picks (treasure-bag
                 drops), so in a Classic world several are simply unobtainable.
                 Rather than leave the reader wondering why their loadout differs
                 from the guide, say what was swapped and offer the switch. The
                 closing line is pack-aware: Calamity is explicitly balanced for
                 Expert, where vanilla just notes what Expert unlocks. */
              <div className={styles.classicNote}>
                <p className={styles.classicNoteText}>
                  <strong>Classic world:</strong> {substitutions.length}
                  {substitutions.length === 1 ? ' pick needs' : ' picks need'} an Expert world here:
                  {' '}{substitutions.map((s2) => s2.reason === 'swap' && s2.replacement
                    ? `${s2.original.name} → ${s2.replacement.name}`
                    : s2.reason === 'slot'
                      ? `${s2.original.name} (extra slot)`
                      : `${s2.original.name} (Expert-only)`).join(', ')}.
                  {packId === 'calamity'
                    ? ' Calamity is balanced for Expert or above.'
                    : ' Play in an Expert world to use the full guide.'}
                </p>
                <button
                  type="button"
                  className={`${styles.classicNoteBtn} pixel-frame`}
                  onClick={() => setDifficulty('expert')}
                >
                  Switch to Expert
                </button>
              </div>
            )}
            <div className={styles.accGrid}>
              {accSlots.map((acc, i) => (
                <AccCell
                  key={acc?.id ?? `slot-${i}`}
                  item={acc}
                  alts={acc
                    ? (altsBy.get(acc.name) ?? []).filter((a) => isObtainable(a, difficulty))
                    : undefined}
                  demonHeart={demonHeartUnlocked && i === 5}
                  activeClass={activeClassId}
                  difficulty={difficulty}
                  onOpen={setModalItem}
                />
              ))}
            </div>
            {accessoryPool.length > 0 && (
              <div className={styles.poolWrap}>
                <button
                  type="button"
                  className={`${styles.showRest} pixel-frame pixel-hollow`}
                  aria-expanded={showPool}
                  onClick={() => setShowPool((v) => !v)}
                >
                  {showPool ? 'Hide' : 'Show'} other options (
                  {accessoryPool.reduce((n, g) => n + g.items.length, 0)})
                </button>
                {showPool && (
                  <div className={styles.poolGroups}>
                    {accessoryPool.map((g) => (
                      <div key={g.category} className={styles.poolGroup}>
                        <div className={styles.poolHead}>
                          <span className={`${styles.accCat} ${styles[`c_${g.category}`]}`}>
                            {CATEGORY_LABEL[g.category]}
                          </span>
                          <span className={styles.poolCount}>{g.items.length}</span>
                        </div>
                        <div className={styles.poolList}>
                          {g.items.map((it) => (
                            <PoolRow key={it.id} item={it} difficulty={difficulty} onOpen={setModalItem} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <WeaponReforgeBlocks packId={packId} activeClass={activeClassId} />
            <ReforgeBlock packId={packId} activeClass={activeClassId} />
            <AccLegend packId={packId} hasQuality={poolHasQuality} />
          </div>

          </div>

          {/* Right column: armor + (buffs · accessories) */}
          <div className={styles.colRight}>
          <div className={`${styles.invPanel} pixel-frame`}>
            <div className={styles.tlabel}><span>Armor</span></div>
            {armorImg ? (
              <div className={styles.armor}>
                <div className={styles.armorInfo}>
                  {/* each listed set carries its own sprite, so a stage offering a
                      vanilla and a modded set shows what both actually look like */}
                  {groupedArmor.map((a) => {
                    const img = iconSrcs(a.icon);
                    return (
                    <button
                      key={a.id}
                      type="button"
                      className={`${styles.armorEntry} ${isObtainable(a, difficulty) ? '' : styles.locked}`}
                      title={isObtainable(a, difficulty) ? undefined : 'Not obtainable in a Classic world'}
                      onClick={() => setModalItem(a)}
                    >
                      {/* One sprite per class, wearing that class's own helmet.
                          The wiki's set image is a composite of every variant,
                          sliced on the transparent gaps and mapped by the set's
                          documented helmet order - the same method vanilla uses,
                          which is why vanilla was right and this was not. */}
                      <div className={`${styles.armorDoll} pixel-frame`}>
                        <img
                          src={img.local} alt=""
                          className={`${styles.armorSprite} pixel-img`}
                          width="44" height="44" loading="lazy"
                          onError={makeErrorHandler(img.wiki, FALLBACK_ICON)}
                        />
                      </div>
                      <div className={styles.armorEntryBody}>
                        <div className={styles.armorName}>
                          {a.name}
                          {a.defense != null && (
                            <span className={styles.armorDef}>
                              {a.defenseAlt != null ? `${a.defense} / ${a.defenseAlt}` : a.defense} def
                            </span>
                          )}
                          {a.singlePiece && (
                            <span className={`${styles.mixTag} pixel-frame`}>Mix</span>
                          )}
                          {/* World-restriction (Corruption/Crimson) rides as a chip
                              so the set-bonus line can be pure stats. */}
                          {(a.markers ?? []).map((m) => (
                            <span key={m} className={`${styles.accMarker} ${styles.armorMarker}`} title={MARKER_TITLE[m]}>
                              {MARKER_LABEL[m]}
                            </span>
                          ))}
                        </div>
                      {a.headpiece && a.pieces && a.pieces.length > 0 && (
                        <div className={styles.armorPieces}>
                          {a.pieces.map((p) => (
                            <span
                              key={p}
                              className={`${styles.armorPiece} pixel-frame pixel-hollow ${p === a.headpiece ? styles.armorPieceHead : ''}`}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* The set bonus leads, because it is what wearing the set
                          actually does - "solid early defense" told a reader
                          nothing, and for Calamity's retuned vanilla sets the
                          inherited "No set bonus" was wrong outright. `why` is
                          kept underneath as the guide's reason for picking it. */}
                      {/* The set bonus leads: it is what wearing the set does.
                          `why` stands in when there is no effect, so vanilla
                          armour (no effect text) is not left with a blank card. */}
                      {(() => {
                        /* The card preview leads with the helmet (class) bonuses;
                           the set bonus and any overflow move to the modal, which
                           labels the two apart. Helmet bonuses are stored comma-
                           joined, so split them into their own bullets. */
                        const setBullets = (a.effect || a.why || '').split(' · ').filter(Boolean);
                        const helmetBullets = (a.headpieceBonus || '')
                          .split(' · ').map((s) => s.trim()).filter(Boolean);
                        if (!setBullets.length && !helmetBullets.length) return null;
                        const preview = helmetBullets.length > 0 ? helmetBullets : setBullets;
                        const shown = preview.slice(0, ARMOR_EFFECT_LINES);
                        const hidden = (preview.length - shown.length)
                          + (helmetBullets.length > 0 ? setBullets.length : 0);
                        return (
                          <>
                            <ul className={styles.armorEffects}>
                              {shown.map((line) => <li key={line}>{line}</li>)}
                            </ul>
                            {hidden > 0 && (
                              <div className={styles.armorMore}>
                                +{hidden} more - click to see the full bonuses
                              </div>
                            )}
                          </>
                        );
                      })()}
                      </div>
                    </button>
                    );
                  })}
                  {safeLoadout.mixNote && (
                    <p className={styles.mixNote}>
                      <span className={styles.mixNoteHead}>Mixing pieces</span>
                      {safeLoadout.mixNote}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className={styles.empty}>No armor data for this phase yet.</p>
            )}
          </div>

          {/* Ranged classes only: the panel is skipped entirely when a class
              carries no ammo, so melee/mage/summoner are unchanged. */}
          {safeLoadout.ammo.length > 0 && (
            <div className={`${styles.invPanel} pixel-frame`}>
              <div className={styles.tlabel}><span>Ammo</span></div>
              {/* Grouped by role - Single Target, Crowd Control, then a weapon's
                  own Special ammo. Untagged ammo keeps the old family order in a
                  final unlabelled group. */}
              {groupAmmoByRole(safeLoadout.ammo).map((group) => (
                <Fragment key={group.label || 'ammo-untagged'}>
                  {group.label && <div className={styles.groupLabel}>{group.label}</div>}
                  <div className={styles.ammoList}>
                    {group.items.map((m) => {
                      const img = iconSrcs(m.icon);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          className={`${styles.ammoEntry} ${isObtainable(m, difficulty) ? '' : styles.locked}`}
                          title={isObtainable(m, difficulty) ? undefined : 'Not obtainable in a Classic world'}
                          onClick={() => setModalItem(m)}
                        >
                          <div className={`${styles.ammoSlot} pixel-frame`}>
                            <img
                              src={img.local} alt=""
                              className={`${styles.ammoImg} pixel-img`}
                              loading="lazy"
                              onError={makeErrorHandler(img.wiki, FALLBACK_ICON)}
                            />
                          </div>
                          <div className={styles.ammoBody}>
                            <div className={styles.ammoHead}>
                              <span className={styles.ammoName}>{m.name}</span>
                              {m.stats && <span className={styles.ammoStat}>{m.stats}</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Fragment>
              ))}
            </div>
          )}

          {/* Buffs take the full column now that accessories have their own row */}
          <div className={`${styles.invPanel} ${styles.buffsPanel} pixel-frame`}>
            <div className={styles.buffLabel}>Buffs &amp; Consumables</div>
            {safeLoadout.buffs.length > 0 ? (
              <div className={styles.buffGrid}>
                {safeLoadout.buffs.map((b) => <BuffCell key={b.id} item={b} difficulty={difficulty} onOpen={setModalItem} />)}
              </div>
            ) : (
              <p className={styles.empty}>No buff data for this phase yet.</p>
            )}
          </div>
          </div>
        </div>

      </section>

      <ItemModal item={modalItem} onClose={() => setModalItem(null)} />

      <div className={styles.footerLayer}>
        <Footer />
      </div>
    </div>
  );
}
