import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ItemModal } from '../components/ItemModal/ItemModal';
import { useAppState } from '../lib/app-context';
import { classes, getLoadoutByPhaseAndClass, phases } from '../lib/data';
import { isItemRelevantToDifficulty } from '../lib/difficulty';
import { useSubclassFilters } from '../lib/subclasses';
import type { ClassId, Item, PhaseId } from '../data/schema';
import type { SyntheticEvent } from 'react';
import styles from './Loadouts.module.css';

const BASE = import.meta.env.BASE_URL;
const WIKI = 'https://terraria.wiki.gg/wiki/Special:FilePath';

/* Class rail icons — a representative early-game weapon per class, served locally
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

/* Prefer the real wiki page name for the sprite fallback — kebab→TitleCase mangles
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

  return (
    <button
      type="button"
      className={`${styles.wtile} ${item.topPick ? styles.best : ''}`}
      style={{ opacity: relevant ? 1 : 0.45 }}
      onClick={() => onOpen(item)}
    >
      {item.topPick && <span className={styles.wStar} aria-label="Top pick">★</span>}
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
      {item.subclass && <span className={styles.wSub}>{item.subclass}</span>}
    </button>
  );
}

/* ── Accessory equip cell ── */
const HARDMODE_PHASES = new Set<PhaseId>([
  'pre-mech', 'pre-plantera', 'pre-golem', 'pre-cultist', 'pre-moonlord', 'endgame',
]);

