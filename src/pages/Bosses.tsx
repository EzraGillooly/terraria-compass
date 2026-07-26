import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { usePack } from '../lib/app-context';
import type { BossDef } from '../data/bosses';
import styles from './Bosses.module.css';

const BASE = import.meta.env.BASE_URL;

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

function BossSlot({
  boss, selected, onSelect,
}: { boss: BossDef; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      className={`${styles.node} ${boss.side ? styles.side : ''} ${selected ? styles.selected : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className={styles.slot} style={{ ['--boss' as string]: boss.color }}>
        <img
          src={`${BASE}icons/bosses/${boss.id}.png`}
          alt=""
          aria-hidden="true"
          width="40"
          height="40"
          className="pixel-img"
          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
        />
      </span>
      <span className={styles.nodeName}>{boss.name}</span>
    </button>
  );
}

export function Bosses() {
  const { phases, bosses } = usePack();
  const [selectedId, setSelectedId] = useState<string>('eye-of-cthulhu');
  const [showHardmode, setShowHardmode] = useState(false);

  // Bosses grouped by the active pack's phases, main bosses on the line first,
  // optional/side bosses after. Recomputed when the pack changes.
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
        nodes: [...inStage.filter((b) => !b.side), ...inStage.filter((b) => b.side)],
      };
    });
  }, [phases, bosses, isHard]);

  const preHard = useMemo(() => stages.filter((s) => !s.hard), [stages]);
  const hardStages = useMemo(() => stages.filter((s) => s.hard), [stages]);
  const flat = useMemo(() => stages.flatMap((s) => s.nodes), [stages]);
  const selected = useMemo(() => flat.find((b) => b.id === selectedId) ?? flat[0]!, [flat, selectedId]);

  // Switch the whole rail between the pre-hardmode and hardmode sets.
  const setPhase = (hard: boolean) => {
    if (hard === showHardmode) return;
    const selIsHard = isHard(selected.stage);
    if (hard && !selIsHard) setSelectedId(hardStages[0]?.nodes[0]?.id ?? selectedId);
    if (!hard && selIsHard) setSelectedId(preHard[0]?.nodes[0]?.id ?? selectedId);
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
              onSelect={() => setSelectedId(boss.id)}
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
            The whole road from your first fight to the Moon Lord, left to right. Pick any boss for its
            summon method and key drops.
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
              className={`${styles.phaseBtn} ${!showHardmode ? styles.phasePre : ''}`}
              onClick={() => setPhase(false)}
            >
              Pre-Hardmode
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={showHardmode}
              className={`${styles.phaseBtn} ${showHardmode ? styles.phaseHard : ''}`}
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
          <div className={styles.detailIcon}>
            <img
              src={`${BASE}icons/bosses/${selected.id}.png`}
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
              <span className={styles.detailVal}>{selected.summon}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Unlocks</span>
              <span className={styles.detailVal}>
                {selected.unlocks ?? 'No world progression. Fight it for the drops, or skip it.'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Key Drops</span>
              <span className={styles.drops}>
                {selected.drops.map((d) => <span key={d} className={`${styles.dropPill} pixel-frame`}>{d}</span>)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.footerLayer}>
        <Footer flush />
      </div>
    </div>
  );
}
