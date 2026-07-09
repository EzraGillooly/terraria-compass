import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { bosses, type BossDef } from '../data/bosses';
import styles from './Bosses.module.css';

const BASE = import.meta.env.BASE_URL;

const STAGE_ORDER = [
  'pre-bosses', 'pre-skeletron', 'pre-wof',
  'pre-mech', 'pre-plantera', 'pre-golem',
  'pre-cultist', 'pre-moonlord', 'endgame',
] as const;

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

// Everything from the mechanical bosses onward is hardmode (past the Wall of Flesh).
const HARDMODE_STAGES = new Set(['pre-mech', 'pre-plantera', 'pre-golem', 'pre-cultist', 'pre-moonlord', 'endgame']);

// Bosses grouped by stage, main bosses on the line first, optional/side bosses after.
const STAGES = STAGE_ORDER.map((stage) => {
  const inStage = bosses.filter((b) => b.stage === stage).sort((a, b) => a.tier - b.tier);
  return {
    stage,
    hard: HARDMODE_STAGES.has(stage),
    nodes: [...inStage.filter((b) => !b.side), ...inStage.filter((b) => b.side)],
  };
});
type Stage = (typeof STAGES)[number];

const PRE_HARD = STAGES.filter((s) => !s.hard);
const HARD = STAGES.filter((s) => s.hard);
const FLAT = STAGES.flatMap((s) => s.nodes);

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
  const [selectedId, setSelectedId] = useState<string>('eye-of-cthulhu');
  const [showHardmode, setShowHardmode] = useState(false);
  const selected = useMemo(() => FLAT.find((b) => b.id === selectedId) ?? FLAT[0]!, [selectedId]);

  // Switch the whole rail between the pre-hardmode and hardmode sets.
  const setPhase = (hard: boolean) => {
    if (hard === showHardmode) return;
    const selIsHard = HARDMODE_STAGES.has(selected.stage);
    if (hard && !selIsHard) setSelectedId(HARD[0]!.nodes[0]!.id);
    if (!hard && selIsHard) setSelectedId('eye-of-cthulhu');
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
      {/* Full-page biome backdrop — underworld for pre-hardmode, hallow for hardmode */}
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
          <div className={styles.phaseToggle} role="tablist" aria-label="Progression phase">
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
            {(showHardmode ? HARD : PRE_HARD).map(renderStage)}
          </div>
        </div>
        <p className={styles.scrollHint}>Tap a boss for its summon method and key drops</p>

        {/* ── Detail panel ── */}
        <div className={styles.detail} style={{ ['--boss' as string]: selected.color }}>
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
              {selected.side && <span className={styles.tagOpt}>Optional</span>}
              {worldLabel(selected) && <span className={styles.tagWorld}>{worldLabel(selected)}</span>}
              <span className={styles.detailStage}>{STAGE_LABELS[selected.stage]}</span>
            </div>
            <p className={styles.detailBlurb}>{selected.blurb}</p>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Summon</span>
              <span className={styles.detailVal}>{selected.summon}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Key Drops</span>
              <span className={styles.drops}>
                {selected.drops.map((d) => <span key={d} className={styles.dropPill}>{d}</span>)}
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
