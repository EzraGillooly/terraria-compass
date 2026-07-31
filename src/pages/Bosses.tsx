import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ItemModal } from '../components/ItemModal/ItemModal';
import { usePack, useAppState } from '../lib/app-context';
import type { BossDef, BossDrop } from '../data/bosses';
import type { Item } from '../data/schema';
import styles from './Bosses.module.css';

const BASE = import.meta.env.BASE_URL;

/* Bridge a boss drop / summon item into the shape the shared ItemModal wants, so
   a drop opens the same card weapons do. slot is cast because a drop's type
   ("vanity", "summon", ...) is broader than a loadout item's slot enum - the
   modal only uses it for a label and falls back to the raw string. */
function dropToItem(d: BossDrop): Item {
  return {
    id: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: d.name,
    slot: (d.slot ?? 'accessory') as Item['slot'],
    icon: d.icon,
    source: d.source ?? '',
    why: '',
    effect: d.effect,
    stats: d.stats,
    dropRate: d.dropRate,
    subclass: d.subclass,
    materials: d.materials,
    wikiUrl: d.wikiUrl,
    tags: [],
    topPick: false,
    tier: 'good',
  } as Item;
}

const isDrop = (d: string | BossDrop): d is BossDrop => typeof d === 'object';

/* Whether the current world/Calamity settings can actually get this drop. A drop
   with no `mode` drops in every mode; the rest are gated so a Classic world greys
   its Expert-bag items, and so on. */
function dropObtainable(mode: BossDrop['mode'], difficulty: string, calamityMode: string): boolean {
  if (!mode) return true;
  if (mode === 'expert') return difficulty === 'expert';
  if (mode === 'revengeance') return calamityMode === 'revengeance' || calamityMode === 'death';
  if (mode === 'death') return calamityMode === 'death';
  return false; // master - not modeled by the difficulty filter
}

const LOCK_LABEL: Record<NonNullable<BossDrop['mode']>, string> = {
  expert: 'Expert worlds only',
  revengeance: 'Revengeance or Death only',
  death: 'Death Mode only',
  master: 'Master Mode only',
};

// Display labels for the detail-panel stage tag. Falls back to the phase name for
// stages not listed here (e.g. a mod's own stages).
// Required reads as a hard gate, so it takes the plain accent; recommended and
// optional are the ones a player can act on, so they keep the warm/sky tags.
const ROLE_TAG: Record<NonNullable<BossDef['role']>, string> = {
  required: 'tagReq',
  recommended: 'tagRec',
  optional: 'tagOpt',
};

const STAGE_LABELS: Record<string, string> = {
  'pre-bosses':    'Pre-Bosses',
  'pre-skeletron': 'Pre-Skeletron',
  'pre-wof':       'Pre-Wall of Flesh',
  'pre-mech':      'Hardmode · Mechs',
  'pre-plantera':  'Pre-Plantera',
  'pre-golem':     'Pre-Golem',
  'pre-cultist':   'Pre-Cultist',
  'pre-moonlord':  'Pre-Moon Lord',
  'endgame':       'Endgame',
};

interface Stage {
  stage: string;
  hard: boolean;
  nodes: BossDef[];
}

function worldLabel(boss: BossDef): string | null {
  if (!boss.world) return null;
  return boss.world === 'corruption' ? 'Corruption only' : 'Crimson only';
}

/** Progression Mode lock state for a roadmap node. null = mode off (all open). */
type LockState = 'passed' | 'next' | 'locked' | null;

