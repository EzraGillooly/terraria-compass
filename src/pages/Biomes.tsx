import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BestiaryModal } from '../components/BestiaryModal/BestiaryModal';
import { biomes } from '../data/biomes';
import type { BiomeDef } from '../data/biomes';
import { bestiary, type BestiaryEntry } from '../data/bestiary';
import styles from './Biomes.module.css';

const BASE = import.meta.env.BASE_URL;

function DangerMeter({ level }: { level: number }) {
  return (
    <span className={styles.danger} aria-label={`Danger level ${level} of 5`}>
      <span className={styles.dangerCap}>Danger</span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`${styles.pip} ${i < level ? styles.pipOn : ''}`} aria-hidden="true" />
      ))}
    </span>
  );
}

function Chip({ name, kind, onOpen }: { name: string; kind: 'enemy' | 'loot'; onOpen: (e: BestiaryEntry) => void }) {
  const entry = bestiary[name];
  const Mark = kind === 'enemy' ? SwordMark : GemMark;
  const cls = `${styles.chip} ${kind === 'enemy' ? styles.enemy : styles.loot}`;

  if (!entry) return <span className={cls}><Mark />{name}</span>;
  return (
    <button type="button" className={`${cls} ${styles.chipBtn}`} onClick={() => onOpen(entry)}>
      <Mark />{name}
    </button>
  );
}

function BiomeBand({ biome, onOpen }: { biome: BiomeDef; onOpen: (e: BestiaryEntry) => void }) {
  const gradient = `linear-gradient(135deg, ${biome.palette.deep} 0%, ${biome.palette.sky} 100%)`;

  return (
    <article className={styles.band}>
      <div className={styles.art} style={{ background: gradient }}>
        <img
          src={`${BASE}biomes/${biome.id}.png`}
          alt=""
          aria-hidden="true"
          className={styles.artImg}
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className={styles.artWash} aria-hidden="true" />
        <div className={styles.artText}>
          <h2 className={styles.bandName}>
            {biome.name}
            {biome.hardmodeOnly && <span className={styles.hmTag}>Hardmode</span>}
          </h2>
          <p className={styles.bandBlurb}>{biome.blurb}</p>
          <DangerMeter level={biome.danger} />
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.colh}>Enemies</div>
        <div className={styles.chips}>
          {biome.mobs.map((mob) => (
            <Chip key={mob} name={mob} kind="enemy" onOpen={onOpen} />
          ))}
        </div>
        <div className={`${styles.colh} ${styles.colhLoot}`}>Notable Loot</div>
        <div className={styles.chips}>
          {biome.items.map((item) => (
            <Chip key={item} name={item} kind="loot" onOpen={onOpen} />
          ))}
        </div>
      </div>
    </article>
  );
}

export function Biomes() {
  const [entry, setEntry] = useState<BestiaryEntry | null>(null);

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${BASE}hero/biomes.png)` }}
        aria-label="Biomes and Bestiary"
      >
        <div className={styles.heroWash} aria-hidden="true" />
        <Header variant="photo" />
        <div className={styles.heroBody}>
          <p className={styles.crumb}>
            <Link to="/">Home</Link> <span className={styles.crumbSep}>/</span> Biomes &amp; Bestiary
          </p>
          <h1 className={styles.heroTitle}>Biomes &amp; <em>Bestiary</em></h1>
          <p className={styles.heroLede}>
            Every environment, its mobs, and the loot worth farming. Scroll the world from safe to deadly.
          </p>
        </div>
      </section>

      {/* ── Scene bands ── */}
      <section className={styles.bandWrap} aria-label="Biomes">
        {biomes.map((biome) => <BiomeBand key={biome.id} biome={biome} onOpen={setEntry} />)}
      </section>

      <BestiaryModal entry={entry} onClose={() => setEntry(null)} />

      <Footer />
    </div>
  );
}

/* Tiny pixel-art markers (no emoji) */
function SwordMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true" className={styles.mark}>
      <rect x="5" y="0" width="2" height="2" fill="currentColor" />
      <rect x="4" y="1" width="1" height="1" fill="currentColor" />
      <rect x="3" y="2" width="1" height="1" fill="currentColor" />
      <rect x="2" y="3" width="1" height="1" fill="currentColor" />
      <rect x="1" y="4" width="1" height="1" fill="currentColor" />
      <rect x="0" y="5" width="2" height="2" fill="currentColor" />
      <rect x="2" y="5" width="2" height="1" fill="currentColor" />
      <rect x="1" y="6" width="2" height="2" fill="currentColor" />
    </svg>
  );
}
function GemMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true" className={styles.mark}>
      <rect x="2" y="1" width="4" height="1" fill="currentColor" />
      <rect x="1" y="2" width="6" height="1" fill="currentColor" />
      <rect x="1" y="3" width="6" height="2" fill="currentColor" />
      <rect x="2" y="5" width="4" height="1" fill="currentColor" />
      <rect x="3" y="6" width="2" height="1" fill="currentColor" />
    </svg>
  );
}
