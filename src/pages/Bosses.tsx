import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { bosses, type BossDef } from '../data/bosses';
import styles from './Bosses.module.css';

const STAGE_ORDER = [
  'pre-bosses', 'pre-skeletron', 'pre-wof',
  'pre-mech', 'pre-plantera', 'pre-golem',
  'pre-cultist', 'pre-moonlord', 'endgame',
] as const;

const STAGE_LABELS: Record<string, string> = {
  'pre-bosses':    'Pre-Bosses',
  'pre-skeletron': 'Pre-Skeletron',
  'pre-wof':       'Pre-Wall of Flesh',
  'pre-mech':      'Hardmode — Mechs',
  'pre-plantera':  'Pre-Plantera',
  'pre-golem':     'Pre-Golem',
  'pre-cultist':   'Pre-Cultist',
  'pre-moonlord':  'Pre-Moon Lord',
  'endgame':       'Endgame',
};

const BASE = import.meta.env.BASE_URL;

function BossCard({ boss }: { boss: BossDef }) {
  const [open, setOpen] = useState(false);
  const localIcon = `${BASE}icons/bosses/${boss.id}.png`;

  return (
    <div
      className={styles.bossCard}
      style={{ '--boss-c': boss.color } as React.CSSProperties}
    >
      <div className={styles.bossCardHead}>
        <div className={styles.bossIcon}>
          <img
            src={localIcon}
            alt=""
            aria-hidden="true"
            width="36"
            height="36"
            className="pixel-img"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        <div className={styles.bossInfo}>
          {boss.side && <span className={styles.bossLabel}>Optional</span>}
          {boss.world && <span className={styles.bossLabel}>{boss.world === 'corruption' ? 'Corruption only' : 'Crimson only'}</span>}
          <div className={styles.bossName}>{boss.name}</div>
        </div>
        <button
          type="button"
          className={`${styles.bossToggle} ${open ? styles.open : ''}`}
          aria-expanded={open}
          aria-label={`${open ? 'Hide' : 'Show'} ${boss.name} details`}
          onClick={() => setOpen((v) => !v)}
        >
          ▾
        </button>
      </div>

      <p className={styles.bossBlurb}>{boss.blurb}</p>

      {open && (
        <div className={styles.bossMeta}>
          <div className={styles.bossRow}>
            <span className={styles.bossRowKey}>Summon</span>
            <span className={styles.bossRowVal}>{boss.summon}</span>
          </div>
          <div className={styles.bossRow}>
            <span className={styles.bossRowKey}>Key Drops</span>
            <div className={styles.dropPills}>
              {boss.drops.map((d) => (
                <span key={d} className={styles.dropPill}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Bosses() {
  const [activeStage, setActiveStage] = useState<string>('pre-bosses');
  const stageBosses = bosses.filter((b) => b.stage === activeStage);
  const main  = stageBosses.filter((b) => !b.side);
  const sides = stageBosses.filter((b) => b.side);

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      {/* ── Banner ── */}
      <div className={styles.banner}>
        <div className={styles.bannerPhoto} />
        <div className={styles.bannerWash} />
        <Header variant="photo" />
        <div className={styles.bannerBody}>
          <p className={styles.bannerCrumb}>
            <a href="/#/">Home</a> › Boss Progression
          </p>
          <h1 className={styles.bannerTitle}>
            Boss <em>Progression</em>
          </h1>
          <p className={styles.bannerLede}>
            Every boss, in order. Summon methods, key drops, and what each fight unlocks.
          </p>
        </div>
      </div>

      {/* ── Stage selector ── */}
      <section className={styles.section}>
        <div className={styles.stageTrack}>
          {STAGE_ORDER.map((stage) => {
            const count = bosses.filter((b) => b.stage === stage).length;
            return (
              <button
                key={stage}
                type="button"
                className={`${styles.stageNode} ${activeStage === stage ? styles.active : ''}`}
                onClick={() => setActiveStage(stage)}
                aria-pressed={activeStage === stage}
              >
                <span className={styles.nodeDot} aria-hidden="true" />
                <span className={styles.nodeLabel}>{STAGE_LABELS[stage]}</span>
                <span className={styles.nodeCount}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── Boss columns ── */}
        <div className={styles.stageHeader}>
          <span className={styles.stageTag}>{STAGE_LABELS[activeStage]}</span>
        </div>

        <div className={styles.bossColumns}>
          <div className={styles.bossCol}>
            <div className={styles.bossColTitle}>
              {main.length > 0 ? 'Main Bosses' : 'No main bosses this stage'}
            </div>
            <div className={styles.bossGrid}>
              {main.map((b) => <BossCard key={b.id} boss={b} />)}
              {main.length === 0 && (
                <p className={styles.empty}>No required bosses in this stage.</p>
              )}
            </div>
          </div>

          {sides.length > 0 && (
            <div className={styles.bossCol}>
              <div className={styles.bossColTitle}>Optional / Side Bosses</div>
              <div className={styles.bossGrid}>
                {sides.map((b) => <BossCard key={b.id} boss={b} />)}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