function BossSlot({
  boss, selected, onSelect, lock, unlocking,
}: {
  boss: BossDef; selected: boolean; onSelect: () => void;
  lock: LockState; unlocking: boolean;
}) {
  const locked = lock === 'locked';        // fully locked: dimmed + disabled
  const isNext = lock === 'next';          // frontier: looks locked at rest, lights up on hover, click unlocks
  const hasLock = locked || isNext || unlocking;  // padlock at rest, plus the brief fade-out after a click
  const title = locked
    ? `${boss.name} - locked (reach the previous boss first)`
    : isNext ? `${boss.name} - click to unlock`
    : boss.side ? `${boss.name} - optional` : boss.name;
  return (
    <button
      type="button"
      className={`${styles.node} ${boss.side ? styles.side : ''} ${selected ? styles.selected : ''} ${
        locked ? styles.locked : isNext ? styles.next : lock === 'passed' ? styles.passed : ''
      } ${unlocking ? styles.unlocking : ''}`}
      onClick={onSelect}
      disabled={locked}
      aria-pressed={selected}
      title={title}
    >
      <span className={`${styles.slot} pixel-frame`} style={{ ['--boss' as string]: boss.color }}>
        <img
          src={`${BASE}icons/bosses/${boss.id}-map.png`}
          alt=""
          aria-hidden="true"
          width="40"
          height="40"
          className="pixel-img"
          /* Prefer the small map-marker sprite; fall back to the full boss
             sprite when a boss has no map icon yet, then hide if neither loads. */
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src.includes('-map.png')) img.src = `${BASE}icons/bosses/${boss.id}.png`;
            else img.style.visibility = 'hidden';
          }}
        />
        {hasLock && (
          <span className={styles.lockBadge} aria-hidden="true">
            {/* Closed at rest; on a `next` node hover swaps to the open padlock. */}
            <svg className={styles.lockClosed} viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm3 8H9V6a3 3 0 0 1 6 0z" />
            </svg>
            <svg className={styles.lockOpen} viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12 1a5 5 0 0 0-5 5 1 1 0 0 0 2 0 3 3 0 0 1 6 0v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5z" />
            </svg>
          </span>
        )}
      </span>
      <span className={styles.nodeName}>
        {boss.name}
        {boss.side && <span className="sr-only"> (optional)</span>}
        {locked && <span className="sr-only"> (locked)</span>}
      </span>
    </button>
  );
}

