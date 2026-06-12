import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { biomes } from '../data/biomes';
import styles from './Biomes.module.css';

export function Biomes() {
  const [activeId, setActiveId] = useState(biomes[0]!.id);
  const active = biomes.find((b) => b.id === activeId)!;

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      {/* ── Banner ── */}
      <div className={styles.banner}>
        <div
          className={styles.bannerPhoto}
          style={{ background: `linear-gradient(135deg, ${active.palette.deep} 0%, ${active.palette.sky} 100%)` }}
        />
        <div className={styles.bannerWash} />
        <Header variant="photo" />
        <div className={styles.bannerBody}>
          <p className={styles.bannerCrumb}><a href="/#/">Home</a> › Biomes &amp; Bestiary</p>
          <h1 className={styles.bannerTitle}>Biomes &amp; <em>Bestiary</em></h1>
          <p className={styles.bannerLede}>
            Every environment, its mobs, and the loot worth farming.
          </p>
        </div>
      </div>

      {/* ── Biome tabs ── */}
      <section className={styles.section}>
        <div className={styles.biomeTabs} role="tablist">
          {biomes.map((b) => (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={b.id === activeId}
              className={`${styles.biomeTab} ${b.id === activeId ? styles.on : ''}`}
              style={{ '--bt-deep': b.palette.deep } as React.CSSProperties}
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
          {/* Header photo */}
          <div
            className={styles.bestiaryHead}
            style={{ background: `linear-gradient(135deg, ${active.palette.deep} 0%, ${active.palette.sky} 100%)` }}
          >
            <div className={styles.bestiaryHeadBody}>
              <span className={styles.bestiaryEyebrow}>Biome Guide</span>
              <h2 className={styles.bestiaryTitle}>{active.name}</h2>
              <p className={styles.bestiaryBlurb}>{active.blurb}</p>
              {active.hardmodeOnly && (
                <span className={styles.hardmodeTag}>Hardmode only</span>
              )}
            </div>
          </div>

          {/* Two-column body */}
          <div className={styles.bestiaryBody}>
            <div className={styles.bestiaryCol}>
              <div className={styles.bestiaryColTitle}>Enemies</div>
              <div className={styles.mobGrid}>
                {active.mobs.map((mob) => (
                  <div key={mob} className={styles.mobCard}>
                    <div className={styles.mobIcon} aria-hidden="true">⚔</div>
                    <span className={styles.mobName}>{mob}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.bestiaryCol}>
              <div className={styles.bestiaryColTitle}>Notable Items</div>
              <div className={styles.mobGrid}>
                {active.items.map((item) => (
                  <div key={item} className={styles.mobCard}>
                    <div className={styles.mobIcon} aria-hidden="true">✦</div>
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
