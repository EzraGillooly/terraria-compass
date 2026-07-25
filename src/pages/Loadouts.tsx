import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ItemModal } from '../components/ItemModal/ItemModal';
import { useAppState, usePack } from '../lib/app-context';
import { isItemRelevantToDifficulty } from '../lib/difficulty';
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
function WeaponTile({ item, difficulty, onOpen }: { item: Item; difficulty: string; onOpen: (i: Item) => void }) {
  const relevant = isItemRelevantToDifficulty(item.tags, difficulty as 'normal' | 'expert' | 'master');
  const { local, wiki } = iconSrcs(item.icon, item.wikiUrl);

  // No top-pick star: `topPick` only ever meant "listed first in the wiki's
  // class-setup table", which is layout order rather than a ranking, so the
  // highlight asserted a best-in-slot the data never established.
  return (
    <button
      type="button"
      className={`${styles.wtile} pixel-frame pixel-hollow`}
      style={{ opacity: relevant ? 1 : 0.45 }}
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

/* ── Accessory equip cell ── */
const HARDMODE_PHASES = new Set<PhaseId>([
  'pre-mech', 'pre-plantera', 'pre-golem', 'pre-cultist', 'pre-moonlord', 'endgame',
]);

/* Ore/evil armor comes in world-locked pairs (Gold↔Platinum, Cobalt↔Palladium,
   Shadow↔Crimson, …) that are the same choice in different worlds. Show a pair as
   one entry ("Gold / Platinum armor") rather than two rows, and normalise stray
   capitalisation ("Crimson Armor" → "Crimson armor"). */
const ARMOR_VARIANTS: [string, string][] = [
  ['Copper', 'Tin'], ['Iron', 'Lead'], ['Silver', 'Tungsten'], ['Gold', 'Platinum'],
  ['Shadow', 'Crimson'], ['Cobalt', 'Palladium'], ['Mythril', 'Orichalcum'],
  ['Adamantite', 'Titanium'],
];

const armorMaterial = (name: string) => name.replace(/\s*armor\b.*$/i, '').trim();
const tidyArmorName = (name: string) => name.replace(/\bArmor\b/, 'armor');

function groupArmor(armor: Item[]): Item[] {
  const out: Item[] = [];
  const used = new Set<string>();
  for (const a of armor) {
    if (used.has(a.id)) continue;
    const mat = armorMaterial(a.name);
    const pair = ARMOR_VARIANTS.find((p) => p.some((v) => v.toLowerCase() === mat.toLowerCase()));
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
  const picks: Item[] = [];
  if (vanilla[0]) picks.push(vanilla[0]);
  if (modded[0]) picks.push(modded[0]);
  // endgame stages have no vanilla set (or vice versa) - fill to two from the
  // pool that has options so the reader still sees an alternative
  if (picks.length < 2) {
    const pool = vanilla.length ? vanilla : modded;
    if (pool[1]) picks.push(pool[1]);
  }
  return picks.sort((a, b) => grouped.indexOf(a) - grouped.indexOf(b));
}

function AccCell({ item, demonHeart, onOpen }: { item: Item | null; demonHeart?: boolean; onOpen: (i: Item) => void }) {
  if (!item) {
    return (
      <div className={`${styles.accSlot} pixel-frame pixel-hollow ${styles.accEmpty} ${demonHeart ? styles.accDemon : ''}`}>
        <span className={styles.accSlotHint}>{demonHeart ? 'Demon Heart' : 'Open'}</span>
      </div>
    );
  }
  const { local, wiki } = iconSrcs(item.icon, item.wikiUrl);
  return (
    <button type="button" className={`${styles.accSlot} pixel-frame pixel-hollow ${demonHeart ? styles.accDemon : ''}`} onClick={() => onOpen(item)}>
      <img
        src={local} alt="" aria-hidden="true"
        className={`${styles.accSlotImg} pixel-img`}
        width="28" height="28" loading="lazy"
        onError={makeErrorHandler(wiki, FALLBACK_ICON)}
      />
      <span className={styles.accSlotName}>{item.name}</span>
    </button>
  );
}

/* ── Buff / consumable card (same shape as an accessory slot) ── */
function BuffCell({ item, onOpen }: { item: Item; onOpen: (i: Item) => void }) {
  const { local, wiki } = iconSrcs(item.icon, item.wikiUrl);
  return (
    <button type="button" className={`${styles.buffCell} pixel-frame pixel-hollow`} onClick={() => onOpen(item)}>
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
  const { classes, phases, loadouts, bosses } = usePack();
  const [phaseId, setPhaseId] = useState<PhaseId>('pre-bosses');
  const [modalItem, setModalItem] = useState<Item | null>(null);
  const [showRest, setShowRest] = useState(false);

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

  const safeLoadout = loadout ?? { phase: activePhaseId, class: activeClassId, weapons: [], armor: [], accessories: [], buffs: [] };

  const { clearSubclassFilters, selectedSubclassSet, toggleSubclass } =
    useSubclassFilters(activeClassId);

  // Only offer subclasses that actually have a weapon this phase - e.g. there are
  // no Launchers before Hardmode. A stored subclass that isn't available here (or
  // no longer exists at all) falls back to "All" rather than showing an empty list.
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

  const matchSub = (w: Item) => !hasSubclasses || showingAll || !w.subclass || activeSubclasses.has(w.subclass);
  const inScope = safeLoadout.weapons.filter(matchSub);

  /*
   * Whether this loadout was actually ranked. Curated entries carry a `why`
   * explaining the pick; the endgame Calamity loadouts were scraped from the
   * wiki's class-setup tables, where `tier` only records the row's position in
   * that table. Calling the first row "Recommended" would assert a judgement
   * nothing made, so those are presented as an unranked list instead.
   */
  const ranked = safeLoadout.weapons.some((w) => w.why);

  // "All" is an overview: just the best in slot from each subclass. Picking a
  // subclass opens it up to the viable alternates, with the rest behind a toggle.
  const filteredBest = inScope.filter((w) => w.tier === 'best');
  const filteredAlso = showingAll ? [] : inScope.filter((w) => w.tier === 'good');
  const filteredRest = showingAll ? [] : inScope.filter((w) => w.tier === 'other');

  // Unranked: one flat list, so no tier reads as a recommendation.
  const unrankedShown = showingAll ? filteredBest : [...filteredBest, ...filteredAlso];
  const unrankedRest = filteredRest;

  const groupedArmor = curateArmor(groupArmor(safeLoadout.armor));
  const armorSprite = groupedArmor[0]?.icon;
  const armorImg = armorSprite ? iconSrcs(armorSprite) : null;

  // Accessory slots: always 5, plus a 6th "Demon Heart" slot in Expert/Master hardmode.
  const demonHeartUnlocked = HARDMODE_PHASES.has(activePhaseId) && (difficulty === 'expert' || difficulty === 'master');
  const slotCount = demonHeartUnlocked ? 6 : 5;
  const accSlots = Array.from({ length: slotCount }, (_, i) => safeLoadout.accessories[i] ?? null);
  const extraAccessories = safeLoadout.accessories.slice(slotCount);


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
          <div className={`${styles.invPanel} ${styles.weaponsPanel} pixel-frame`}>
            <div className={styles.tlabel}><span>Weapons</span><span className={styles.em}>{classDef.name}</span></div>

            {availableSubclasses.length > 0 && (
              <div className={styles.subclassRow}>
                <button
                  type="button"
                  className={`${styles.subclassChip} pixel-frame pixel-hollow ${showingAll ? styles.on : ''}`}
                  onClick={() => { clearSubclassFilters(); setShowRest(false); }}
                  aria-pressed={showingAll}
                >
                  All
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
                    <div className={styles.groupLabel}>Recommended</div>
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

          {/* Reforge - hugs the weapons panel */}
          <div className={`${styles.invPanel} ${styles.reforgePanel} pixel-frame`}>
            {extraAccessories.length > 0 && (
              <div className={styles.accAlts}>
                <span className={styles.accAltsLabel}>Also good:</span>
                {extraAccessories.map((a) => (
                  <button key={a.id} type="button" className={`${styles.accAlt} pixel-frame pixel-hollow`} onClick={() => setModalItem(a)}>{a.name}</button>
                ))}
              </div>
            )}
            <div className={styles.reforgeLabel}>Accessory reforges</div>
            <p className={styles.reforgeIntro}>
              Reforge accessories at the Goblin Tinkerer. There is no single best pick, so match it to how you play:
            </p>
            <ul className={styles.reforgeList}>
              <li><b>Warding</b> <span>+4 defense</span> take fewer hits while you learn a fight</li>
              <li><b>Menacing</b> <span>+4% damage</span> the standard max-DPS choice</li>
              <li><b>Lucky</b> <span>+4% crit</span> pairs well with high base crit</li>
              <li><b>Quick</b> <span>+4% move speed</span> good on wings and boots</li>
            </ul>
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
                    <button key={a.id} type="button" className={styles.armorEntry} onClick={() => setModalItem(a)}>
                      <div className={`${styles.armorDoll} pixel-frame`}>
                        <img
                          src={img.local} alt=""
                          className={`${styles.armorSprite} pixel-img`}
                          width="44" height="44" loading="lazy"
                          onError={makeErrorHandler(img.wiki, FALLBACK_ICON)}
                        />
                      </div>
                      <div className={styles.armorEntryBody}>
                        <div className={styles.armorName}>{a.name}</div>
                      {a.pieces && a.pieces.length > 0 && (
                        <div className={styles.armorPieces}>
                          {a.headpiece && <span className={`${styles.armorHeadTag} pixel-frame`}>{classDef.name}</span>}
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
                      {a.why && <div className={styles.armorPerk}>{a.why}</div>}
                      </div>
                    </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className={styles.empty}>No armor data for this phase yet.</p>
            )}
          </div>

          {/* Buffs next to the compact accessory box */}
          <div className={styles.accRow}>
            <div className={`${styles.invPanel} ${styles.buffsPanel} pixel-frame`}>
              <div className={styles.buffLabel}>Buffs &amp; Consumables</div>
              {safeLoadout.buffs.length > 0 ? (
                <div className={styles.buffGrid}>
                  {safeLoadout.buffs.map((b) => <BuffCell key={b.id} item={b} onOpen={setModalItem} />)}
                </div>
              ) : (
                <p className={styles.empty}>No buff data for this phase yet.</p>
              )}
            </div>

            <div className={`${styles.invPanel} ${styles.accBox} pixel-frame`}>
              <div className={styles.tlabel}><span>Accessories</span><span className={styles.em}>{slotCount} slots</span></div>
              {/* one vertical strip of slots; the 6th is the Expert-only Demon Heart */}
              <div className={styles.accSplit}>
                {accSlots.map((acc, i) => (
                  <AccCell
                    key={acc?.id ?? `slot-${i}`}
                    item={acc}
                    demonHeart={demonHeartUnlocked && i === 5}
                    onOpen={setModalItem}
                  />
                ))}
              </div>
            </div>
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