function AccCell({ item, demonHeart, onOpen }: { item: Item | null; demonHeart?: boolean; onOpen: (i: Item) => void }) {
  if (!item) {
    return (
      <div className={`${styles.accSlot} ${styles.accEmpty} ${demonHeart ? styles.accDemon : ''}`}>
        <span className={styles.accSlotHint}>{demonHeart ? 'Demon Heart' : 'Open'}</span>
      </div>
    );
  }
  const { local, wiki } = iconSrcs(item.icon, item.wikiUrl);
  return (
    <button type="button" className={`${styles.accSlot} ${demonHeart ? styles.accDemon : ''}`} onClick={() => onOpen(item)}>
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
    <button type="button" className={styles.buffCell} onClick={() => onOpen(item)}>
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
  const { difficulty } = useAppState();
  const [phaseId, setPhaseId] = useState<PhaseId>('pre-bosses');
  const [classId, setClassId] = useState<ClassId>('melee');
  const [modalItem, setModalItem] = useState<Item | null>(null);
  const [showRest, setShowRest] = useState(false);

  const loadout = getLoadoutByPhaseAndClass(phaseId, classId);
  const classDef = classes.find((c) => c.id === classId)!;
  const phaseDef = phases.find((p) => p.id === phaseId);
  const phaseName = phaseDef?.name ?? '';
  const activeOrder = phaseDef?.order ?? 0;

  const safeLoadout = loadout ?? { phase: phaseId, class: classId, weapons: [], armor: [], accessories: [], buffs: [] };

  const { clearSubclassFilters, selectedSubclassSet, toggleSubclass } =
    useSubclassFilters(classId);

  // Only offer subclasses that actually have a weapon this phase — e.g. there are
  // no Launchers before Hardmode. A stored subclass that isn't available here (or
  // no longer exists at all) falls back to "All" rather than showing an empty list.
  const availableSubclasses = classDef.subclasses.filter((s) =>
    safeLoadout.weapons.some((w) => w.subclass === s.id),
  );
  const validSubclasses = new Set(availableSubclasses.map((s) => s.id));
  const activeSubclasses = new Set(
    [...selectedSubclassSet].filter((s) => validSubclasses.has(s)),
  );
  const showingAll = activeSubclasses.size === 0;

  const matchSub = (w: Item) => showingAll || !w.subclass || activeSubclasses.has(w.subclass);
  const inScope = safeLoadout.weapons.filter(matchSub);
  // "All" is an overview: just the best in slot from each subclass. Picking a
  // subclass opens it up to the viable alternates, with the rest behind a toggle.
  const filteredBest = inScope.filter((w) => w.tier === 'best');
  const filteredAlso = showingAll ? [] : inScope.filter((w) => w.tier === 'good');
  const filteredRest = showingAll ? [] : inScope.filter((w) => w.tier === 'other');

  const armorSprite = safeLoadout.armor[0]?.icon;
  const armorImg = armorSprite ? iconSrcs(armorSprite) : null;

  // Accessory slots: always 5, plus a 6th "Demon Heart" slot in Expert/Master hardmode.
  const demonHeartUnlocked = HARDMODE_PHASES.has(phaseId) && (difficulty === 'expert' || difficulty === 'master');
  const slotCount = demonHeartUnlocked ? 6 : 5;
  const accSlots = Array.from({ length: slotCount }, (_, i) => safeLoadout.accessories[i] ?? null);
  const extraAccessories = safeLoadout.accessories.slice(slotCount);


  return (
    <div className={styles.page}>
      <div
        className={styles.backdrop}
        style={{ backgroundImage: `url(${BASE}biomes/${PHASE_BIOME[phaseId]}.png)` }}
        aria-hidden="true"
      />
      <div className={styles.backdropWash} aria-hidden="true" />

      <Header variant="photo" />
      <section className={styles.wrap}>

        {/* Header row: title + class rail */}
        <div className={styles.pageHead}>
          <div>
            <p className={styles.kick}>Class Loadouts</p>
            <h1 className={styles.title}>{classDef.name} <em>· {phaseName}</em></h1>
            <p className={styles.lede}>Pick your class and stage. Armor and accessory picks update with every choice.</p>
          </div>
          <div className={styles.classRail} role="group" aria-label="Select class">
            {classes.map((cls) => (
              <button
                key={cls.id}
                type="button"
                className={`${styles.cbtn} pixel-frame ${cls.id === classId ? styles.on : ''}`}
                aria-pressed={cls.id === classId}
                onClick={() => { setClassId(cls.id as ClassId); clearSubclassFilters(); setShowRest(false); }}
              >
                <img
                  src={`${BASE}icons/classes/${cls.id}.png`}
                  alt="" aria-hidden="true"
                  className={`${styles.cdot} pixel-img`}
                  width="28" height="28" loading="lazy"
                  onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }}
                />
                <span className={styles.cbtnLabel}>{cls.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Boss progression map */}
        <div className={styles.bossmap} role="group" aria-label="Select phase">
          {phases.map((p, i) => {
            const done = p.order < activeOrder;
            const active = p.id === phaseId;
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
                <span className={styles.wpDisc}>
                  <img
                    src={`${BASE}icons/bosses/${PHASE_BOSS[p.id as PhaseId]}.png`}
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
        <div key={phaseId} className={`${styles.banner} pixel-frame`}>
          <img
            src={`${BASE}icons/bosses/${PHASE_BOSS[phaseId]}.png`}
            alt="" aria-hidden="true"
            className={`${styles.bannerIcon} pixel-img`}
            width="44" height="44"
            onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }}
          />
          <div>
            <span className={styles.bannerName}>{phaseName}</span>
            {phaseDef && <span className={styles.bannerHint}>{phaseDef.triggeredBy}</span>}
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
                  className={`${styles.subclassChip} ${showingAll ? styles.on : ''}`}
                  onClick={() => { clearSubclassFilters(); setShowRest(false); }}
                  aria-pressed={showingAll}
                >
                  All
                </button>
                {availableSubclasses.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    className={`${styles.subclassChip} ${activeSubclasses.has(sc.id) ? styles.on : ''}`}
                    aria-pressed={activeSubclasses.has(sc.id)}
                    onClick={() => { toggleSubclass(sc.id); setShowRest(false); }}
                  >
                    {sc.name}
                  </button>
                ))}
              </div>
            )}

            {filteredBest.length > 0 && (
              <>
                <div className={styles.groupLabel}>Best in Slot</div>
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

            {filteredRest.length > 0 && (
              <>
                <button
                  type="button"
                  className={styles.showRest}
                  aria-expanded={showRest}
                  onClick={() => setShowRest((v) => !v)}
                >
                  {showRest ? 'Hide' : 'Show'} {filteredRest.length} other{filteredRest.length === 1 ? '' : 's'}
                </button>
                {showRest && (
                  <div className={styles.weaponRow}>
                    {filteredRest.map((w) => <WeaponTile key={w.id} item={w} difficulty={difficulty} onOpen={setModalItem} />)}
                  </div>
                )}
              </>
            )}

            {filteredBest.length === 0 && filteredAlso.length === 0 && filteredRest.length === 0 && (
              <p className={styles.empty}>No weapons match your filters for this phase.</p>
            )}
          </div>

          {/* Reforge — hugs the weapons panel */}
          <div className={`${styles.invPanel} ${styles.reforgePanel} pixel-frame`}>
            {extraAccessories.length > 0 && (
              <div className={styles.accAlts}>
                <span className={styles.accAltsLabel}>Also good:</span>
                {extraAccessories.map((a) => (
                  <button key={a.id} type="button" className={styles.accAlt} onClick={() => setModalItem(a)}>{a.name}</button>
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
                <div className={styles.armorDoll}>
                  <img
                    src={armorImg.local} alt={safeLoadout.armor[0]?.name ?? ''}
                    className={`${styles.armorSprite} pixel-img`}
                    width="44" height="44" loading="lazy"
                    onError={makeErrorHandler(armorImg.wiki, FALLBACK_ICON)}
                  />
                </div>
                <div className={styles.armorInfo}>
                  {/* only the set for this class; a second entry means a world
                      variant (Adamantite/Titanium) or the Spectre Hood choice */}
                  {safeLoadout.armor.map((a) => (
                    <button key={a.id} type="button" className={styles.armorEntry} onClick={() => setModalItem(a)}>
                      <div className={styles.armorName}>{a.name}</div>
                      {a.pieces && a.pieces.length > 0 && (
                        <div className={styles.armorPieces}>
                          {a.headpiece && <span className={styles.armorHeadTag}>{classDef.name}</span>}
                          {a.pieces.map((p) => (
                            <span
                              key={p}
                              className={`${styles.armorPiece} ${p === a.headpiece ? styles.armorPieceHead : ''}`}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                      {a.why && <div className={styles.armorPerk}>{a.why}</div>}
                    </button>
                  ))}
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
