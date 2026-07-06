import { useState } from 'react';
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

const orderedBosses = STAGE_ORDER.flatMap((stage) => {
  const inStage = bosses.filter((b) => b.stage === stage);
  const main = inStage.filter((b) => !b.side);
  const sides = inStage.filter((b) => b.side);
  return [...main, ...sides].map((boss) => ({ boss, stage }));
});

function BossNode({ boss, stage }: { boss: BossDef; stage: string }) {
  const [open, setOpen] = useState(false);
  const localIcon = `${BASE}icons/bosses/${boss.id}.png`;
  const worldLabel = boss.world
    ? (boss.world === 'corruption' ? 'Corruption only' : 'Crimson only')
    : null;

  return (
    <li className={styles.node}>
      <span className={styles.dot} aria-hidden="true" />
      <div className={styles.card}>
        <button
          type="button"
          className={styles.cardHead}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.icon}>
            <img
              src={localIcon}
              alt=""
              aria-hidden="true"
              width="40"
              height="40"
              className="pixel-img"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </span>
          <span className={styles.info}>
            <span className={styles.name}>
              {boss.name}
              {boss.side && <span className={styles.tagOpt}>Optional</span>}
              {worldLabel && <span className={styles.tagWorld}>{worldLabel}</span>}
            </span>
            <span className={styles.blurb}>{boss.blurb}</span>
          </span>
          <span className={styles.stage}>{STAGE_LABELS[stage]}</span>
          <span className={`${styles.chev} ${open ? styles.chevOpen : ''}`} aria-hidden="true">▾</span>
        </button>

        {open && (
          <div className={styles.meta}>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Summon</span>
              <span className={styles.metaVal}>{boss.summon}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Key Drops</span>
              <span className={styles.drops}>
                {boss.drops.map((d) => <span key={d} className={styles.dropPill}>{d}</span>)}
              </span>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

export function Bosses() {
  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${BASE}hero/bosses.png)` }}
        aria-label="Boss Progression"
      >
        <div className={styles.heroWash} aria-hidden="true" />
        <Header variant="photo" />
        <div className={styles.heroBody}>
          <p className={styles.crumb}>
            <Link to="/">Home</Link> <span className={styles.crumbSep}>/</span> Boss Progression
          </p>
          <h1 className={styles.heroTitle}>Boss <em>Progression</em></h1>
          <p className={styles.heroLede}>
            The road from your first fight to the Moon Lord. Tap any boss for summon methods and key drops.
          </p>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className={styles.roadWrap} aria-label="Boss order">
        <ol className={styles.road}>
          {orderedBosses.map(({ boss, stage }) => (
            <BossNode key={boss.id} boss={boss} stage={stage} />
          ))}
        </ol>
      </section>

      <Footer />
    </div>
  );
}
