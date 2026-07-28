import { useState } from 'react';
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
  const stem = icon.replace(/\.png$/i, '').split('/').pop() ?? '';
  const fromWikiUrl = wikiUrl?.split('/wiki/')[1];
  const wikiName = fromWikiUrl || makeWikiName(stem);
  return { local: `${BASE}icons/${icon}`, wiki: `${WIKI}/${wikiName}.png` };
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

/* Fewest weapons Top Picks tries to show. Below this the shortlist reads as
   "your only option" rather than a choice. */
const MIN_TOP_PICKS = 3;

/* Set-bonus lines shown on an armour card before it defers to the modal. Three
   lines wrap to about six on a narrow card, which is as much as the card can
   carry without the armour list dominating the page. */
const ARMOR_EFFECT_LINES = 3;

/* ── Accessory equip cell ── */

const HARDMODE_PHASES = new Set<PhaseId>([
  'pre-mech', 'pre-plantera', 'pre-golem', 'pre-cultist', 'pre-moonlord', 'endgame',
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
  const vanilla = grouped.filter((a) => !isCalamityArmor(a.name));
  const modded = grouped.filter((a) => isCalamityArmor(a.name));

  // Playing a mod, the useful comparison is "best vanilla set vs best modded
  // set", so it stays at one of each. Without a mod there is nothing to compare
  // against, and several stages have two or three genuinely on-tier sets
  // (Bee vs Obsidian, Chlorophyte vs Turtle, Spooky vs Tiki), so show them all.
  if (!modded.length) return vanilla;

  const picks: Item[] = [];
  if (vanilla[0]) picks.push(vanilla[0]);
  if (modded[0]) picks.push(modded[0]);
  // endgame stages have no vanilla set (or vice versa) - fill to two from the
  // pool that has options so the reader still sees an alternative
  if (picks.length < 2) {
    const pool = vanilla.length ? vanilla : modded;
    if (pool[1]) picks.push(pool[1]);
  }
  /* Ore siblings travel together. Where the pairs are not merged into one row
     (Calamity, which gives Gold and Platinum different set bonuses), keeping
     only the first pick would show Gold and silently drop Platinum - they are
     one choice at one tier, so the reader needs both or neither. */
  const withSiblings = [...picks];
  for (const p of picks) {
    const pair = ARMOR_VARIANTS.find((v) =>
      v.some((m) => m.toLowerCase() === armorMaterial(p.name).toLowerCase()));
    if (!pair) continue;
    for (const g of grouped) {
      if (withSiblings.includes(g)) continue;
      if (pair.some((m) => m.toLowerCase() === armorMaterial(g.name).toLowerCase())) {
        withSiblings.push(g);
      }
    }
  }
  return withSiblings.sort((a, b) => grouped.indexOf(a) - grouped.indexOf(b));
}

/* ── Accessory taxonomy ──
   Categories, quality tiers and markers follow the community accessory guide, so
   the labels and colours match what a reader will have seen there. */
const CATEGORY_LABEL: Record<string, string> = {
  mobility: 'Mobility', offense: 'Offense', survivability: 'Survivability',
  melee: 'Melee', ranged: 'Ranged', magic: 'Magic', summon: 'Summon',
};
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
};

/** Class-specific categories are noise on the other three classes' pages. */
function visibleCategories(item: Item, activeClass: string): string[] {
  return (item.categories ?? []).filter((c) => {
    const owner = CATEGORY_CLASS[c];
    return !owner || owner === activeClass;
  });
}