export function Bosses() {
  const { phases, bosses } = usePack();
  const { difficulty, calamityMode, progressionMode, progress, setProgress } = useAppState();
  // Empty by default so the selection resolves to the first boss in the active
  // pack's order (see `selected` below) rather than a hardcoded vanilla boss.
  const [selectedId, setSelectedId] = useState<string>('');
  const [showHardmode, setShowHardmode] = useState(false);
  const [modalItem, setModalItem] = useState<Item | null>(null);

  // Bosses grouped by the active pack's phases, optional ones first within each
  // stage so they read before the boss that gates progress. Recomputed when the
  // pack changes.
  // Hardmode begins at the phase after "Pre-Wall of Flesh" (works for any pack).
  const isHard = useMemo(() => {
    const wofOrder = phases.find((p) => /wall of flesh/i.test(p.name))?.order ?? Infinity;
    const orderOf = (id: string) => phases.find((p) => p.id === id)?.order ?? 0;
    return (stageId: string) => orderOf(stageId) > wofOrder;
  }, [phases]);

  const stages: Stage[] = useMemo(() => {
    const order = [...phases].sort((a, b) => a.order - b.order).map((p) => p.id);
    return order.map((stage) => {
      const inStage = bosses.filter((b) => b.stage === stage).sort((a, b) => a.tier - b.tier);
      return {
        stage,
        hard: isHard(stage),
        nodes: [...inStage.filter((b) => b.side), ...inStage.filter((b) => !b.side)],
      };
    });
  }, [phases, bosses, isHard]);

  const preHard = useMemo(() => stages.filter((s) => !s.hard), [stages]);
  const hardStages = useMemo(() => stages.filter((s) => s.hard), [stages]);
  const flat = useMemo(() => stages.flatMap((s) => s.nodes), [stages]);

  // Progression Mode: `progress` is the furthest boss reached. With nothing
  // saved yet the first boss is already the starting point (index 0), so it
  // reads as reached and the second boss is immediately clickable.
  const reachedIndex = useMemo(() => {
    if (!progress) return 0;
    const i = flat.findIndex((b) => b.id === progress);
    return i >= 0 ? i : 0;
  }, [flat, progress]);
  const lockFor = (bossId: string): LockState => {
    if (!progressionMode) return null;
    const i = flat.findIndex((b) => b.id === bossId);
    if (i <= reachedIndex) return 'passed';
    if (i === reachedIndex + 1) return 'next';
    return 'locked';
  };

  // When Progression Mode is on the selection can only rest on a reached boss -
  // the current one (reachedIndex) or an earlier one being reviewed. Clicking the
  // next boss advances first, so it is reached by the time it becomes selected.
  // This also means a reset (reachedIndex → 0) snaps the selection to the first
  // boss rather than leaving it on whatever was open.
  const selected = useMemo(() => {
    const pick = flat.find((b) => b.id === selectedId) ?? flat[0]!;
    if (!progressionMode) return pick;
    const maxIdx = Math.min(reachedIndex, flat.length - 1);
    const pickIdx = flat.findIndex((b) => b.id === pick.id);
    return pickIdx <= maxIdx ? pick : (flat[maxIdx] ?? pick);
  }, [flat, selectedId, progressionMode, reachedIndex]);

  // Clicking the next (frontier) boss reaches it, unlocking the one after. It
  // advances at once (so the ring settles to the selected gold), while a brief
  // `unlocking` flag keeps the padlock mounted so it can fade out - the CSS then
  // eases the ring green→gold and the lock to nothing. A passed boss just opens
  // for review; locked nodes are disabled, so they never fire.
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const onSelectBoss = (boss: BossDef) => {
    setSelectedId(boss.id);
    if (progressionMode && flat.findIndex((b) => b.id === boss.id) === reachedIndex + 1) {
      setProgress(boss.id);
      setUnlockingId(boss.id);
      window.setTimeout(() => setUnlockingId((cur) => (cur === boss.id ? null : cur)), 450);
    }
  };

  // Switch the whole rail between the pre-hardmode and hardmode sets.
  const setPhase = (hard: boolean) => {
    if (hard === showHardmode) return;
    const selIsHard = isHard(selected.stage);
    const firstMain = (list: Stage[]) => {
      const nodes = list[0]?.nodes ?? [];
      return (nodes.find((b) => !b.side) ?? nodes[0])?.id;
    };
    if (hard && !selIsHard) setSelectedId(firstMain(hardStages) ?? selectedId);
    if (!hard && selIsHard) setSelectedId(firstMain(preHard) ?? selectedId);
    setShowHardmode(hard);
  };

  const renderStage = (s: Stage) => (
    <div key={s.stage}>
      <div className={styles.stageCol} data-hard={s.hard}>
        <div className={styles.stageNodes}>
          {s.nodes.map((boss) => (
            <BossSlot
              key={boss.id}
              boss={boss}
              selected={boss.id === selected.id}
              onSelect={() => onSelectBoss(boss)}
              lock={lockFor(boss.id)}
              unlocking={unlockingId === boss.id}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Full-page biome backdrop - underworld for pre-hardmode, hallow for hardmode */}
      <div
        className={styles.backdrop}
        style={{ backgroundImage: `url(${BASE}biomes/${showHardmode ? 'hallow' : 'underworld'}.png)` }}
        aria-hidden="true"
      />
      <div className={styles.backdropWash} aria-hidden="true" />

      {/* ── Hero ── */}
      <section className={styles.hero} aria-label="Boss Progression">
        <Header variant="photo" />
        <div className={styles.heroBody}>
          <p className={styles.crumb}>
            <Link to="/">Home</Link> <span className={styles.crumbSep}>/</span> Boss Progression
          </p>
          <h1 className={styles.heroTitle}>Boss <em>Progression</em></h1>
          <p className={styles.heroLede}>
            Every boss in progression order, left to right. Select one for its summon
            method and key drops.
          </p>
        </div>
      </section>

      {/* ── Scroll rail ── */}
      <section className={styles.railSection} aria-label="Boss order timeline">
        <div className={styles.phaseBar}>
          <div className={`${styles.phaseToggle} pixel-frame pixel-hollow`} role="tablist" aria-label="Progression phase">
            <button
              type="button"
              role="tab"
              aria-selected={!showHardmode}
              className={`${styles.phaseBtn} ${!showHardmode ? `${styles.phasePre} pixel-frame` : ''}`}
              onClick={() => setPhase(false)}
            >
              Pre-Hardmode
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={showHardmode}
              className={`${styles.phaseBtn} ${showHardmode ? `${styles.phaseHard} pixel-frame` : ''}`}
              onClick={() => setPhase(true)}
            >
              Hardmode
            </button>
          </div>
        </div>

        <div className={styles.railScroll}>
          <div className={styles.rail}>
            {(showHardmode ? hardStages : preHard).map(renderStage)}
          </div>
        </div>
        <p className={styles.scrollHint}>Tap a boss for its summon method and key drops</p>

        {/* ── Detail panel ── */}
        <div className={`${styles.detail} pixel-frame pixel-hollow`} style={{ ['--boss' as string]: selected.color }}>
          <div className={`${styles.detailIcon} pixel-frame`}>
            {/* the big card shows the animated sprite where one exists; key on the
                boss id so React swaps the <img> (and restarts the gif) per boss */}
            <img
              key={selected.id}
              src={`${BASE}icons/bosses/${selected.id}.${selected.animated ? 'gif' : 'png'}`}
              alt={selected.name}
              width="64"
              height="64"
              className="pixel-img"
              onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
            />
          </div>
          <div className={styles.detailBody}>
            <div className={styles.detailHead}>
              <h2 className={styles.detailName}>{selected.name}</h2>
              {selected.role && (
                <span className={`${styles[ROLE_TAG[selected.role]]} pixel-frame`}>
                  {selected.role}
                </span>
              )}
              {worldLabel(selected) && <span className={`${styles.tagWorld} pixel-frame`}>{worldLabel(selected)}</span>}
              <span className={styles.detailStage}>
                {STAGE_LABELS[selected.stage] ?? phases.find((p) => p.id === selected.stage)?.name ?? selected.stage}
              </span>
            </div>
            <p className={styles.detailBlurb}>{selected.blurb}</p>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Summon</span>
              <span className={styles.detailVal}>
                {(() => {
                  const it = selected.summonItem;
                  if (!it) return selected.summon;
                  const link = (
                    <button
                      key="summon-link"
                      type="button"
                      className={styles.summonLink}
                      onClick={() => setModalItem(dropToItem(it))}
                    >
                      {it.name}
                    </button>
                  );
                  // If the prose names the item, link that word in place;
                  // otherwise lead with the link and an en dash.
                  const at = selected.summon.indexOf(it.name);
                  if (at >= 0) {
                    return (
                      <>
                        {selected.summon.slice(0, at)}
                        {link}
                        {selected.summon.slice(at + it.name.length)}
                      </>
                    );
                  }
                  return <>{link}{' – '}{selected.summon}</>;
                })()}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Unlocks</span>
              <span className={styles.detailVal}>
                {selected.unlocks ?? 'No world progression. Fight it for the drops, or skip it.'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Drops</span>
              <span className={styles.drops}>
                {selected.drops.map((d) => {
                  if (!isDrop(d)) return <span key={d} className={`${styles.dropPill} pixel-frame`}>{d}</span>;
                  const locked = !dropObtainable(d.mode, difficulty, calamityMode);
                  return (
                    <button
                      key={d.name}
                      type="button"
                      className={`${styles.dropPill} ${styles.dropPillBtn} ${locked ? styles.dropLocked : ''} pixel-frame`}
                      title={locked && d.mode ? LOCK_LABEL[d.mode] : undefined}
                      onClick={() => setModalItem(dropToItem(d))}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <ItemModal item={modalItem} onClose={() => setModalItem(null)} />

      <div className={styles.footerLayer}>
        <Footer flush />
      </div>
    </div>
  );
}
