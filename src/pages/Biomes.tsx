import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { biomes } from '../data/biomes';
import styles from './Biomes.module.css';

const BASE = import.meta.env.BASE_URL;

export function Biomes() {
  const [activeId, setActiveId] = useState(biomes[0]!.id);
  const active = biomes.find((b) => b.id === activeId)!;
  const grad = `linear-gradient(135deg, ${active.palette.deep} 0%, ${active.palette.sky} 100%)`;

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      {/* ── Banner ── */}
      <div className={styles.banner}>
        <div
          className={styles.bannerPhoto}
          style={{ backgroundImage: `url(${BASE}hero/biomes.png)` }}
        />
        <div className={styles.dither} aria-hidden="true" />
        <div className={styles.bannerWash} />
        <Header variant="photo" />
        <div className={styles.bannerBody}>
          <p className={styles.bannerCrumb}>
            <a href="/#/">Home</a> <span className={styles.crumbSep}>/</span> Biomes &amp; Bestiary
          </p>
          <h1 className={styles.bannerTitle}>Biomes &amp; <em>Bestiary</em></h1>
          <p className={styles.bannerLede}>
            Every environment, its mobs, and the loot worth farming.
          </p>
        </div>
      </div>

      {/* ── Biome tabs ── */}
      <section className={styles.section}>
        <p className={styles.sectionKicker}>{'// Choose a biome'}</p>
        <div className={styles.biomeTabs} role="tablist" aria-label="Biome">
          {biomes.map((b) => (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={b.id === activeId}
              className={`${styles.biomeTab} ${b.id === activeId ? styles.on : ''}`}
              style={{ '--bt-deep': b.palette.deep, '--bt-mid': b.palette.mid } as React.CSSProperties}
              onClick={() => setActiveId(b.id)}
            >
              <div className={styles.biomeTabSwatch}>
                <span style={{ background: b.palette.sky }} />
                <span style={{ background: b.palette.mid }} />
                <span style={{ background: b.palette.deep }} />
              </div>
              <span className={styles.biomeTabName}>{b.name}</span>
              <div className={styles.biomeTabDanger} aria-label={`Danger level ${b.danger}/5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`${styles.pip} ${i < b.danger ? styles.pipOn : ''}`}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* ── Bestiary panel ── */}
        <div className={styles.bestiary}>
          {/* Header scene */}
          <div className={styles.bestiaryHead} style={{ background: grad }}>
            <div
              className={styles.bestiaryHeadImg}
              style={{ backgroundImage: `url(${BASE}biomes/${active.id}.png)` }}
              aria-hidden="true"
            />
            <div className={styles.bestiaryHeadWash} aria-hidden="true" />
            <div className={styles.bestiaryHeadBody}>
              <span className={styles.bestiaryEyebrow}>Biome Guide</span>
              <h2 className={styles.bestiaryTitle}>{active.name}</h2>
              <p className={styles.bestiaryBlurb}>{active.blurb}</p>
              <div className={styles.bestiaryMeta}>
                <span className={styles.dangerTag}>
                  Danger
                  <span className={styles.dangerTagPips}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`${styles.pip} ${i < active.danger ? styles.pipOn : ''}`} />
                    ))}
                  </span>
                </span>
                {active.hardmodeOnly && <span className={styles.hardmodeTag}>Hardmode only</span>}
              </div>
            </div>
          </div>

          {/* Two-column body */}
          <div className={styles.bestiaryBody}>
            <div className={styles.bestiaryCol}>
              <div className={styles.bestiaryColTitle}>Enemies</div>
              <div className={styles.mobGrid}>
                {active.mobs.map((mob) => (
                  <div key={mob} className={`${styles.mobCard} ${styles.enemy}`}>
                    <span className={styles.mobSlot} aria-hidden="true"><SwordMark /></span>
                    <span className={styles.mobName}>{mob}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.bestiaryCol}>
              <div className={styles.bestiaryColTitle}>Notable Items</div>
              <div className={styles.mobGrid}>
                {active.items.map((item) => (
                  <div key={item} className={`${styles.mobCard} ${styles.loot}`}>
                    <span className={styles.mobSlot} aria-hidden="true"><GemMark /></span>
                    <span className={styles.mobName}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* Tiny pixel-art markers (no emoji) */
function SwordMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
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
    <svg width="14" height="14" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="1" width="4" height="1" fill="currentColor" />
      <rect x="1" y="2" width="6" height="1" fill="currentColor" />
      <rect x="1" y="3" width="6" height="2" fill="currentColor" />
      <rect x="2" y="5" width="4" height="1" fill="currentColor" />
      <rect x="3" y="6" width="2" height="1" fill="currentColor" />
    </svg>
  );
}