function AccCell({
  item, demonHeart, activeClass, difficulty, onOpen,
}: {
  item: Item | null; demonHeart?: boolean; activeClass: string;
  difficulty: DifficultyFilter; onOpen: (i: Item) => void;
}) {
  if (!item) {
    return (
      <div className={`${styles.accSlot} pixel-frame pixel-hollow ${styles.accEmpty} ${demonHeart ? styles.accDemon : ''}`}>
        <span className={styles.accSlotHint}>{demonHeart ? 'Demon Heart' : 'Open'}</span>
      </div>
    );
  }
  const { local, wiki } = iconSrcs(item.icon, item.wikiUrl);
  const cats = visibleCategories(item, activeClass);
  const markers = item.markers ?? [];
  const locked = !isObtainable(item, difficulty);
  return (
    <button
      type="button"
      className={`${styles.accSlot} pixel-frame pixel-hollow ${demonHeart ? styles.accDemon : ''} ${locked ? styles.locked : ''}`}
      title={locked ? 'Not obtainable in a Classic world' : undefined}
      onClick={() => onOpen(item)}
    >
      <img
        src={local} alt="" aria-hidden="true"
        className={`${styles.accSlotImg} pixel-img`}
        width="28" height="28" loading="lazy"
        onError={makeErrorHandler(wiki, FALLBACK_ICON)}
      />
      <span className={styles.accSlotName}>{item.name}</span>

      {(cats.length > 0 || item.quality || markers.length > 0) && (
        <span className={styles.accTags}>
          {item.quality && (
            <span className={`${styles.accQuality} ${styles[`q_${item.quality}`]}`}>
              {item.quality}
            </span>
          )}
          {cats.map((c) => (
            <span key={c} className={`${styles.accCat} ${styles[`c_${c}`]}`}>
              {CATEGORY_LABEL[c]}
            </span>
          ))}
          {markers.map((m) => (
            <span key={m} className={styles.accMarker} title={MARKER_TITLE[m]}>
              {MARKER_LABEL[m]}
            </span>
          ))}
        </span>
      )}
    </button>
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
  return (
    <div className={styles.accLegend}>
      <span className={styles.accLegendLabel}>Tags</span>
      {(['mobility', 'offense', 'survivability'] as const).map((c) => (
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

const REFORGES: Record<string, { intro: string; list: Reforge[]; href: string; label: string }> = {
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

export function Loadouts() {
  const { difficulty, classId } = useAppState();
  const { id: packId, classes, phases, loadouts, bosses } = usePack();
  const [phaseId, setPhaseId] = useState<PhaseId>('pre-bosses');
  const [modalItem, setModalItem] = useState<Item | null>(null);
  const [showRest, setShowRest] = useState(false);
  const [showPool, setShowPool] = useState(false);

  // classId lives in app-context (header selector); it is already clamped to the
  // active pack there, so no local clamp is needed.
  const activePhaseId = phases.some((p) => p.id === phaseId) ? phaseId : (phases[0]?.id ?? phaseId);
  const activeClassId = classId;

  // Backdrop + phase-bar boss icon per phase. Vanilla uses fixed maps; other
  // packs fall back to a generic backdrop and a representative boss from the data.
  const phaseBiome = (pid: string) => (pid in PHASE_BIOME ? PHASE_BIOME[pid] : 'forest');
  const phaseBossIcon = (pid: string) =>
    pid in PHASE_BOSS
      ? PHASE_BOSS[pid]
      : (bosses.find((b) => b.stage === pid && !b.side)?.id ?? bosses.find((b) => b.stage === pid)?.id ?? '');

  const loadout = loadouts.find((l) => l.phase === activePhaseId && l.class === activeClassId);
  const classDef = classes.find((c) => c.id === activeClassId)!;
  const phaseDef = phases.find((p) => p.id === activePhaseId);
  const phaseName = phaseDef?.name ?? '';
  const activeOrder = phaseDef?.order ?? 0;

  const safeLoadout = loadout ?? { phase: activePhaseId, class: activeClassId, weapons: [], armor: [], accessories: [], buffs: [], ammo: [], accessoryPool: [] };

  const { clearSubclassFilters, selectedSubclassSet, toggleSubclass } =
    useSubclassFilters(activeClassId);

  // Only offer subclasses that actually have a weapon this phase - e.g. there are
  // no Launchers before Hardmode. A stored subclass that isn't available here (or
  // no longer exists at all) falls back to "Overview" rather than showing an empty list.
  const availableSubclasses = classDef.subclasses.filter((s) =>
    safeLoadout.weapons.some((w) => w.subclass === s.id),
  );
  const hasSubclasses = availableSubclasses.length > 0;
  const validSubclasses = new Set(availableSubclasses.map((s) => s.id));
  const activeSubclasses = new Set(
    [...selectedSubclassSet].filter((s) => validSubclasses.has(s)),
  );
  // With no subclasses (e.g. Calamity classes) there are no filter chips, so show
  // the full best/good/other split rather than only best-in-slot.
  const showingAll = hasSubclasses && activeSubclasses.size === 0;

  /* An uncategorised weapon belongs to no chip, so it appears only when no chip
     is active. It used to pass every filter, which put items like the Rod of
     Discord under Daggers, Bombs and Javelins at once. */
  const matchSub = (w: Item) =>
    !hasSubclasses || showingAll || (!!w.subclass && activeSubclasses.has(w.subclass));

  /* Read in the same order as the toggles above: a summoner's toggles run
     Minions, Whips, Sentries, so its picks should too. Anything without a
     subclass sorts last rather than interleaving. */
  const subOrder = new Map(classDef.subclasses.map((sc, i) => [sc.id, i]));
  const bySubclass = (a: Item, b: Item) =>
    (subOrder.get(a.subclass ?? '') ?? Infinity) - (subOrder.get(b.subclass ?? '') ?? Infinity);
  const inScope = safeLoadout.weapons.filter(matchSub).sort(bySubclass);

  /*
   * Whether this loadout was actually ranked. Curated entries carry a `why`
   * explaining the pick; the endgame Calamity loadouts were scraped from the
   * wiki's class-setup tables, where `tier` only records the row's position in
   * that table. Calling the first row "Recommended" would assert a judgement
   * nothing made, so those are presented as an unranked list instead.
   */
  const ranked = safeLoadout.weapons.some((w) => w.why);

  // "Overview" shows one pick per subclass rather than every weapon, which is
  // why it is not called "All". Picking a
  // subclass opens it up to the viable alternates, with the rest behind a toggle.
  const bestTier = inScope.filter((w) => w.tier === 'best');
  /* Top Picks aims for at least three weapons. One pick per subclass leaves
     phases where a class has only one or two on-tier families showing a single
     card, which reads as "this is your only option" rather than a shortlist.
     The top-up keeps the list's own order, so the added cards are the next
     best rather than an arbitrary pick. */
  const filteredBest = showingAll && bestTier.length < MIN_TOP_PICKS
    ? [...bestTier, ...inScope.filter((w) => w.tier !== 'best')
      .slice(0, MIN_TOP_PICKS - bestTier.length)].sort(bySubclass)
    : bestTier;
  const filteredAlso = showingAll ? [] : inScope.filter((w) => w.tier === 'good');
  const filteredRest = showingAll
    ? [] : inScope.filter((w) => w.tier === 'other');

  // Unranked: one flat list, so no tier reads as a recommendation.
  const unrankedShown = showingAll ? filteredBest : [...bestTier, ...filteredAlso];
  const unrankedRest = filteredRest;

  const groupedArmor = curateArmor(groupArmor(safeLoadout.armor, packId === 'vanilla'));
  const armorSprite = groupedArmor[0]?.icon;
  const armorImg = armorSprite ? iconSrcs(armorSprite) : null;

  // Accessory slots: always 5, plus a 6th "Demon Heart" slot in Expert/Master hardmode.
  const demonHeartUnlocked = HARDMODE_PHASES.has(activePhaseId) && difficulty === 'expert';
  const slotCount = demonHeartUnlocked ? 6 : 5;

  /*
   * In Classic, an Expert-only pick is not a recommendation - it is a slot the
   * player cannot fill. Rather than show it greyed, drop it and promote the
   * next best option from the same category in the pool, falling back to any
   * category once that runs out. Ranked great -> good -> fine, which is the
   * sandbox's own grading, so the replacement is the next best thing and not
   * merely the next thing.
   */
  const accessories = ((): Item[] => {
    const usable = safeLoadout.accessories.filter((a) => isObtainable(a, difficulty));
    if (usable.length === safeLoadout.accessories.length) return safeLoadout.accessories;

    const dropped = safeLoadout.accessories.filter((a) => !isObtainable(a, difficulty));
    const taken = new Set(usable.map((a) => a.name));
    const rank = (q?: string) => (q === 'great' ? 0 : q === 'good' ? 1 : 2);

    const out = [...usable];
    for (let i = 0; i < dropped.length && out.length < slotCount; i += 1) {
      // A category the build already covers is a poor swap: replacing the
      // Shield of Cthulhu with Lightning Boots next to equipped Spectre Boots
      // spends a slot on the same upgrade line. Uncovered categories rank
      // first, then the sandbox's own grade.
      const covered = new Set(out.flatMap((a) => a.categories ?? []));
      const pick = safeLoadout.accessoryPool
        .flatMap((g) => g.items)
        .filter((it) => !taken.has(it.name) && !it.isGroup && !it.tedious
          && isObtainable(it, difficulty))
        .sort((a, b) => {
          const ac = (a.categories ?? []).some((c) => covered.has(c)) ? 1 : 0;
          const bc = (b.categories ?? []).some((c) => covered.has(c)) ? 1 : 0;
          return ac - bc || rank(a.quality) - rank(b.quality);
        })[0];
      if (!pick) break;
      taken.add(pick.name);
      out.push(pick);
    }
    return out;
  })();

  /* Fixed reading order for the slots: mobility, survivability, offense, then
     the class's own. An accessory in two categories takes the earliest one, so
     the Celestial Shell (offense + survivability) sits with survivability. */
  const CAT_ORDER = ['mobility', 'survivability', 'offense'] as const;
  const catRank = (it: Item) => {
    const cats = it.categories ?? [];
    const generic = CAT_ORDER.findIndex((c) => (cats as readonly string[]).includes(c));
    if (generic >= 0) return generic;
    return cats.length > 0 ? CAT_ORDER.length : CAT_ORDER.length + 1;
  };
  const ordered = [...accessories].sort((a, b) => catRank(a) - catRank(b));
  const accSlots = Array.from({ length: slotCount }, (_, i) => ordered[i] ?? null);

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
  const equippedNames = new Set(accSlots.filter(Boolean).map((a) => a!.name));
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

        {/* Class now lives in the header selector; the title reflects the choice. */}
        <div className={styles.pageHead}>
          <div>
            <p className={styles.kick}>Class Loadouts</p>
            <h1 className={styles.title}>{classDef.name} <em>· {phaseName}</em></h1>
            <p className={styles.lede}>Pick your stage below and your class from the header. Armor and accessory picks update with every choice.</p>
          </div>
        </div>

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
            return (
              <button
                key={p.id}
                type="button"
                className={`${styles.waypoint} ${active ? styles.on : ''} ${done ? styles.done : ''}`}
                aria-pressed={active}
                aria-label={p.name}
                onClick={() => { setPhaseId(p.id as PhaseId); setShowRest(false); }}
              >
                {i > 0 && <span className={`${styles.vein} ${p.order <= activeOrder ? styles.veinFill : ''}`} aria-hidden="true" />}
                <span className={`${styles.wpDisc} pixel-frame pixel-circle`}>
                  <img
                    src={`${BASE}icons/bosses/${phaseBossIcon(p.id)}.png`}
                    alt="" aria-hidden="true"
                    className={`${styles.wpIcon} pixel-img`}
                    width="30" height="30" loading="lazy"
                    onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }}
                  />
                </span>
                <span className={styles.wpName}>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Boss banner (re-mounts per phase to replay the slide-in) */}
        <div key={activePhaseId} className={`${styles.banner} pixel-frame`}>
          <img
            src={`${BASE}icons/bosses/${phaseBossIcon(activePhaseId)}.png`}
            alt="" aria-hidden="true"
            className={`${styles.bannerIcon} pixel-img`}
            width="44" height="44"
            onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }}
          />
          <div>
            <span className={styles.bannerName}>{phaseName}</span>
            {/* The first cue, not `triggeredBy`: that field just restates the
                title ("Pre-Skeletron" → "Before Skeletron"), and the two packs
                disagree on whether it names the phase's start or its end. A cue
                answers the question the banner should - am I in this phase? */}
            {phaseDef && (
              <span className={styles.bannerHint}>
                {phaseDef.cues[0] ?? phaseDef.triggeredBy}
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
                {filteredBest.length > 0 && (
                  <>
                    {!showingAll && <div className={styles.groupLabel}>Recommended</div>}
                    <div className={styles.weaponRow}>
                      {filteredBest.map((w) => <WeaponTile key={w.id} item={w} difficulty={difficulty} onOpen={setModalItem} />)}
                    </div>
                  </>
                )}

                {filteredAlso.length > 0 && (
                  <>
                    <div className={styles.groupLabel}>Also Great</div>
                    <div className={styles.weaponRow}>
                      {filteredAlso.map((w) => <WeaponTile key={w.id} item={w} difficulty={difficulty} onOpen={setModalItem} />)}
                    </div>
                  </>
                )}
              </>
            ) : (
              unrankedShown.length > 0 && (
                <>
                  <div className={styles.groupLabel}>
                    Options
                    <span className={styles.groupNote}>
                      viable here, in no particular order
                    </span>
                  </div>
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

            {filteredBest.length === 0 && filteredAlso.length === 0 && filteredRest.length === 0 && (
              <p className={styles.empty}>No weapons match your filters for this phase.</p>
            )}
          </div>
            {/* Accessories sit under the weapons panel in the left column, so the
                card runs tall rather than spanning the full width. */}
          <div className={`${styles.invPanel} ${styles.accPanel} pixel-frame`}>
            <div className={styles.tlabel}>
              <span>Accessories</span>
              <span className={styles.em}>{slotCount} slots</span>
            </div>
            <div className={styles.accGrid}>
              {accSlots.map((acc, i) => (
                <AccCell
                  key={acc?.id ?? `slot-${i}`}
                  item={acc}
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
                            <span className={styles.armorDef}>{a.defense} def</span>
                          )}
                          {a.singlePiece && (
                            <span className={`${styles.mixTag} pixel-frame`}>Mix</span>
                          )}
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
                      {a.effect && (() => {
                        /* Capped at three lines. Victide lists eleven - one per
                           headpiece - which buried the rest of the card. The
                           full list is in the modal, so say so rather than
                           truncating silently. */
                        const all = a.effect.split(' · ');
                        const shown = all.slice(0, ARMOR_EFFECT_LINES);
                        const rest = all.length - shown.length;
                        return (
                          <>
                            <ul className={styles.armorEffects}>
                              {shown.map((line) => <li key={line}>{line}</li>)}
                            </ul>
                            {rest > 0 && (
                              <div className={styles.armorMore}>
                                +{rest} more - click to see the full set bonus
                              </div>
                            )}
                          </>
                        );
                      })()}
                      {(a.why || a.headpieceBonus) && (
                        <div className={styles.armorPerk}>
                          {[a.why, a.headpieceBonus].filter(Boolean).join(' ')}
                        </div>
                      )}
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
              <div className={styles.ammoList}>
                {safeLoadout.ammo.map((m) => {
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
                        <div className={styles.ammoWhy}>{m.why}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
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
