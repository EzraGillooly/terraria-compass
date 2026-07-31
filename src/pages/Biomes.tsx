import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BestiaryModal } from '../components/BestiaryModal/BestiaryModal';
import { biomes } from '../data/biomes';
import type { BiomeDef } from '../data/biomes';
import { bestiary, localSprite, type BestiaryEntry } from '../data/bestiary';
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

function ChipIcon({ entry, kind }: { entry: BestiaryEntry; kind: 'enemy' | 'loot' }) {
  const [broken, setBroken] = useState(false);
  if (broken) return <span className={`${styles.chipDot} ${kind === 'enemy' ? styles.enemy : styles.loot}`} aria-hidden="true" />;
  return (
    <img
      className={`${styles.chipIcon} pixel-img`}
      src={localSprite(entry)}
      alt=""
      aria-hidden="true"
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

function Chip({ name, kind, onOpen }: { name: string; kind: 'enemy' | 'loot'; onOpen: (e: BestiaryEntry) => void }) {
  const entry = bestiary[name];
  const cls = `${styles.chip} pixel-frame pixel-hollow ${kind === 'enemy' ? styles.enemy : styles.loot}`;

  if (!entry) return <span className={cls}>{name}</span>;
  return (
    <button type="button" className={`${cls} ${styles.chipBtn}`} onClick={() => onOpen(entry)}>
      <ChipIcon entry={entry} kind={kind} />
      {name}
    </button>
  );
}

function BiomeBand({ biome, onOpen }: { biome: BiomeDef; onOpen: (e: BestiaryEntry) => void }) {
  const gradient = `linear-gradient(135deg, ${biome.palette.deep} 0%, ${biome.palette.sky} 100%)`;

  return (
    <article className={styles.band}>
      <div className={styles.art} style={{ background: gradient }}>
        <img
          src={`${BASE}biomes/${biome.id}.webp`}
          alt=""
          aria-hidden="true"
          className={styles.artImg}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.stage !== 'png') { img.dataset.stage = 'png'; img.src = `${BASE}biomes/${biome.id}.png`; return; }
            img.style.display = 'none';
          }}
        />
        <div className={styles.artWash} aria-hidden="true" />
        <div className={styles.artText}>
          <h2 className={styles.bandName}>
            {biome.name}
            {biome.hardmodeOnly && <span className={`${styles.hmTag} pixel-frame`}>Hardmode</span>}
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
            Each biome, its enemies, and its notable drops.
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
